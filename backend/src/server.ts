import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import app from './app.js';
import { prisma } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Validate database connection
    await prisma.$connect();
    console.log('📦 Database connection established successfully.');

    const server = app.listen(PORT, () => {
      console.log(`🚀 WAVI STORE Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️ ${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        await prisma.$disconnect();
        console.log('Database connections disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to initialize application or database connection:', error);
    process.exit(1);
  }
};

// Handle Uncaught Exceptions (Synchronous errors)
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION! System shutting down...', error);
  process.exit(1);
});

// Handle Unhandled Rejections (Asynchronous errors)
process.on('unhandledRejection', (error) => {
  console.error('💥 UNHANDLED REJECTION! System shutting down...', error);
  process.exit(1);
});

startServer();
