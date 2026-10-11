const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resumes');
const profileRoutes = require('./routes/profile');
const templateRoutes = require('./routes/templates');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume-builder';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);

app.get('/api', (req, res) => res.json({ message: 'Resume API running' }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
