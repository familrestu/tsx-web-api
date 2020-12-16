import express from 'express';
import Base, { TableDataReturnType } from '@system/base';
import moment from 'moment';

class ExampleTable extends Base {
    TableData(req: express.Request): TableDataReturnType {
        const arrHeader: string[] = [];
        const arrBody: string[][] = [];

        for (let i = 1; i <= 20; i++) {
            arrHeader.push(`column_${i}`);

            const tempArrBody: string[] & Date[] = [];
            for (let x = 0; x < 50; x++) {
                if (i === 2) {
                    tempArrBody.push(x % 2 === 0 ? 'A' : 'B');
                } else if (i === 3) {
                    const start = new Date(2020, 1, 1);
                    const end = new Date();
                    tempArrBody.push(
                        moment(new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())))
                            .format('YYYY-MM-DD')
                            .toString(),
                    );
                } else if (i === 4) {
                    const start = new Date(2020, 1, 1);
                    const end = new Date();
                    tempArrBody.push(
                        moment(new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())))
                            .format('HH:mm')
                            .toString(),
                    );
                } else if (i === 5) {
                    tempArrBody.push((Math.floor(Math.random() * 1000000) + 1000).toString());
                } else {
                    tempArrBody.push('Lorem Ipsum');
                }
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
