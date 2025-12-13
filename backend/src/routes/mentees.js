const express = require('express');
const router = express.Router();
const multer = require('multer');
const menteeController = require('../controllers/menteeController');
const { authenticateToken } = require('./auth');

// Configure multer for file upload (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

router.get('/', authenticateToken, (req, res) => menteeController.list(req, res));
router.get('/stats', authenticateToken, (req, res) => menteeController.stats(req, res));
router.post('/', authenticateToken, (req, res) => menteeController.create(req, res));
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => menteeController.upload(req, res));
router.post('/bulk-delete', authenticateToken, (req, res) => menteeController.bulkDelete(req, res));
router.delete('/:id', authenticateToken, (req, res) => menteeController.delete(req, res));
router.put('/:id', authenticateToken, (req, res) => menteeController.update(req, res));
router.post('/:id/unlink', authenticateToken, (req, res) => menteeController.unlink(req, res));
router.delete('/', authenticateToken, (req, res) => menteeController.clearAll(req, res));

module.exports = router;
