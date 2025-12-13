const { Client, GatewayIntentBits, Partials } = require('discord.js');
const SyncService = require('../services/syncService');
const roleGroupService = require('../services/roleGroupService');

class DiscordBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildVoiceStates
            ],
            partials: [
                Partials.User,
                Partials.GuildMember
            ]
        });

        // Sync service
        this.syncService = null;
    }

    async start() {
        // Load event handlers
        this.loadEvents();

        // Voice state update
        const voiceStateUpdate = require('./events/voiceStateUpdate');
        this.client.on('voiceStateUpdate', (oldState, newState) => voiceStateUpdate.handle(oldState, newState, this));

        // Login
        try {
            await this.client.login(process.env.DISCORD_TOKEN);
            console.log(`🤖 Bot logged in as ${this.client.user.tag}`);
        } catch (error) {
            if (error.message.includes('disallowed intents')) {
                console.error('\n❌ INTENTS ERROR: You must enable privileged intents in Discord Developer Portal:');
                console.error('   1. Go to https://discord.com/developers/applications');
                console.error('   2. Select your app → Bot → Privileged Gateway Intents');
                console.error('   3. Enable: SERVER MEMBERS INTENT');
                console.error('   4. Save and restart the bot\n');
            }
            throw error;
        }
    }


    loadEvents() {
        // Ready event
        this.client.once('ready', () => {
            console.log(`✅ Discord bot ready! Serving ${this.client.guilds.cache.size} guilds`);

            // Initialize role group service with bot reference
            roleGroupService.setBot(this);

            // Start sync service
            this.syncService = new SyncService(this);
            this.syncService.start();
        });

        // Interaction handler (buttons, modals, selects)
        this.client.on('interactionCreate', async (interaction) => {
            try {
                await this.handleInteraction(interaction);
            } catch (error) {
                console.error('Interaction error:', error);
                const reply = { content: '❌ An error occurred. Please try again.', ephemeral: true };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(reply);
                } else {
                    await interaction.reply(reply);
                }
            }
        });

    }

    async handleInteraction(interaction) {
        // Defer loading of handlers to avoid circular dependencies
        const buttonHandler = require('./handlers/buttonHandler');
        const modalHandler = require('./handlers/modalHandler');
        const selectHandler = require('./handlers/selectHandler');
        if (interaction.isButton()) {
            await buttonHandler.handle(interaction, this);
        } else if (interaction.isModalSubmit()) {
            await modalHandler.handle(interaction, this);
        } else if (interaction.isStringSelectMenu()) {
            await selectHandler.handle(interaction, this);
        }
    }
}

module.exports = new DiscordBot();
