import { Client } from 'pg';

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
    console.log("Start function!")
    if (event.http && event.http.method === 'GET') {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
        });

        // await client.connect();
        // try {
        //     await client.connect();
        //     console.log('Connected to the database successfully!');

        //     // You can now execute queries
        //     // const result = await client.query('SELECT NOW()');
        //     // console.log('Database time:', result.rows[0].now);

        // } catch (err) {
        //     console.error('Error connecting to the database:', err);
        // } finally {
        //     await client.end(); // Close the connection when done
        //     console.log('Database connection closed.');
        // }
        // // Access query parameters.
        // // DigitalOcean often puts parsed query params at the top level of the event.
        // const name = event.name as string | undefined || 'stranger';
        // const greeting = event.greeting as string | undefined;

        // let message = `Hello, ${name}! This was a GET request.`;

        // if (greeting) {
        //     message = `${greeting}, ${name}! This was a GET request.`;
        // }

        return {
            statusCode: 200,
            body: process.env.DATABASE_URL,
            headers: {
                'Content-Type': 'text/plain'
            }
        };
    } else {
        return {
            statusCode: 405,
            body: 'Only GET requests are allowed.'
        };
    }
}
