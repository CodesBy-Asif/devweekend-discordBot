const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    discordId: { type: String, required: true, index: true },
    discordUsername: { type: String, required: true },
    menteeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentee', required: true },
    clanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clan', required: true },
    roleId: { type: String, required: true },
    verificationCode: { type: String, default: null },
    codeExpiresAt: { type: Date, default: null },
    status: { type: String, enum: ['otp_sent', 'verified', 'failed', 'expired'], default: 'otp_sent' },
    verifiedAt: { type: Date, default: null },
    roleAssigned: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 }
}, { timestamps: true });

requestSchema.methods.generateCode = function () {
    this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    return this.verificationCode;
};

requestSchema.methods.verifyCode = function (code) {
    this.attempts += 1;
    if (!this.verificationCode || !this.codeExpiresAt) return false;
    if (new Date() > this.codeExpiresAt) {
        this.status = 'expired';
        return false;
    }
    return this.verificationCode === code;
};

module.exports = mongoose.model('Request', requestSchema);
