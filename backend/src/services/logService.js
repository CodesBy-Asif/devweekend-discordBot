const { Config } = require('../models');
const { EmbedBuilder } = require('discord.js');

let botInstance = null;

function setBot(bot) {
    botInstance = bot;
}

async function log(action, adminUser, details) {
    try {
        if (!botInstance?.client) return;

        const config = await Config.findOne();
        if (!config?.logChannelId) return;

        const channel = await botInstance.client.channels.fetch(config.logChannelId).catch(() => null);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle(`Action: ${formatAction(action)}`)
            .setColor(getColorForAction(action))
            .setTimestamp()
            .addFields(
                { name: 'User', value: adminUser?.name || adminUser?.username || 'System', inline: true },
                { name: 'Details', value: formatDetails(details) || 'None' }
            );

        await channel.send({ embeds: [embed] });

    } catch (error) {
        console.error('Failed to log to Discord:', error.message);
    }
}

function formatAction(action) {
    return action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function getColorForAction(action) {
    if (action.includes('DELETE')) return 0xFF0000; // Red
    if (action.includes('UPDATE')) return 0xFFA500; // Orange
    if (action.includes('CREATE')) return 0x00FF00; // Green
    return 0x3498DB; // Blue
}

function formatDetails(details) {
    if (typeof details === 'string') return details;
    if (!details) return '';

    return Object.entries(details)
        .map(([key, value]) => `**${key}**: ${value}`)
        .join('\n');
}

module.exports = {
    setBot,
    log
};
