const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Token generation helper configurations
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res, next) => {
  const { full_name, email, password } = req.body;
  try {
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email address' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email, role',
      [full_name, email, password_hash]
    );

    const user = newUser.rows[0];
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Secure HTTP-Only Cookie deployment strategy 
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days duration
    });

    res.status(201).json({ token: accessToken, user });
  } catch (err) {
    next(err); // Passed cleanly to global error middleware handler
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid Email or Password combinations' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Email or Password combinations' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days duration
    });

    delete user.password_hash; // Mask password hash securely
    res.json({ token: accessToken, user });
  } catch (err) {
    next(err);
  }
};

// Seamless Token Rotation interceptor block
exports.refresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh Token access missing' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const result = await db.query('SELECT id, full_name, email, role FROM users WHERE id = $1', [decoded.id]);
    
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid session context' });
    
    const user = result.rows[0];
    const newAccessToken = generateAccessToken(user);

    res.json({ token: newAccessToken, user });
  } catch (err) {
    res.status(403).json({ error: 'Session expired or altered. Please login again.' });
  }
};