import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
    // We require DATABASE_URL for direct connection because the Supabase JS client
    // does not support executing raw DDL SQL.
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('DATABASE_URL is not set in the environment variables.');
        console.error('Please set DATABASE_URL (e.g., postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres) in .env file.');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const sqlFilePath = path.join(__dirname, '../../supabase/migrations/001_initial_schema.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Executing migration script...');
        await client.query(sql);

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
};

migrate();
