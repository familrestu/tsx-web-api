import express from 'express';

export type ListingReturnType = {
    datasets: {
        header: Array<any>;
        body: Array<any>;
    };
};

class Core {
    Listing(req: express.Request): ListingReturnType {
        return {
            datasets: {
                header: ['date', 'start_time', 'end_time'],
                body: [
                    ['2020-01-06', '2020-01-02', '2020-01-03', '2020-01-04', '2020-01-05'],
                    ['06:45', '07:50', '08:00', '08:00', '08:00'],
                    ['15:00', '18:00', null, '16:30', '15:20'],
                ],
            },
        };
    }
}

export default Core;
