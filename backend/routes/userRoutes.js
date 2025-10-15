import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import upload from '../config/cloudinaryConfig.js';
import auth from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ROUTE 1: Register a new user
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!password || password.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }
    user = new User({ email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ROUTE 2: Log in a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ROUTE 3: Upload a PDF (Protected Route)
router.post('/upload-pdf', auth, upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file was uploaded.' });
        }
        const { originalname, path, public_id } = req.file;
        const newPdfRecord = {
            fileName: originalname,
            fileUrl: path,
            cloudinaryPublicId: public_id,
        };
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $push: { pdfRecords: newPdfRecord } },
            { new: true }
        );
        res.status(201).json({ msg: 'File uploaded successfully', record: newPdfRecord });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;