const logService = require('../services/logService');
const { Mentee, ActivityLog } = require('../models');

async function list(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await logService.listLogs(req.query, page, limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function analytics(req, res) {
    try {
        const [total, verified, notVerified, otpSent] = await Promise.all([
            Mentee.countDocuments({}),
            Mentee.countDocuments({ status: 'verified' }),
            Mentee.countDocuments({ status: 'not_verified' }),
            Mentee.countDocuments({ status: 'otp_sent' })
        ]);

        const successRate = total > 0 ? Math.round((verified / total) * 100) : 0;

        const clanDistribution = await Mentee.aggregate([
            { $group: { _id: '$assignedClan', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const dailyVerifications = await Mentee.aggregate([
            { $match: { status: 'verified', updatedAt: { $gte: weekAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
        const weeklyVerifications = await Mentee.aggregate([
            { $match: { status: 'verified', updatedAt: { $gte: monthAgo } } },
            {
                $group: {
                    _id: { $isoWeek: '$updatedAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const recentActivity = await ActivityLog.find({})
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            mentees: {
                total,
                verified,
                active: notVerified + otpSent,
                successRate
            },
            clanDistribution: clanDistribution.map(c => ({
                name: c._id || 'Unassigned',
                count: c.count
            })),
            trends: {
                daily: dailyVerifications.map(d => ({ date: d._id, count: d.count })),
                weekly: weeklyVerifications.map(w => ({ week: w._id, count: w.count }))
            },
            recentActivity: recentActivity.map(log => ({
                id: log._id,
                action: log.action,
                adminName: log.adminName,
                details: log.details,
                createdAt: log.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    list,
    analytics
};
