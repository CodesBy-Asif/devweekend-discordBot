const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken } = require('./auth');

router.get('/', authenticateToken, (req, res) => requestController.list(req, res));
router.post('/:id/:action', authenticateToken, (req, res) => requestController.process(req, res));
router.get('/export', authenticateToken, (req, res) => requestController.export(req, res));

module.exports = router;
