import express from 'express';
import Core, { ListingReturnType } from '@system/core';

class ExampleTable extends Core {
    Listing(req: express.Request): ListingReturnType {
        const arrHeader = [];
        const arrBody = [];

        for (let i = 1; i <= 20; i++) {
            arrHeader.push(`column_${i}`);

            const tempArrBody = [];
            for (let x = 0; x < 500; x++) {
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
