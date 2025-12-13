const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { authenticateToken } = require('./auth');

router.get('/', authenticateToken, (req, res) => configController.get(req, res));
router.put('/', authenticateToken, (req, res) => configController.update(req, res));
router.post('/', authenticateToken, (req, res) => configController.update(req, res));
router.post('/bot/deploy-message', authenticateToken, (req, res) => configController.deployMessage(req, res));
router.post('/sync-roles', authenticateToken, (req, res) => configController.syncRoles(req, res));

module.exports = router;
