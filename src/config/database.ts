import { Client } from 'pg';

export type queryReturnType = {
    queryString: string;
    queryParams: any[];
    length: number;
    rowCount: number;
    rows: { [key: string]: any }[];
    duration: number;
    arrColumn: string[];
    error?: any;
};

const query = async (text: string, params: any[], datasource: string): Promise<queryReturnType> => {
    const result: queryReturnType = {
        queryString: text,
        queryParams: params,
        length: 0,
        rowCount: 0,
        rows: [],
        duration: 0,
        arrColumn: [],
    };

    try {
        const start = Date.now();
        const client = new Client({
            database: datasource,
        });

        await client.connect();
        const query = await client.query({
            text: text,
            values: params,
        });
        const duration = Date.now() - start;

        const arrColumn = [];
        for (let i = 0; i < query.fields.length; i++) {
            const column = query.fields[i];
            arrColumn.push(column.name);
        }

        result.rowCount = query.rowCount;
        result.length = query.rowCount;
        result.duration = duration;
        result.rows = query.rows;

        if (query.command === 'SELECT') {
            result.arrColumn = arrColumn;
        }

        client.end();
    } catch (error) {
        result.error = error.message;
        // console.log(error);
        throw {
            error: error,
            message: error.message,
            queryString: text.replace(/\n/g, ' '),
            params: params,
        };
    }

    return result;
};

export { query };
