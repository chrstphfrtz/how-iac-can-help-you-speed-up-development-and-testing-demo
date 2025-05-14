import express, { Request, Response } from 'express';
import { Pool, PoolClient } from 'pg';

const pool = new Pool({
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
  }
});

(async () => {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    const createTodosTableSql = `
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(createTodosTableSql);
  } catch (err) {
    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
})()

const app = express();
app.use(express.json())
const port = process.env.PORT || 3000;

app.get('/', async (req: Request, res: Response) => {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT * FROM todos');
    res.status(200).json(
      result.rows,
    )
  } catch (err) {
    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.post('/', async (req: Request, res: Response) => {
  let client: PoolClient | undefined;
  const { title } = req.body;
  try {
    client = await pool.connect();
    const sql = "INSERT INTO todos (title) VALUES ($1) RETURNING id";
    const values = [title];
    const result = await client.query(sql, values);
    res.status(201).json({
      id: result.rows[0].id,
      title: title,
    });
  } catch (err) {
    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
})

app.delete('/:id', async (req: Request, res: Response) => {
  let client: PoolClient | undefined;
  const id = parseInt(req.params.id, 10);
  try {
    client = await pool.connect();
    await client.query(`DELETE FROM todos WHERE id = ${id}`);
    res.status(204).send();
  } catch (err) {
    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});