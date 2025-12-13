const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const { Mentee, Request, Clan, Config } = require('../../models');
const { createTempChannel } = require('../events/voiceStateUpdate');
const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

async function handle(interaction, bot) {
    const customId = interaction.customId;

    // Main request button
    if (customId === 'request_clan_role') {
        await handleRequestButton(interaction, bot);
    }
    // Enter OTP button
    else if (customId === 'enter_otp_button') {
        await handleEnterOtpButton(interaction, bot);
    }
    // Cancel request
    else if (customId === 'cancel_verification') {
        await handleCancelVerification(interaction, bot);
    }
}

async function handleRequestButton(interaction, bot) {
    try {
        const guildId = interaction.guild.id;
        const configuredGuildId = process.env.GUILD_ID;

        // Only serve the configured guild
        if (configuredGuildId && guildId !== configuredGuildId) {
            await interaction.reply({
                content: '❌ This bot is not configured for this server.',
                flags: 64
            });
            return;
        }

        // Check if user is already verified in THIS guild
        const existingMentee = await Mentee.findOne({
            discordId: interaction.user.id,
            status: 'verified'
        });

        if (existingMentee) {
            await interaction.reply({
                content: `✅ **You're already verified!**\n\nYou have the **${existingMentee.assignedClan}** role.\n\n_Each Discord account can only verify once per server._`,
                flags: 64
            });
            return;
        }

        // Check if there's a pending request in database for THIS guild
        const pendingRequest = await Request.findOne({
            discordId: interaction.user.id,
            status: 'otp_sent',
            codeExpiresAt: { $gt: new Date() }
        });

        if (pendingRequest) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('enter_otp_button')
                        .setLabel('Enter OTP Code')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🔑'),
                    new ButtonBuilder()
                        .setCustomId('cancel_verification')
                        .setLabel('Start Over')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.reply({
                content: `⏳ **You have a pending verification.**\n\nAn OTP was sent to \`${pendingRequest.email}\`.\nClick the button to enter your code, or start over.`,
                components: [row],
                flags: 64
            });
            return;
        }

        // Show email input modal
        const modal = new ModalBuilder()
            .setCustomId('email_modal')
            .setTitle('Verify Your Email');

        const emailInput = new TextInputBuilder()
            .setCustomId('email_input')
            .setLabel('Enter your registered email')
            .setPlaceholder('your.email@example.com')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);

        const actionRow = new ActionRowBuilder().addComponents(emailInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);

    } catch (error) {
        console.error('Error in request button:', error);
        await interaction.reply({
            content: '❌ An error occurred. Please try again.',
            flags: 64
        });
    }
}

async function handleEnterOtpButton(interaction, bot) {
    // Check for valid pending request in database
    const pendingRequest = await Request.findOne({
        discordId: interaction.user.id,
        status: 'otp_sent',
        codeExpiresAt: { $gt: new Date() }
    });

    if (!pendingRequest) {
        await interaction.reply({
            content: '❌ Your OTP has expired. Please click the verification button to start over.',
            flags: 64
        });
        return;
    }

    // Show OTP modal
    const modal = new ModalBuilder()
        .setCustomId('otp_modal')
        .setTitle('Enter Verification Code');

    const otpInput = new TextInputBuilder()
        .setCustomId('otp_input')
        .setLabel('6-Digit Code from Email')
        .setPlaceholder('123456')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMinLength(6)
        .setMaxLength(6);

    const actionRow = new ActionRowBuilder().addComponents(otpInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}

async function handleCancelVerification(interaction, bot) {
    // Delete pending request from database
    await Request.deleteMany({
        discordId: interaction.user.id,
        status: 'otp_sent'
    });

    // Reset mentee status if needed
    await Mentee.updateOne(
        { discordId: interaction.user.id, status: 'otp_sent' },
        { $set: { status: 'not_verified', discordId: null, discordUsername: null } }
    );

    await interaction.update({
        content: '✅ **Verification cancelled.** Click the button below to start over.',
        components: []
    });
}




module.exports = { handle };
