const express = require('express');
const router = express.Router();
const bot = require('../bot');
const { authenticateToken } = require('./auth');
const { getGuildId } = require('../utils/guildId');

// Get roles from the configured guild
router.get('/roles', authenticateToken, async (req, res) => {
    try {
        const guildId = getGuildId();

        // Get guild from bot's cache
        const guild = bot.client.guilds.cache.get(guildId);

        if (!guild) {
            return res.status(404).json({ error: 'Guild not found. Make sure the bot is in this server.' });
        }

        // Fetch all roles
        const roles = await guild.roles.fetch();

        // Filter and format roles
        const formattedRoles = roles
            .filter(role =>
                role.id !== guild.id && // Exclude @everyone (same ID as guild)
                !role.managed // Exclude bot-managed roles
            )
            .sort((a, b) => b.position - a.position) // Sort by position (highest first)
            .map(role => ({
                id: role.id,
                name: role.name,
                color: role.hexColor,
                position: role.position
            }));

        res.json(formattedRoles);
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get channels from the configured guild
router.get('/channels', authenticateToken, async (req, res) => {
    try {
        const guildId = getGuildId();

        const guild = bot.client.guilds.cache.get(guildId);

        if (!guild) {
            return res.status(404).json({ error: 'Guild not found. Make sure the bot is in this server.' });
        }

        // Fetch all channels
        const channels = await guild.channels.fetch();

        // Filter to text, voice, and categories
        const formattedChannels = channels
            .filter(channel => [0, 2, 4].includes(channel.type)) // 0=Text, 2=Voice, 4=Category
            .sort((a, b) => a.position - b.position)
            .map(channel => ({
                id: channel.id,
                name: channel.name,
                type: channel.type,
                position: channel.position,
                parentName: channel.parent?.name || null
            }));

        res.json(formattedChannels);
    } catch (error) {
        console.error('Failed to fetch channels:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a new role in the configured guild
router.post('/roles', authenticateToken, async (req, res) => {
    try {
        const guildId = getGuildId();
        const { name, color, hoist, mentionable } = req.body;

        const guild = bot.client.guilds.cache.get(guildId);

        if (!guild) {
            return res.status(404).json({ error: 'Guild not found. Make sure the bot is in this server.' });
        }

        // Create the role
        const role = await guild.roles.create({
            name: name || 'New Role',
            color: color || '#99aab5',
            hoist: hoist || false,
            mentionable: mentionable || false,
            reason: 'Created via dashboard'
        });

        res.status(201).json({
            id: role.id,
            name: role.name,
            color: role.hexColor,
            position: role.position
        });
    } catch (error) {
        console.error('Failed to create role:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a role from the configured guild
router.delete('/roles/:roleId', authenticateToken, async (req, res) => {
    try {
        const guildId = getGuildId();
        const { roleId } = req.params;

        const guild = bot.client.guilds.cache.get(guildId);

        if (!guild) {
            return res.status(404).json({ error: 'Guild not found.' });
        }

        const role = guild.roles.cache.get(roleId);

        if (!role) {
            return res.status(404).json({ error: 'Role not found.' });
        }

        if (role.managed) {
            return res.status(400).json({ error: 'Cannot delete bot-managed roles.' });
        }

        await role.delete('Deleted via dashboard');

        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Failed to delete role:', error);
        res.status(500).json({ error: error.message });
    }
});

// Sync roles for members
router.post('/roles/:roleId/sync', authenticateToken, async (req, res) => {
    try {
        const guildId = getGuildId();
        const { roleId } = req.params;
        const { memberIds, action } = req.body; // action: 'add' or 'remove'

        const guild = bot.client.guilds.cache.get(guildId);

        if (!guild) {
            return res.status(404).json({ error: 'Guild not found.' });
        }

        const role = guild.roles.cache.get(roleId);

        if (!role) {
            return res.status(404).json({ error: 'Role not found.' });
        }

        let successCount = 0;
        let failCount = 0;

        for (const memberId of memberIds) {
            try {
                const member = await guild.members.fetch(memberId);
                if (action === 'add') {
                    await member.roles.add(role, 'Role sync from dashboard');
                } else if (action === 'remove') {
                    await member.roles.remove(role, 'Role sync from dashboard');
                }
                successCount++;
            } catch (err) {
                failCount++;
                console.error(`Failed to update role for member ${memberId}:`, err.message);
            }
        }

        res.json({
            message: `Role sync complete`,
            success: successCount,
            failed: failCount
        });
    } catch (error) {
        console.error('Failed to sync roles:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get guild info (for dashboard header)
router.get('/guild', authenticateToken, async (req, res) => {
    try {
        const guildId = getGuildId();
        const guild = bot.client.guilds.cache.get(guildId);

        if (!guild) {
            return res.status(404).json({ error: 'Guild not found.' });
        }

        res.json({
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL({ size: 64 }),
            memberCount: guild.memberCount
        });
    } catch (error) {
        console.error('Failed to fetch guild:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
