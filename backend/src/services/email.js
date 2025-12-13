const nodemailer = require('nodemailer');
const { Config } = require('../models');
const { getGuildId } = require('../utils/guildId');

class EmailService {
    constructor() {
        this.transporter = null;
    }

    async initialize() {
        // Fallback to Env
        const host = process.env.SMTP_HOST || 'smtp.gmail.com';
        const port = parseInt(process.env.SMTP_PORT || '587');
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!user || !pass) {
            console.warn('⚠️ SMTP Credentials not found in ENV. Email sending will be disabled.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host, port,
            secure: port === 465,
            auth: { user, pass }
        });

        console.log('📧 Email Service initialized');
    }

    async getEmailConfig() {
        try {
            const guildId = getGuildId();
            const config = await Config.findOne({ guildId });
            return {
                fromName: config?.emailFromName || 'DW AI',
                fromEmail: process.env.SMTP_USER || 'noreply@example.com',
                subject: config?.emailSubject || 'Your Verification Code: {{code}}',
                template: config?.emailTemplate || this.getDefaultTemplate()
            };
        } catch {
            return {
                fromName: 'DW AI',
                fromEmail: process.env.SMTP_USER || 'noreply@example.com',
                subject: 'Your Verification Code: {{code}}',
                template: this.getDefaultTemplate()
            };
        }
    }

    getDefaultTemplate() {
        return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #5865F2;">Verification Code</h2>
    <p>You requested to join <strong>{{clan}}</strong>.</p>
    <p>Your verification code is:</p>
    <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px;">
        {{code}}
    </div>
    <p>This code expires in <strong>10 minutes</strong>.</p>
    <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
</div>`;
    }

    async sendVerificationCode(email, code, clanName) {
        const emailConfig = await this.getEmailConfig();

        // Replace placeholders in subject and template
        const subject = emailConfig.subject
            .replace(/{{code}}/g, code)
            .replace(/{{clan}}/g, clanName);

        const html = emailConfig.template
            .replace(/{{code}}/g, code)
            .replace(/{{clan}}/g, clanName)
            .replace(/{{email}}/g, email);

        if (!this.transporter) {
            console.log(`📧 [DEV] Would send email to ${email}:`);
            console.log(`   Subject: ${subject}`);
            console.log(`   Code: ${code}`);
            return { success: true, dev: true };
        }

        try {
            await this.transporter.sendMail({
                from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
                to: email,
                subject,
                html
            });
            console.log(`📧 Email sent to ${email}`);
            return { success: true };
        } catch (error) {
            console.error('📧 Email send failed:', error);
            return { success: false, error: error.message };
        }
    }

    async sendApprovalNotification(email, clanName, approved) {
        const subject = approved
            ? `Welcome to ${clanName}!`
            : `${clanName} Request Update`;

        const html = approved
            ? `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #57F287;">🎉 Welcome!</h2>
                <p>Your request to join <strong>${clanName}</strong> has been approved!</p>
                <p>You should now have access to the exclusive channels and roles.</p>
            </div>`
            : `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ED4245;">Request Update</h2>
                <p>Unfortunately, your request to join <strong>${clanName}</strong> was not approved.</p>
                <p>If you believe this was a mistake, please contact a server administrator.</p>
            </div>`;

        if (!this.transporter) {
            console.log(`📧 [DEV] Would send ${approved ? 'approval' : 'rejection'} email to ${email}`);
            return { success: true, dev: true };
        }

        try {
            const emailConfig = await this.getEmailConfig();
            await this.transporter.sendMail({
                from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
                to: email,
                subject,
                html
            });
            return { success: true };
        } catch (error) {
            console.error('📧 Email send failed:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();
