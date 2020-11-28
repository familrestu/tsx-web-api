import express from 'express';
import Core, { ListingReturnType } from '@system/core';

class AttData extends Core {
    Listing(req: express.Request): ListingReturnType {
        return {
            datasets: {
                header: ['date', 'start_time', 'end_time', 'employee_no', 'id'],
                body: [
                    ['2020-01-06', '2020-01-02', '2020-01-03', '2020-01-04', '2020-01-05', '2020-01-06'],
                    ['06:45', '07:50', '08:00', '08:00', '08:00', '05:45'],
                    ['15:00', '18:00', null, '16:30', '15:20', '16:54'],
                    ['E1001', 'E1001', 'E1001', 'E1001', 'E1001', 'E1001'],
                    ['TAE100101', 'TAE100102', 'TAE100103', 'TAE100104', 'TAE100105', 'TAE100106', 'TAE100107', 'TAE100108'],
                ],
            },
        };

        // return {
        //     datasets: {
        //         header: ['date', 'start_time', 'end_time', 'employee_no', 'id'],
        //         body: [],
        //     },
        // };

        // return {
        //     datasets: {
        //         header: ['date', 'start_time', 'end_time', 'employee_no', 'id'],
        //         body: [
        //             ['2020-01-06', '2020-01-02', '2020-01-03', '2020-01-04', '2020-01-05'],
        //             ['06:45', '07:50', '08:00', '08:00', '08:00'],
        //             ['15:00', '18:00', null, '16:30', '15:20'],
        //             ['E1001', 'E1001', 'E1001', 'E1001', 'E1001'],
        //             ['TAE100101', 'TAE100102', 'TAE100103', 'TAE100104', 'TAE100105'],
        //         ],
        //     },
        // };
    }
}

export default new AttData();
