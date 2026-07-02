const db = require('../config/db');

exports.createReport = async (req, res) => {
  try {
    const { description, category, latitude, longitude } = req.body;
    // req.file is provided by Multer
    const imageUrl = req.file ? req.file.path : null;

    if (!imageUrl) return res.status(400).json({ message: 'Image is required' });

    const newReport = await db.query(
      `INSERT INTO reports (user_id, description, category, image_url, latitude, longitude) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, description, category, imageUrl, latitude, longitude]
    );

    res.status(201).json(newReport.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await db.query('SELECT * FROM reports ORDER BY created_at DESC');
    res.json(reports.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const updated = await db.query(
      'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserReports = async (req, res) => {
  try {
    // req.user.id is attached automatically by the protect middleware
    const reports = await db.query(
      'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(reports.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};