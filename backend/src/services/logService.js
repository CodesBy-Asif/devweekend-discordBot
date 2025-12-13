const { ActivityLog } = require('../models');

async function listLogs(query, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = {};

    if (query.action) filter.action = query.action;
    if (query.admin) filter.adminName = { $regex: query.admin, $options: 'i' };

    const [logs, total] = await Promise.all([
        ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        ActivityLog.countDocuments(filter)
    ]);

    return {
        logs,
        pagination: {
            page,
            pages: Math.ceil(total / limit),
            total
        }
    };
}

module.exports = {
    listLogs
};
