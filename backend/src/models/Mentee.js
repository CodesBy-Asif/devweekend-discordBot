const mongoose = require('mongoose');
const { generateSlug } = require('../utils/slug');

const menteeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    assignedClan: { type: String, trim: true, required: true },
    assignedClanSlug: { type: String, lowercase: true },
    discordId: { type: String, default: null, sparse: true },
    discordUsername: { type: String, default: null },
    status: { type: String, enum: ['not_verified', 'otp_sent', 'verified'], default: 'not_verified' },
    emailVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null }
}, { timestamps: true });

menteeSchema.pre('save', function (next) {
    if (this.isModified('assignedClan') || !this.assignedClanSlug) {
        this.assignedClanSlug = generateSlug(this.assignedClan);
    }
    next();
});

menteeSchema.statics.generateSlug = generateSlug;

module.exports = mongoose.model('Mentee', menteeSchema);
