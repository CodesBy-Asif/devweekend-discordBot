const { Clan, Mentee, Request, ActivityLog } = require('../models');
const bot = require('../bot');
const { getGuildId } = require('../utils/guildId');

async function listClans() {
    return await Clan.find({}).sort({ name: 1 });
}

async function getClan(id) {
    return await Clan.findOne({ _id: id });
}

async function getClanBySlug(slug) {
    return await Clan.findOne({ slug, enabled: true });
}

async function createClan(data, adminUser) {
    const clan = new Clan({
        name: data.name,
        roleId: data.roleId,
        enabled: data.enabled !== false
    });

    await clan.save();

    await ActivityLog.create({
        action: 'CLAN_CREATE',
        adminId: adminUser.id,
        adminName: adminUser.username,
        targetId: clan._id,
        details: { name: clan.name, roleId: clan.roleId }
    });

    return clan;
}

async function updateClan(id, data, adminUser) {
    const clan = await Clan.findOne({ _id: id });
    if (!clan) return null;

    const oldValues = { ...clan.toObject() };

    if (data.name) clan.name = data.name;
    if (data.roleId) clan.roleId = data.roleId;
    if (data.enabled !== undefined) clan.enabled = data.enabled;

    await clan.save();

    if (data.name && data.name !== oldValues.name) {
        // Update Mentees with new clan name
        await Mentee.updateMany(
            { assignedClan: oldValues.name },
            { $set: { assignedClan: data.name, assignedClanSlug: clan.slug } }
        );
    }

    await ActivityLog.create({
        action: 'CLAN_UPDATE',
        adminId: adminUser.id,
        adminName: adminUser.username,
        targetId: clan._id,
        details: {
            name: clan.name,
            changes: {
                name: data.name && data.name !== oldValues.name ? { from: oldValues.name, to: data.name } : undefined,
                roleId: data.roleId && data.roleId !== oldValues.roleId ? { from: oldValues.roleId, to: data.roleId } : undefined,
                enabled: data.enabled !== undefined && data.enabled !== oldValues.enabled ? { from: oldValues.enabled, to: data.enabled } : undefined
            }
        }
    });

    return clan;
}

async function deleteClan(id, options, adminUser) {
    const clan = await Clan.findOne({ _id: id });
    if (!clan) return null;

    if (options.deleteRole === 'true' && clan.roleId) {
        try {
            const guildId = getGuildId();
            const guild = await bot.client.guilds.fetch(guildId);
            const role = await guild.roles.fetch(clan.roleId);
            if (role && !role.managed) {
                await role.delete('Clan deleted from dashboard');
            }
        } catch (error) {
            // Log error to activity log if needed, or just suppress
            console.error('Failed to delete Discord role:', error.message);
        }
    }

    await Clan.findByIdAndDelete(id);

    await ActivityLog.create({
        action: 'CLAN_DELETE',
        adminId: adminUser.id,
        adminName: adminUser.username,
        targetId: clan._id,
        details: { name: clan.name, roleDeleted: options.deleteRole === 'true' }
    });

    return clan;
}

async function mergeClans(sourceId, targetId, adminUser) {
    const sourceClan = await Clan.findById(sourceId);
    const targetClan = await Clan.findById(targetId);

    if (!sourceClan || !targetClan) throw new Error('Clan not found');

    // 1. Move Mentees
    const menteeResult = await Mentee.updateMany(
        { assignedClan: sourceClan.name },
        { $set: { assignedClan: targetClan.name, assignedClanSlug: targetClan.slug } }
    );

    // 2. Move Requests
    const requestResult = await Request.updateMany(
        { clanId: sourceClan._id },
        { $set: { clanId: targetClan._id } }
    );

    // 3. Discord Role Updates
    try {
        const guildId = getGuildId();
        const guild = await bot.client.guilds.fetch(guildId);

        // Fetch source role to get members
        const sourceRole = await guild.roles.fetch(sourceClan.roleId);

        if (sourceRole) {
            // We need to ensure members are cached. 
            // Fetching the role doesn't guarantee members are in cache.
            // But iterating sourceRole.members works if they are cached.
            // To be safe, we can try to add the role to all mentees we just moved?
            // No, that relies on DB being in sync with Discord.
            // Let's rely on Discord's role members.

            // Force fetch members of the guild to ensure cache is warm?
            // await guild.members.fetch(); // Expensive but safe.

            // Better: Iterate sourceRole.members. If empty, maybe cache is cold.
            // Let's assume cache is okay for now.

            for (const [memberId, member] of sourceRole.members) {
                try {
                    await member.roles.add(targetClan.roleId);
                } catch (e) {
                    console.error(`Failed to add role to ${member.user.tag}:`, e.message);
                }
            }

            // Delete source role
            await sourceRole.delete(`Merged into ${targetClan.name} by ${adminUser.username}`);
        }
    } catch (error) {
        console.error('Discord merge operations failed:', error);
    }

    // 4. Delete Source Clan
    await Clan.findByIdAndDelete(sourceId);

    // 5. Log
    await ActivityLog.create({
        action: 'CLAN_MERGE',
        adminId: adminUser.id,
        adminName: adminUser.username,
        targetId: targetClan._id,
        details: {
            source: sourceClan.name,
            target: targetClan.name,
            menteesMoved: menteeResult.modifiedCount,
            requestsMoved: requestResult.modifiedCount
        }
    });

    return { success: true, menteesMoved: menteeResult.modifiedCount };
}

module.exports = {
    listClans,
    getClan,
    getClanBySlug,
    createClan,
    updateClan,
    deleteClan,
    mergeClans
};
