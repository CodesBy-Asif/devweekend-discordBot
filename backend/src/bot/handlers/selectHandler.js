const { Clan, Config } = require('../../models');
const { createTempChannel } = require('../events/voiceStateUpdate');

async function handle(interaction, bot) {
    // Check ID pattern cls_{guildId}
    if (!interaction.customId.startsWith('cls_')) return;

    try {
        await interaction.deferUpdate();

        const guildId = interaction.customId.split('_')[1];
        const clanId = interaction.values[0];
        const userId = interaction.user.id;

        const guild = await bot.client.guilds.fetch(guildId);
        if (!guild) return;

        const member = await guild.members.fetch(userId);
        if (!member) return;

        const clan = await Clan.findById(clanId);
        if (!clan) return;

        const config = await Config.findOne();
        if (!config || !config.tempVoiceCategoryId) {
            await interaction.followUp({ content: 'Voice configuration not found on server.', flags: 64 });
            return;
        }

        // Create channel
        await createTempChannel(guild, member, clan, config.tempVoiceCategoryId);

        await interaction.editReply({ content: `✅ Started meeting for **${clan.name}**. Check the server!`, components: [] });

    } catch (error) {
        console.error('Select menu error:', error);
    }
}

module.exports = { handle };
