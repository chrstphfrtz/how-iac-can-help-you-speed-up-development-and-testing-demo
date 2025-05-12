import express, { Request, Response } from 'express';
import { Pool, PoolClient, PoolConfig } from 'pg';

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

const pool = new Pool(dbConfig);
let client: PoolClient;
(async () => { client = await pool.connect() })()

const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req: Request, res: Response) => {
  console.log(`Do we have a client? ${client}`);
  const result = await client.query('SELECT NOW()');
  res.status(200).json({ message: `The current time: ${result.rows[0].now}` })
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});