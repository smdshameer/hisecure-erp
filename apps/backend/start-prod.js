const { execSync } = require('child_process');

// Ensure DATABASE_URL starts with file: for SQLite
let dbUrl = process.env.DATABASE_URL;
if (dbUrl && !dbUrl.startsWith('file:')) {
    console.log('Prepending file: to DATABASE_URL');
    process.env.DATABASE_URL = `file:${dbUrl}`;
} else if (!dbUrl) {
    // Fallback for when no env var is set (e.g. local dev without .env loaded yet, though usually .env handles this)
    // But on Render, if they forgot to set it, this might help if we default to something.
    // However, better to let it fail or default to a standard path if we want to be helpful.
    console.log('DATABASE_URL not set, defaulting to file:./dev.db');
    process.env.DATABASE_URL = 'file:./dev.db';
}

try {
    console.log('Running migrations...');
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
