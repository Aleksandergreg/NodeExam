import 'dotenv/config';
import server from './app.js'; 

const PORT = Number(process.env.PORT) || 8080;

server.listen(PORT, (err) => { 
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});