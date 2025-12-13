const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    adminId: { type: String, required: true },
    adminName: { type: String, required: true },
    targetId: { type: String, default: null },
    details: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
