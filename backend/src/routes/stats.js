const express = require('express');
const router = express.Router();
const { Request, Clan } = require('../models');
const { authenticateToken } = require('./auth');

// Get dashboard stats
router.get('/', authenticateToken, async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now - 7 * 24 * 60 * 60 * 1000);

        // Total counts
        const totalRequests = await Request.countDocuments({});
        const pendingRequests = await Request.countDocuments({ status: 'otp_sent' });
        const approvedRequests = await Request.countDocuments({ status: 'verified' });
        const rejectedRequests = await Request.countDocuments({ status: { $in: ['failed', 'expired'] } });

        // Today's stats
        const requestsToday = await Request.countDocuments({ createdAt: { $gte: todayStart } });
        const approvedToday = await Request.countDocuments({
            status: 'verified',
            verifiedAt: { $gte: todayStart }
        });

        // This week
        const requestsThisWeek = await Request.countDocuments({ createdAt: { $gte: weekStart } });

        // Approval rate
        const approvalRate = totalRequests > 0
            ? Math.round((approvedRequests / (approvedRequests + rejectedRequests)) * 100)
            : 0;

        // Requests by clan
        const requestsByClan = await Request.aggregate([
            { $match: { status: 'verified' } },
            { $group: { _id: '$clanId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Populate clan names
        const clanIds = requestsByClan.map(r => r._id);
        const clans = await Clan.find({ _id: { $in: clanIds } }).select('name');
        const clanMap = clans.reduce((acc, c) => ({ ...acc, [c._id]: c.name }), {});

        const topClans = requestsByClan.map(r => ({
            name: clanMap[r._id] || 'Unknown',
            count: r.count
        }));

        // Recent requests
        const recentRequests = await Request.find({})
            .populate('clanId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totals: {
                requests: totalRequests,
                pending: pendingRequests,
                approved: approvedRequests,
                rejected: rejectedRequests
            },
            today: {
                requests: requestsToday,
                approved: approvedToday
            },
            thisWeek: {
                requests: requestsThisWeek
            },
            approvalRate,
            topClans,
            recentRequests: recentRequests.map(r => ({
                id: r._id,
                discordUsername: r.discordUsername,
                clan: r.clanId?.name || 'Unknown',
                status: r.status,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
