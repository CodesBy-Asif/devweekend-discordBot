const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    requestChannelId: { type: String, default: null },
    requestMessageId: { type: String, default: null },
    logChannelId: { type: String, default: null },
    tempVoiceCategoryId: { type: String, default: null },
    joinToCreateChannelId: { type: String, default: null },
    mainRoleId: { type: String, default: null },
    embed: {
        title: { type: String, default: 'Verified Clans & Communities' },
        description: { type: String, default: 'Prove you belong to one of our partner universities, companies, or clans to get exclusive roles and channels.\n\nClick the button below to start.' },
        color: { type: Number, default: 0x00ff00 }
    },
    button: {
        label: { type: String, default: 'Request Clan Role' },
        emoji: { type: String, default: '🔒' }
    },
    emailFromName: { type: String, default: 'Dev Weekends' },
    emailSubject: { type: String, default: 'Your Verification Code: {{code}}' },
    emailTemplate: {
        type: String,
        default: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #5865F2;">Verification Code</h2>
    <p>You requested to join <strong>{{clan}}</strong>.</p>
    <p>Your verification code is:</p>
    <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px;">{{code}}</div>
    <p>This code expires in <strong>10 minutes</strong>.</p>
    <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
</div>`
    },
    // Dynamic System Config
    // Dynamic System Config - REMOVED
}, { timestamps: true });

// Singleton config
configSchema.statics.get = async function () {
    let config = await this.findOne();
    if (!config) config = await this.create({});
    return config;
};

module.exports = mongoose.model('Config', configSchema);
