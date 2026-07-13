const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser'); // Imported
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const errorHandler = require('./middleware/errorMiddleware'); // Imported




require('dotenv').config();

const app = express();

// Standard middleware stack
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Registered cookie parser
app.use(morgan('dev'));

// Core Route Redirections
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes); // <-- Mount AI endpoint here
// Global Error Handler - MUST BE THE VERY LAST LINE OF MIDDLEWARE
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});