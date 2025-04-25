const express = require('express');
const { saveGameData, getHistoryGame } = require('../controllers/memoryController');
const router = express.Router();

// Route to save game data
router.post('/save', saveGameData);

// Route get history game
router.post('/history-game', getHistoryGame);

module.exports = router;
