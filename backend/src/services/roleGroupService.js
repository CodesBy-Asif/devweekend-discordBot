const { Config, Clan } = require('../models');
const { getGuildId } = require('../utils/guildId');

let botInstance = null;

function setBot(bot) {
    botInstance = bot;
}

async function syncMainRoles() {
    if (!botInstance?.client) {
        console.warn('⚠️ Bot not ready for role sync');
        return;
    }

    const guildId = getGuildId(); // Used for Discord API only
    const config = await Config.findOne();

    if (!config?.mainRoleId) {
        // No main role configured
        return;
    }

    const clans = await Clan.find({ enabled: true });
    const clanRoleIds = clans.map(c => c.roleId).filter(Boolean);

    if (clanRoleIds.length === 0) {
        // No clan roles configured
        return;
    }

    try {
        const guild = await botInstance.client.guilds.fetch(guildId);
        const members = await guild.members.fetch();

        let added = 0;
        let removed = 0;

        for (const [, member] of members) {
            if (member.user.bot) continue;

            const hasClanRole = clanRoleIds.some(roleId => member.roles.cache.has(roleId));
            const hasMainRole = member.roles.cache.has(config.mainRoleId);

            if (hasClanRole && !hasMainRole) {
                try {
                    await member.roles.add(config.mainRoleId, 'Role Group Sync: Has clan role');
                    added++;
                } catch (err) {
                    console.warn(`Failed to add main role to ${member.user.tag}:`, err.message);
                }
            } else if (!hasClanRole && hasMainRole) {
                try {
                    await member.roles.remove(config.mainRoleId, 'Role Group Sync: No clan role');
                    removed++;
                } catch (err) {
                    console.warn(`Failed to remove main role from ${member.user.tag}:`, err.message);
                }
            }
        }

        // Role Group Sync complete
        return { added, removed };
    } catch (error) {
        console.error('Role Group Sync failed:', error);
        throw error;
    }
}

module.exports = {
    setBot,
    syncMainRoles
};
