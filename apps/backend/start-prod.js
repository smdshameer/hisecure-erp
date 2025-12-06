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
    try {
        execSync('npx prisma migrate resolve --applied 20251206000000_init_postgres', { stdio: 'inherit', env: process.env });
    } catch (e) {
        console.log('Migration resolve skipped or failed (safe to ignore if already resolved): ' + e.message);
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
