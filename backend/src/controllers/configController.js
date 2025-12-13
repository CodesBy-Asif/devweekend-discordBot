const configService = require('../services/configService');
const roleGroupService = require('../services/roleGroupService');

async function get(req, res) {
    try {
        const config = await configService.getConfig();
        res.json(config);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function update(req, res) {
    try {
        const config = await configService.updateConfig(req.body);
        res.json(config);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function deployMessage(req, res) {
    try {
        const { channelId } = req.body;

        if (!channelId) {
            return res.status(400).json({ error: 'Channel ID required' });
        }

        const result = await configService.deployMessage(channelId);
        res.json({ message: 'Message deployed', ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


async function syncRoles(req, res) {
    try {
        const result = await roleGroupService.syncMainRoles();
        res.json({ message: 'Role sync complete', ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    get,
    update,
    deployMessage,
    syncRoles
};
