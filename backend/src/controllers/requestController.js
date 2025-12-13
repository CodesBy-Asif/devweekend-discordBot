const requestService = require('../services/requestService');

async function list(req, res) {
    try {
        const data = await requestService.listRequests();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function process(req, res) {
    try {
        const { action } = req.params;
        await requestService.processRequest(req.params.id, action, req.user);
        res.json({ message: `Request ${action}d successfully` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function exportCsv(req, res) {
    try {
        const csv = await requestService.exportCsv();
        res.header('Content-Type', 'text/csv');
        res.attachment('requests.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    list,
    process,
    export: exportCsv
};
