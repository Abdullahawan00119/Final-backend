const express = require('express');
const {
  register,
  login,
  logout,
  getMe
} = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middleware/validate');

const router = express.Router();

const { authenticate } = require('../middleware/authenticate');

router.post('/register', ...registerValidator, validate, register);
router.post('/login', ...loginValidator, validate, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;
