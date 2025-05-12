const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  refreshToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res, next) => {
  console.log('Register route hit with body:', req.body);
  register(req, res, next);
});
router.post('/login', (req, res, next) => {
  console.log('Login route hit with body:', req.body);
  login(req, res, next);
});
router.get('/logout', protect, (req, res, next) => {
  console.log('Logout route hit for user:', req.user?._id);
  logout(req, res, next);
});
router.get('/me', protect, (req, res, next) => {
  console.log('GetMe route hit for user:', req.user?._id);
  getMe(req, res, next);
});
router.post('/refresh', (req, res, next) => {
  console.log('Refresh token route hit');
  refreshToken(req, res, next);
});

module.exports = router;