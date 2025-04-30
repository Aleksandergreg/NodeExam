import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});
