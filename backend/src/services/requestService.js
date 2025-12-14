const { Request, Mentee, Clan } = require('../models');
const logService = require('./logService');
const bot = require('../bot');
const { getGuildId } = require('../utils/guildId');

async function listRequests() {
    const requests = await Request.find({})
        .populate('menteeId')
        .populate('clanId')
        .sort({ createdAt: -1 });
    return requests;
}

async function processRequest(id, action, adminUser) {
    const request = await Request.findOne({ _id: id });
    if (!request) throw new Error('Request not found');

    if (request.status !== 'pending_approval') {
        throw new Error('Request is not pending approval');
    }

    const clan = await Clan.findById(request.clanId);
    if (!clan) throw new Error('Clan not found');

    if (action === 'approve') {
        await approveRequest(request, clan, adminUser);
    } else if (action === 'reject') {
        await rejectRequest(request, adminUser);
    } else {
        throw new Error('Invalid action');
    }

    return request;
}

async function approveRequest(request, clan, adminUser) {
    try {
        const guildId = getGuildId(); // Used for Discord API only
        const guild = await bot.client.guilds.fetch(guildId);
        const member = await guild.members.fetch(request.discordId);

        await member.roles.add(request.roleId);

        request.status = 'approved';
        request.verifiedAt = new Date();
        request.roleAssigned = true;
        await request.save();

        await Mentee.findByIdAndUpdate(request.menteeId, {
            status: 'verified',
            emailVerified: true,
            verifiedAt: new Date()
        });

        await member.send(`✅ **Congratulations!**\n\nYour request to join **${clan.name}** has been approved! 🎉\nYou have been given the clan role.`);

        await logService.log('REQUEST_APPROVE', adminUser, `Approved request for ${request.menteeId?.email}`);

    } catch (error) {
        console.error('Approval error:', error);
        throw new Error('Failed to approve request: ' + error.message);
    }
}

async function rejectRequest(request, adminUser) {
    try {
        const guildId = getGuildId(); // Used for Discord API only
        const guild = await bot.client.guilds.fetch(guildId);
        const member = await guild.members.fetch(request.discordId);

        request.status = 'rejected';
        await request.save();

        const clanName = request.clanId?.name || 'Unknown Clan';
        await member.send(`❌ **Request Update**\n\nYour request to join **${clanName}** was declined by an administrator.`);

        await logService.log('REQUEST_REJECT', adminUser, `Rejected request for ${request.menteeId?.email}`);

    } catch (error) {
        console.error('Rejection error:', error);
        throw new Error('Failed to reject request: ' + error.message);
    }
}

async function exportCsv() {
    const requests = await Request.find({})
        .populate('menteeId')
        .populate('clanId')
        .sort({ createdAt: -1 });

    const header = 'discordUsername,email,clanName,status,createdAt,verifiedAt\n';
    const rows = requests.map(r => [
        r.discordUsername,
        r.menteeId?.email || '',
        r.clanId?.name || '',
        r.status,
        r.createdAt,
        r.verifiedAt || ''
    ].join(',')).join('\n');
    return header + rows;
}

module.exports = {
    listRequests,
    processRequest,
    exportCsv
};
