const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const Config = require('../../models/Config');
const Clan = require('../../models/Clan');

const temporaryChannels = new Map(); // Store creator ID -> Channel ID

async function handle(oldState, newState, bot) {
    const member = newState.member;
    const guild = newState.guild;

    // 1. Check if user Joined a channel
    if (newState.channelId && !oldState.channelId) {
        await handleJoin(newState, member, guild);
    }
    // 2. Check if user Switched channels
    else if (newState.channelId && oldState.channelId && newState.channelId !== oldState.channelId) {
        await handleJoin(newState, member, guild);
        await handleLeave(oldState, member, guild);
    }
    // 3. Check if user Left a channel
    else if (!newState.channelId && oldState.channelId) {
        await handleLeave(oldState, member, guild);
    }
}

async function handleJoin(state, member, guild) {
    try {
        console.log(`[VoiceDebug] User ${member.user.tag} joined ${state.channelId}`);
        const config = await Config.findOne();
        if (!config || !config.joinToCreateChannelId || !config.tempVoiceCategoryId) {
            console.log('[VoiceDebug] Config missing or incomplete');
            return;
        }

        // Check if joined "Join to Create"
        if (state.channelId !== config.joinToCreateChannelId) {
            // console.log('[VoiceDebug] Not Join-to-Create channel');
            return;
        }

        console.log('[VoiceDebug] User joined Join-to-Create channel');

        // Get User's Clan Roles
        // We need to fetch all clans to compare IDs
        const clans = await Clan.find({ enabled: true });

        const userClanRoles = clans.filter(clan => member.roles.cache.has(clan.roleId));
        console.log(`[VoiceDebug] User has ${userClanRoles.length} clan roles`);

        if (userClanRoles.length === 0) {
            console.log('[VoiceDebug] No clan roles found');
            // No clan role, maybe kick or just ignore?
            // For now, ignore. They just sit in the channel.
            return;
        }

        let targetClan = null;

        if (userClanRoles.length === 1) {
            targetClan = userClanRoles[0];
            console.log(`[VoiceDebug] Creating channel for single clan: ${targetClan.name}`);
            await createTempChannel(guild, member, targetClan, config.tempVoiceCategoryId);
        } else {
            // Multiple roles - Send DM
            console.log('[VoiceDebug] Multiple clans, sending DM');
            await sendClanSelectionDM(member, userClanRoles, guild.id);
        }

    } catch (error) {
        console.error('Error in handleJoin:', error);
    }
}

async function handleLeave(state, member, guild) {
    // Check if channel is temporary and empty
    // We check if the channel name follows pattern or if we track it
    // Simple check: Is it empty and in the temp category?
    try {
        const channel = state.channel;
        const config = await Config.findOne();

        if (!config || !config.tempVoiceCategoryId) return;

        if (channel.name.endsWith(' Clan Meet')) {
            if (channel.members.size === 0) {
                // Wait a few seconds to avoid race conditions?
                // Usually instant delete is fine for temp voice
                try {
                    await channel.delete('Temp channel empty');
                } catch (err) {
                    // Ignore "Unknown Channel" error if it was already deleted
                    if (err.code !== 10003) throw err;
                }
            }
        }
    }
    catch (error) {
        console.error('Error in handleLeave:', error);
    }
}

async function createTempChannel(guild, member, clan, categoryId) {
    try {
        console.log(`[VoiceDebug] createTempChannel for ${clan.name}`);
        const channelName = `${clan.name} Clan Meet`;

        // Check permissions
        // @everyone: Deny View
        // Clan Role: Allow View, Connect
        // Member: Allow Move, Mute members?

        const existing = guild.channels.cache.find(c => c.name === channelName && c.parentId === categoryId);
        if (existing) {
            console.log('[VoiceDebug] Found existing channel, moving user');
            // Channel already exists, just move user
            await member.voice.setChannel(existing);
            return;
        }

        console.log('[VoiceDebug] Creating new channel');
        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: categoryId,
            permissionOverwrites: [
                {
                    id: guild.id, // @everyone
                    deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
                },
                {
                    id: clan.roleId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
                },
                {
                    id: member.id,
                    allow: [PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers],
                }
            ]
        });

        console.log(`[VoiceDebug] Channel created: ${channel.id}`);

        // Only move member if they are already in a voice channel
        if (member.voice.channel) {
            console.log('[VoiceDebug] Moving user to new channel');
            await member.voice.setChannel(channel);
        } else {
            console.log('[VoiceDebug] User not in voice, NOT moving');
            // Optional: Notify user to join? 
            // Since this might be triggered by a button interaction, the interaction handler can reply.
            // But this specific function is just for creation logic.
        }

    } catch (error) {
        console.error('Failed to create temp channel:', error);
    }
}

async function sendClanSelectionDM(member, clans, guildId) {
    try {
        const select = new StringSelectMenuBuilder()
            .setCustomId(`cls_${guildId}`) // Embed guildId to know where to act
            .setPlaceholder('Select a clan to meet with')
            .addOptions(
                clans.map(clan =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(clan.name)
                        .setValue(clan._id.toString())
                        .setDescription(`Start a meet for ${clan.name}`)
                )
            );

        const row = new ActionRowBuilder().addComponents(select);

        const embed = new EmbedBuilder()
            .setTitle('Select Clan Meeting')
            .setDescription('You have multiple clan roles. Which clan would you like to start a meeting for?')
            .setColor(0x5865F2);

        await member.send({ embeds: [embed], components: [row] });

    } catch (error) {
        console.error('Failed to send DM:', error);
        // Fallback or just log
    }
}

module.exports = { handle, createTempChannel };
