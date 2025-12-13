const menteeService = require('../services/menteeService');

async function list(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const result = await menteeService.listMentees(req.query, page, limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function stats(req, res) {
    try {
        const stats = await menteeService.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function create(req, res) {
    try {
        const { name, email, assignedClan } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const mentee = await menteeService.createMentee({ name, email, assignedClan }, req.user);
        res.status(201).json(mentee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function upload(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No CSV file uploaded' });
        }
        const result = await menteeService.processCsvUpload(req.file.buffer, req.user);
        res.json({ message: 'CSV imported successfully', ...result });
    } catch (error) {
        console.error('CSV upload error:', error);
        res.status(400).json({ error: error.message });
    }
}

async function remove(req, res) {
    try {
        await menteeService.deleteMentee(req.params.id, req.user);
        res.json({ message: 'Mentee deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function update(req, res) {
    try {
        const mentee = await menteeService.updateMentee(req.params.id, req.body, req.user);
        if (!mentee) {
            return res.status(404).json({ error: 'Mentee not found' });
        }
        res.json(mentee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function bulkDelete(req, res) {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' });
        }
        const count = await menteeService.bulkDelete(ids, req.user);
        res.json({ message: 'Mentees deleted', deleted: count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function clearAll(req, res) {
    try {
        const count = await menteeService.clearAll(req.user);
        res.json({ message: 'All mentees deleted', deleted: count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function unlink(req, res) {
    try {
        const mentee = await menteeService.unlinkMentee(req.params.id, req.user);
        if (!mentee) {
            return res.status(404).json({ error: 'Mentee not found' });
        }
        res.json({ message: 'Account unlinked', mentee });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    list,
    stats,
    create,
    upload,
    delete: remove,
    update,
    bulkDelete,
    bulkDelete,
    clearAll,
    unlink
};
