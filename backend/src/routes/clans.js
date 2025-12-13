const express = require('express');
const router = express.Router();
const clanController = require('../controllers/clanController');
const { authenticateToken } = require('./auth');

router.get('/', authenticateToken, (req, res) => clanController.list(req, res));
router.get('/:id', authenticateToken, (req, res) => clanController.get(req, res));
router.post('/', authenticateToken, (req, res) => clanController.create(req, res));
router.put('/:id', authenticateToken, (req, res) => clanController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => clanController.delete(req, res));
router.get('/slug/:slug', authenticateToken, (req, res) => clanController.getBySlug(req, res));
router.post('/:id/merge', authenticateToken, (req, res) => clanController.merge(req, res));

module.exports = router;
