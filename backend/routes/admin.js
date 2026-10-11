const express = require('express');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.use(auth);
router.use(admin);

router.get('/resumes', async (req, res) => {
  try {
    const resumes = await Resume.find().populate('user', 'name email role').sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch admin resumes', error: error.message });
  }
});

module.exports = router;
