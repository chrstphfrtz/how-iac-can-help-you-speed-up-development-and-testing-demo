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

let pool: Pool;

const getDatabasePool = (): Pool => {
    if (!pool) {
        console.log('Initializing database connection pool...');
        pool = new Pool(dbConfig);

        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }
    return pool;
};

export const main = async (args: any): Promise<any> => {
    // let name: string = args['name'] || 'stranger'
    // let greeting: string = 'Hello ' + name + '!'
    // console.log(greeting)
    // return { body: greeting }

    const databasePool = getDatabasePool();
    let client;

    try {
        client = await databasePool.connect();
        console.log('Database client connected from pool.');

        // Perform database operations here
        const result = await client.query('SELECT NOW()');
        console.log('Database query result:', result.rows[0]);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Database connection and query successful',
                currentTime: result.rows[0].now,
            }),
        };
    } catch (error) {
        console.error('Database operation failed:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
        };
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
            console.log('Database client released.');
        }
    }
}
