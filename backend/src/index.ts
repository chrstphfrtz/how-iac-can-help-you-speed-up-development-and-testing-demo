import express, { Request, Response } from 'express';
import fs from 'fs';
import { Pool, PoolClient } from 'pg';

// Create a new pool for the PostgreSQL database with the connection details stored in different environment variables.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('demoDatabaseCa.crt'),
  }
});

// Create the 'todos' table in the database.
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

// Instantiate the express app, use middleware to be able to work with the JSON body of the request and define the
// port which can also be specified by an environment variable.
const app = express();
app.use(express.json())
const port = process.env.PORT || 3000;

// GET /todos
// This endpoint returns all the todos from the 'todos' table as a list.
app.get('/todos', async (req: Request, res: Response) => {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT * FROM todos');
    res.status(200).json({
      success: true,
      todos: result.rows,
    })
  } catch (err) {
    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
});

// POST /todos
// This endpoint adds a todo to the 'todos' table and returns its id and title in the response.
app.post('/todos', async (req: Request, res: Response) => {
  let client: PoolClient | undefined;
  const { title } = req.body;
  try {
    client = await pool.connect();
    const sql = "INSERT INTO todos (title) VALUES ($1) RETURNING id";
    const values = [title];
    const result = await client.query(sql, values);
    res.status(201).json({
      success: true,
      message: `Todo with title ${title} added successfully`,
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

app.delete('/todos', async (req: Request, res: Response) => {
  let client: PoolClient | undefined;
  const { id } = req.body;
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

// Start the express app to handle incoming requests.
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});