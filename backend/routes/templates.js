const express = require('express');
const Template = require('../models/Template');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch templates', error: error.message });
  }
});

module.exports = router;
