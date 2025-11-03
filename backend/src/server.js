require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const worldclockRoutes = require('./routes/worldclock');
const clocksRoutes = require('./routes/clocks');
const eventsRoutes = require('./routes/events');
const timersRoutes = require('./routes/timers');
const newsletterRoutes = require('./routes/newsletter');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req,res)=>res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/worldclock', worldclockRoutes);
app.use('/api/clocks', clocksRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/timers', timersRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 4000;
connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log('Backend running on', PORT));
}).catch(err => {
  console.error('Failed to start backend', err);
  process.exit(1);
});
