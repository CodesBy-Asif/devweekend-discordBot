const clanService = require('../services/clanService');

async function list(req, res) {
    try {
        const clans = await clanService.listClans();
        res.json(clans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function get(req, res) {
    try {
        const clan = await clanService.getClan(req.params.id);
        if (!clan) return res.status(404).json({ error: 'Clan not found' });
        res.json(clan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getBySlug(req, res) {
    try {
        const clan = await clanService.getClanBySlug(req.params.slug);
        if (!clan) return res.status(404).json({ error: 'Clan not found' });
        res.json(clan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function create(req, res) {
    try {
        const clan = await clanService.createClan(req.body, req.user);
        res.status(201).json(clan);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function update(req, res) {
    try {
        const clan = await clanService.updateClan(req.params.id, req.body, req.user);
        if (!clan) return res.status(404).json({ error: 'Clan not found' });
        res.json(clan);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function remove(req, res) {
    try {
        const clan = await clanService.deleteClan(req.params.id, req.query, req.user);
        if (!clan) return res.status(404).json({ error: 'Clan not found' });
        res.json({ message: 'Clan deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function merge(req, res) {
    try {
        const { targetClanId } = req.body;
        if (!targetClanId) return res.status(400).json({ error: 'Target clan ID is required' });

        const result = await clanService.mergeClans(req.params.id, targetClanId, req.user);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    list,
    get,
    getBySlug,
    create,
    update,
    delete: remove,
    merge
};
