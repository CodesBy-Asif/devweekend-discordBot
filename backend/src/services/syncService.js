const { Mentee, Clan, Request } = require('../models');
const { getGuildId } = require('../utils/guildId');

class SyncService {
    constructor(bot) {
        this.bot = bot;
        this.syncInterval = null;
    }

    start() {
        // Sync service started

        // Run initial sync after 10 seconds
        setTimeout(() => this.runFullSync(), 10000);

        // Schedule daily sync at midnight
        this.scheduleNextSync();
    }

    scheduleNextSync() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        // Next sync scheduled

        this.syncInterval = setTimeout(() => {
            this.runFullSync();
            this.scheduleNextSync();
        }, msUntilMidnight);
    }

    async runFullSync() {
        // Starting full sync
        const startTime = Date.now();

        try {
            await this.syncDiscordRoles();
            await this.cleanupOldRequests();

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            // Full sync completed
        } catch (error) {
            console.error('❌ Sync failed:', error);
        }
    }

    // Cleanup old requests (older than 24 hours)
    async cleanupOldRequests() {
        // Cleaning up old requests
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // Delete failed, expired, or verified requests older than 24h
            const result = await Request.deleteMany({
                updatedAt: { $lt: oneDayAgo },
                status: { $in: ['verified', 'failed', 'expired'] }
            });

            if (result.deletedCount > 0) {
                // Deleted old requests
            }
        } catch (error) {
            console.error('    Failed to cleanup requests:', error.message);
        }
    }

    // Ensure verified mentees have their Discord roles
    async syncDiscordRoles() {
        // Syncing Discord roles

        if (!this.bot?.client?.isReady()) {
            return;
        }

        try {
            const guildId = getGuildId();
            const guild = this.bot.client.guilds.cache.get(guildId);

            if (!guild) {
                console.error(`❌ Sync Error: Bot is not in configured guild (${guildId})`);
                return;
            }

            let totalAdded = 0;

            // Get all enabled clans for this guild
            const clans = await Clan.find({ guildId, enabled: true });

            for (const clan of clans) {
                if (!clan.roleId) continue;

                // Get verified mentees for this clan (using slug match)
                const verifiedMentees = await Mentee.find({
                    assignedClanSlug: clan.slug,
                    status: 'verified',
                    discordId: { $ne: null }
                });

                // Ensure each verified mentee has the role
                for (const mentee of verifiedMentees) {
                    try {
                        const member = await guild.members.fetch(mentee.discordId);
                        if (!member.roles.cache.has(clan.roleId)) {
                            await member.roles.add(clan.roleId, 'Daily sync - missing role');
                            totalAdded++;
                            // Added missing role
                        }
                    } catch (error) {
                        // Member might not be in server
                    }
                }
            }
        } catch (error) {
            console.error(`    Failed to sync guild:`, error.message);
        }

        // Added missing roles
    }

    stop() {
        if (this.syncInterval) {
            clearTimeout(this.syncInterval);
            // Sync service stopped
        }
    }
}

module.exports = SyncService;
