import { ClientConfig, Client } from 'pg';

const dbConfig: ClientConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: true,
        ca: process.env.CA_CERT,
    }
};

let client: Client;

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
    try {
        // Initialize client only if it doesn't exist (for potential warm starts)
        if (!client) {
            client = new Client(dbConfig);
            await client.connect();
            console.log('Database client connected.');
        } else {
            console.log('Using existing database client.');
        }

        // Perform database operations
        const result = await client.query('SELECT NOW() as current_time');
        const currentTime = result.rows[0].current_time;

        return {
            statusCode: 200,
            body: {
                message: 'Successfully connected to database',
                currentTime: currentTime
            },
        };
    } catch (error) {
        console.error('Database connection or query failed:', error);
        if (client) {
            try {
                await client.end();
                console.log('Database client closed due to error.');
            } catch (closeError) {
                console.error('Error closing database client:', closeError);
            }
        }
        return {
            statusCode: 500,
            body: {
                message: 'Failed to connect to or query database',
                error: error.message,
            },
        };
    }
    // if (event.http && event.http.method === 'GET') {
    //     // // Access query parameters.
    //     // // DigitalOcean often puts parsed query params at the top level of the event.
    //     // const name = event.name as string | undefined || 'stranger';
    //     // const greeting = event.greeting as string | undefined;

    //     // let message = `Hello, ${name}! This was a GET request.`;

    //     // if (greeting) {
    //     //     message = `${greeting}, ${name}! This was a GET request.`;
    //     // }

    //     return {
    //         statusCode: 200,
    //         body: "testeroni",
    //         headers: {
    //             'Content-Type': 'text/plain'
    //         }
    //     };
    // } else {
    //     return {
    //         statusCode: 405,
    //         body: 'Only GET requests are allowed.'
    //     };
    // }
}
