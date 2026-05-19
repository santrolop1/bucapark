const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { register, login, getMe } = require('./controller');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);

module.exports = router;
