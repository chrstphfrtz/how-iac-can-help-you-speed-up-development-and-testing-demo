"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
// Create a new pool for the PostgreSQL database with the connection details stored in different environment variables.
const pool = new pg_1.Pool({
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
// Create the 'todos' table in the database.
(() => __awaiter(void 0, void 0, void 0, function* () {
    let client;
    try {
        client = yield pool.connect();
        const createTodosTableSql = `
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        yield client.query(createTodosTableSql);
    }
    catch (err) {
        throw err;
    }
    finally {
        if (client) {
            client.release();
        }
    }
}))();
// Instantiate the express app, use middleware to be able to work with the JSON body of the request and define the
// port which can also be specified by an environment variable.
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT || 3000;
// GET /todos
// This endpoint returns all the todos from the 'todos' table as a list.
app.get('/todos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let client;
    try {
        client = yield pool.connect();
        const result = yield client.query('SELECT * FROM todos');
        res.status(200).json({
            success: true,
            todos: result.rows,
        });
    }
    catch (err) {
        throw err;
    }
    finally {
        if (client) {
            client.release();
        }
    }
}));
// POST /todos
// This endpoint adds a todo to the 'todos' table and returns its id and title in the response.
app.post('/todos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let client;
    const { title } = req.body;
    try {
        client = yield pool.connect();
        const sql = "INSERT INTO todos (title) VALUES ($1) RETURNING id";
        const values = [title];
        const result = yield client.query(sql, values);
        res.status(201).json({
            success: true,
            message: `Todo with title ${title} added successfully`,
            id: result.rows[0].id,
            title: title,
        });
    }
    catch (err) {
        throw err;
    }
    finally {
        if (client) {
            client.release();
        }
    }
}));
app.delete('/todos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let client;
    const { id } = req.body;
    try {
        client = yield pool.connect();
        yield client.query(`DELETE FROM todos WHERE id = ${id}`);
        res.status(204).send();
    }
    catch (err) {
        throw err;
    }
    finally {
        if (client) {
            client.release();
        }
    }
}));
// Start the express app to handle incoming requests.
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
