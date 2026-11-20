
const express = require('express');
const router = express.Router();
const User = require('../module/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ADMIN AUTHENTICATION
function verifyAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        message: 'Admin access only.'
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token.'
    });
  }
}

// GET ALL USERS
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({
      message: 'Unable to fetch users.'
    });
  }
});

// ADD NEW USER
router.post('/users', verifyAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please fill in all fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must contain at least 6 characters.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'This email is already registered.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user'
    });

    const safeUser = await User.findById(newUser._id)
      .select('-password');

    res.status(201).json({
      message: 'New user added successfully.',
      user: safeUser
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This email is already registered.'
      });
    }

    res.status(500).json({
      message: 'Unable to add new user.'
    });
  }
});

// UPDATE USER
router.put('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: 'Name and email are required.'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        email: email.trim().toLowerCase()
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    res.status(200).json({
      message: 'User updated successfully.',
      user: updatedUser
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This email is already registered.'
      });
    }

    res.status(500).json({
      message: 'Unable to update user.'
    });
  }
});

// DELETE USER
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    if (req.user.userId === req.params.id) {
      return res.status(400).json({
        message: 'You cannot delete your own admin account.'
      });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    res.status(200).json({
      message: 'User deleted successfully.'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Unable to delete user.'
    });
  }
});

module.exports = router;
