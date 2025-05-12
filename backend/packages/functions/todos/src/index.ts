import { Pool, PoolConfig } from 'pg';

const dbConfig: PoolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: {
        rejectUnauthorized: false,
    },
};

interface DigitalOceanEvent {
    http?: {
        method: string;
        path: string;
        headers: { [key: string]: string };
        queryString: string;
        body?: any;
    };
    [key: string]: any;
}

interface DigitalOceanResponse {
    statusCode: number;
    body: any;
    headers?: { [key: string]: string };
}

export async function main(event: DigitalOceanEvent, context: any): Promise<DigitalOceanResponse> {
    const pool = new Pool(dbConfig);
    const client = await pool.connect();

    const result = await client.query('SELECT NOW()');

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Database connection and query successful',
            currentTime: result.rows[0].now,
        }),
    };
}
