const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch profile', error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name.trim();
    if (req.body.username) updates.username = req.body.username.trim().toLowerCase();
    if (req.body.email) updates.email = req.body.email.trim().toLowerCase();
    if (req.body.phone) updates.phone = req.body.phone.trim();
    if (req.body.age !== undefined) updates.age = Number(req.body.age) || undefined;

    if (req.body.password) {
      if (typeof req.body.password !== 'string' || req.body.password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    if (updates.email) {
      const existingUser = await User.findOne({ email: updates.email, _id: { $ne: req.user.id } });
      if (existingUser) return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Could not update profile', error: error.message });
  }
});

module.exports = router;
