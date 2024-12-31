import app from './express.js';
import mongoose from 'mongoose';
import 'dotenv/config';

mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on('error', (err) => {
  console.log(`Database connection error: ${err}`);
});

mongoose.connection.on('connected', () => {
  console.log('Database connected');
});

mongoose.connection.on('disconnected', () => {
  console.log('Database disconnected');
});

app.listen(process.env.PORT, () => {
  console.log(`Tazk-backend is running on port ${process.env.PORT}`);
});

export default app;