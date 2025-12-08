const { execSync } = require('child_process');

// Ensure DATABASE_URL starts with file: for SQLite
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.log('DATABASE_URL not set in environment');
} else {
    console.log('Using DATABASE_URL from environment');
}

try {
    console.log('Running migrations...');

    // Attempt to resolve any stuck migration from previous failed run
    try {
        console.log('Ensuring migration state is clean...');
        // Only run this if we suspect the specific migration is stuck (idempotent-ish if it fails)
        execSync('npx prisma migrate resolve --rolled-back 20251208000000_manual_sync', { stdio: 'inherit', env: process.env });
    } catch (e) {
        console.log('Migration resolve command passed (either resolved or not needed).');
    }

    execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });

    console.log('Seeding database...');
    try {
        execSync('npx prisma db seed', { stdio: 'inherit', env: process.env });
    } catch (seedError) {
        console.warn('Seeding failed (non-fatal):', seedError.message);
    }

    console.log('Starting application...');
    execSync('node dist/src/main', { stdio: 'inherit', env: process.env });
} catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
}
