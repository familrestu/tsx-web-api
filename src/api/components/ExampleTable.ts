import express from 'express';
import Base, { TableDataReturnType } from '@system/base';

class ExampleTable extends Base {
    TableData(req: express.Request): TableDataReturnType {
        const arrHeader: string[] = [];
        const arrBody: string[][] = [];

        for (let i = 1; i <= 20; i++) {
            arrHeader.push(`column_${i}`);

            const tempArrBody = [];
            for (let x = 0; x < 50; x++) {
                tempArrBody.push('Lorem Ipsum');
            }

            arrBody.push(tempArrBody);
        }

        return {
            datasets: {
                header: arrHeader,
                body: arrBody,
            },
        };
    }
}

export default new ExampleTable();
