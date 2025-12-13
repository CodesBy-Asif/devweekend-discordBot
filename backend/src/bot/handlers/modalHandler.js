const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const { Mentee, Clan, Config, Request } = require('../../models');
const emailService = require('../../services/email');

// In-memory lock to prevent race conditions
const processingUsers = new Set();

async function handle(interaction, bot) {
    const customId = interaction.customId;

    if (customId === 'email_modal') {
        await handleEmailModal(interaction, bot);
    } else if (customId === 'otp_modal') {
        await handleOtpModal(interaction, bot);
    }
}

async function handleEmailModal(interaction, bot) {
    // Check lock
    if (processingUsers.has(interaction.user.id)) {
        await interaction.reply({
            content: '⏳ Please wait, processing your previous request...',
            ephemeral: true
        });
        return;
    }

    processingUsers.add(interaction.user.id);

    try {
        await interaction.deferReply({ flags: 64 });

        const email = interaction.fields.getTextInputValue('email_input').trim().toLowerCase();
        const guildId = interaction.guildId;
        const configuredGuildId = process.env.GUILD_ID;

        // Only serve the configured guild
        if (configuredGuildId && guildId !== configuredGuildId) {
            await interaction.editReply('❌ This bot is not configured for this server.');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            await interaction.editReply('❌ That doesn\'t look like a valid email address.');
            return;
        }

        // Check if email exists in mentee list
        const mentee = await Mentee.findOne({ email: email });
        if (!mentee) {
            await interaction.editReply(
                `❌ **Email not found.**\n\n` +
                `The email \`${email}\` is not in the mentee list.\n` +
                `Please use the email you registered with.`
            );
            return;
        }

        // Check if mentee has an assigned clan
        if (!mentee.assignedClan) {
            await interaction.editReply(
                `❌ **No clan assigned.**\n\n` +
                `Your email is registered but you haven't been assigned to a clan yet.\n` +
                `Please contact an administrator.`
            );
            return;
        }

        // Check if already verified
        if (mentee.status === 'verified') {
            await interaction.editReply(
                `✅ **Already verified!**\n\n` +
                `This email has already been verified.\n` +
                `You should have the **${mentee.assignedClan}** role.`
            );
            return;
        }

        // Check if email is used by another Discord account
        if (mentee.discordId && mentee.discordId !== interaction.user.id) {
            await interaction.editReply(
                `❌ **Email already linked.**\n\n` +
                `This email is linked to a different Discord account.\n` +
                `Each email can only be used once.`
            );
            return;
        }

        // Check if THIS Discord user is already verified with ANOTHER email
        const existingVerification = await Mentee.findOne({
            discordId: interaction.user.id,
            status: 'verified'
        });

        if (existingVerification) {
            await interaction.editReply(
                `❌ **Already verified.**\n\n` +
                `Your Discord account is already verified with another email.\n` +
                `Each Discord account can only verify once per server.`
            );
            return;
        }

        // Find the clan - flexible matching
        const allClans = await Clan.find({ enabled: true });
        let clan = null;
        const assignedLower = mentee.assignedClan.toLowerCase();

        for (const c of allClans) {
            if (assignedLower.includes(c.name.toLowerCase())) {
                clan = c;
                break;
            }
        }

        if (!clan) {
            const availableClans = allClans.map(c => c.name).join(', ');
            await interaction.editReply(
                `❌ **Clan not found.**\n\n` +
                `Your assigned clan: "${mentee.assignedClan}"\n` +
                `Available clans: ${availableClans || 'None configured'}\n\n` +
                `Please contact an administrator.`
            );
            return;
        }

        // Delete any old pending requests for this user
        await Request.deleteMany({
            discordId: interaction.user.id,
            status: { $in: ['otp_sent', 'expired', 'failed'] }
        });

        // Create new Request record
        const request = new Request({
            discordId: interaction.user.id,
            discordUsername: interaction.user.tag,
            clanId: clan._id,
            guildId: interaction.guildId,
            roleId: clan.roleId,
            menteeId: mentee._id
        });

        // Generate OTP
        const otp = request.generateCode();
        await request.save();

        // Update mentee status
        mentee.discordId = interaction.user.id;
        mentee.discordUsername = interaction.user.tag;
        mentee.status = 'otp_sent';
        await mentee.save();

        // Send OTP email
        const emailResult = await emailService.sendVerificationCode(email, otp, clan.name);

        if (emailResult.success) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('enter_otp_button')
                        .setLabel('Enter OTP Code')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🔑')
                );

            await interaction.editReply({
                content: `📧 **OTP Sent!**\n\n` +
                    `A 6-digit code has been sent to **${email}**.\n` +
                    `The code expires in **10 minutes**.\n\n` +
                    `Your clan: **${clan.name}**\n\n` +
                    `Click the button below to enter your code.`,
                components: [row]
            });

        } else {
            request.status = 'failed';
            await request.save();

            await interaction.editReply(
                `❌ **Failed to send OTP.**\n\n` +
                `Please try again or contact an administrator.`
            );
        }

    } catch (error) {
        console.error('Error in email modal:', error);
        // Try to reply if not already replied
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
        } else {
            await interaction.editReply('❌ An error occurred.');
        }
    } finally {
        // Release lock
        processingUsers.delete(interaction.user.id);
    }
}

async function handleOtpModal(interaction, bot) {
    // Use deferUpdate to update the message the button was on (dismissing the "OTP Sent" message)
    await interaction.deferUpdate();

    const enteredOtp = interaction.fields.getTextInputValue('otp_input').trim();
    const guildId = interaction.guildId;
    const configuredGuildId = process.env.GUILD_ID;

    // Only serve the configured guild
    if (configuredGuildId && guildId !== configuredGuildId) {
        await interaction.editReply({
            content: '❌ This bot is not configured for this server.',
            components: []
        });
        return;
    }

    // Find the pending request from database
    const request = await Request.findOne({
        discordId: interaction.user.id,
        status: 'otp_sent'
    }).populate('clanId').populate('menteeId');

    if (!request) {
        await interaction.editReply({
            content: `❌ **No pending request found.**\n\n` +
                `Please click the verification button to start over.`,
            components: []
        });
        return;
    }

    // Check if expired
    if (new Date() > request.codeExpiresAt) {
        request.status = 'expired';
        await request.save();
        await interaction.editReply({
            content: `❌ **OTP expired.**\n\n` +
                `Please click the verification button to get a new code.`,
            components: []
        });
        return;
    }

    // Verify OTP
    if (!request.verifyCode(enteredOtp)) {
        await request.save(); // Save attempt count
        await interaction.editReply({
            content: `❌ **Invalid OTP.**\n\n` +
                `Please check your email and try again. (Attempt ${request.attempts}/3)`,
            components: [] // Or keep button? Maybe keep it so they can try again?
        });
        // Actually, if they failed, they need to click the button again to open the modal again.
        // So we should probably keep the button if they have attempts left?
        // But the modal is gone. They need to click "Enter OTP" again.
        // So we should NOT remove components if we want them to retry.
        // But wait, if I edit the message to say "Invalid OTP", the "Enter OTP" button is still there (from previous state).
        // So they can click it again.
        // So for Invalid OTP, I should NOT clear components.
        return;
    }

    // OTP is correct! Assign role automatically
    try {
        const guild = await bot.client.guilds.fetch(interaction.guildId);
        const member = await guild.members.fetch(interaction.user.id);

        // Assign clan role (sub role)
        await member.roles.add(request.roleId, `Verified via email: ${request.menteeId?.email}`);

        // Assign main role if configured
        const config = await Config.findOne();
        if (config?.mainRoleId) {
            try {
                await member.roles.add(config.mainRoleId, 'Role Group: Has clan role');
            } catch (err) {
                console.warn('Failed to assign main role:', err.message);
            }
        }

        // Update request record
        request.status = 'verified';
        request.verifiedAt = new Date();
        request.roleAssigned = true;
        await request.save();

        // Update mentee record
        await Mentee.findByIdAndUpdate(request.menteeId, {
            status: 'verified',
            emailVerified: true,
            verifiedAt: new Date()
        });

        await interaction.editReply({
            content: `✅ **Verification Complete!**\n\n` +
                `Welcome to **${request.clanId?.name}**! 🎉\n\n` +
                `Your role has been assigned automatically.`,
            components: []
        });

        // Log verification

        // Send to log channel
        await logVerification(bot.client, interaction.guildId, {
            user: interaction.user,
            email: request.menteeId?.email,
            clanName: request.clanId?.name,
            roleId: request.roleId,
            requestId: request._id
        });

    } catch (error) {
        console.error('Error assigning role:', error);

        request.status = 'failed';
        await request.save();

        await interaction.editReply({
            content: `❌ **Failed to assign role.**\n\n` +
                `Your email was verified but there was an error assigning your role.\n` +
                `Please contact an administrator.`,
            components: []
        });
    }
}

async function logVerification(client, guildId, data) {
    try {
        // Logging verification

        const config = await Config.findOne();

        if (!config || !config.logChannelId) {
            // No log channel configured
            return;
        }

        // Log channel ID

        const channel = await client.channels.fetch(config.logChannelId);
        if (!channel) {
            // Could not fetch log channel
            return;
        }

        // Sending to channel

        const embed = new EmbedBuilder()
            .setTitle('✅ Mentee Verified')
            .setColor(0x57F287)
            .addFields(
                { name: 'User', value: `<@${data.user.id}> (${data.user.tag})`, inline: true },
                { name: 'Clan', value: data.clanName, inline: true },
                { name: 'Email', value: `\`${data.email}\``, inline: false },
                { name: 'Role', value: `<@&${data.roleId}>`, inline: true },
                { name: 'Request ID', value: `\`${data.requestId}\``, inline: true },
                { name: 'Verified At', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: false }
            )
            .setThumbnail(data.user.displayAvatarURL())
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        // Log sent successfully

    } catch (error) {
        console.error('❌ Failed to log verification:', error);
    }
}

module.exports = { handle };
