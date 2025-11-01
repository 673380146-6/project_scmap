import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

console.log('📌 DEBUG: Starting server...');
console.log('📌 DEBUG: PORT =', PORT);
console.log('📌 DEBUG: app =', typeof app);

// Start server with Firebase
try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📊 Using Firebase Firestore as database');
    console.log('🌍 Listening on all interfaces (0.0.0.0)');
  });

  // Error handling
  server.on('error', (err) => {
    console.error('❌ Server Error:', err);
  });
} catch (err) {
  console.error('❌ Startup Error:', err);
}

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});
