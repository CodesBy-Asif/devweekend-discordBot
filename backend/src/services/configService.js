const { Config } = require('../models');
const bot = require('../bot');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function getConfig() {
    return await Config.get();
}

function buildMessagePayload(config) {
    const embed = new EmbedBuilder()
        .setTitle(config.embed?.title || 'Verified Clans & Communities')
        .setDescription(config.embed?.description || 'Prove you belong to one of our partner universities, companies, or clans to get exclusive roles and channels.\n\nClick the button below to start.')
        .setColor(config.embed?.color || 0x00ff00)
        .setFooter({ text: 'Secure Verification System' });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('request_clan_role')
                .setLabel(config.button?.label || 'Request Clan Role')
                .setStyle(ButtonStyle.Primary)
                .setEmoji(config.button?.emoji || '🔒')
        );

    return { embeds: [embed], components: [row] };
}

async function updateConfig(data) {
    const config = await getConfig();

    // Update fields
    if (data.logChannelId !== undefined) config.logChannelId = data.logChannelId;
    if (data.tempVoiceCategoryId !== undefined) config.tempVoiceCategoryId = data.tempVoiceCategoryId;
    if (data.joinToCreateChannelId !== undefined) config.joinToCreateChannelId = data.joinToCreateChannelId;
    if (data.mainRoleId !== undefined) config.mainRoleId = data.mainRoleId;
    if (data.embed) config.embed = { ...config.embed, ...data.embed };
    if (data.button) config.button = { ...config.button, ...data.button };
    if (data.emailFromName !== undefined) config.emailFromName = data.emailFromName;
    if (data.emailSubject !== undefined) config.emailSubject = data.emailSubject;
    if (data.emailTemplate !== undefined) config.emailTemplate = data.emailTemplate;

    await config.save();

    // Try to update existing Discord message if it exists
    if (config.requestChannelId && config.requestMessageId) {
        try {
            const channel = await bot.client.channels.fetch(config.requestChannelId);
            if (channel) {
                const message = await channel.messages.fetch(config.requestMessageId);
                if (message) {
                    await message.edit(buildMessagePayload(config));
                    console.log('✅ Updated existing verification panel message');
                }
            }
        } catch (error) {
            console.error('⚠️ Failed to auto-update Discord message:', error.message);
            // Don't fail the request, just log it
        }
    }

    return config;
}

async function deployMessage(channelId) {
    const config = await getConfig();
    const channel = await bot.client.channels.fetch(channelId);
    if (!channel) throw new Error('Channel not found');

    const permissions = channel.permissionsFor(bot.client.user);
    if (!permissions.has(['ViewChannel', 'SendMessages', 'EmbedLinks'])) {
        throw new Error('Bot missing permissions in that channel');
    }

    // Delete old message if it exists
    if (config.requestMessageId && config.requestChannelId) {
        try {
            const oldChannel = await bot.client.channels.fetch(config.requestChannelId);
            const oldMessage = await oldChannel.messages.fetch(config.requestMessageId);
            await oldMessage.delete();
        } catch (err) {
            console.log('Could not delete old message:', err.message);
        }
    }

    const payload = buildMessagePayload(config);
    const message = await channel.send(payload);

    config.requestChannelId = channelId;
    config.requestMessageId = message.id;
    await config.save();

    return { channelId, messageId: message.id, channelName: channel.name };
}

module.exports = {
    getConfig,
    updateConfig,
    deployMessage,
};
