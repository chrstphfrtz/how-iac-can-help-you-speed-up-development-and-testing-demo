// import { Pool, PoolClient } from 'pg';

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
// });

// pool.on('error', (err: Error) => {
//     console.error('Unexpected error on idle client', err);
// });

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
    if (event.http && event.http.method === 'GET') {
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
            body: "testeroni",
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
