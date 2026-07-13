const db = require('../config/db');

exports.createReport = async (req, res, next) => {
  const { description, category, latitude, longitude } = req.body;
  try {
    if (!req.file) return res.status(400).json({ error: 'Visual evidence image upload is required' });
    const image_url = req.file.path;

    const newReport = await db.query(
      'INSERT INTO reports (user_id, description, category, image_url, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, description, category, image_url, latitude, longitude]
    );
    res.status(201).json(newReport.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    // Dynamic Pagination limits
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Fetching blocks of 5 rows smoothly
    const offset = (page - 1) * limit;

    const reportsQuery = await db.query(
      'SELECT r.*, u.full_name as reported_by FROM reports r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countQuery = await db.query('SELECT COUNT(*) FROM reports');
    const totalReports = parseInt(countQuery.rows[0].count);

    res.json({
      data: reportsQuery.rows,
      meta: {
        totalReports,
        currentPage: page,
        totalPages: Math.ceil(totalReports / limit),
        hasNextPage: offset + limit < totalReports
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserReports = async (req, res, next) => {
  try {
    const reports = await db.query(
      'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(reports.rows);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await db.query(
      'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (updated.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
};