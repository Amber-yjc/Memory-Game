const express = require('express');
const playerController = require('../controllers/players');
const router = express.Router();

router.get('/leaderBoard', playerController.getTop5Users);

router.post('/summary/addRecord', playerController.postAddUsers);

module.exports = router;
