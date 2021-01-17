import express from 'express';
import Base, { TableDataReturnType } from '@system/base';

class AttData extends Base {
    TableData(req: express.Request): TableDataReturnType {
        return {
            datasets: {
                header: ['date', 'start_time', 'end_time', 'employee_no', 'id', 'active'],
                body: [
                    ['2020-01-06', '2020-01-02', '2020-01-03', '2020-01-04', '2020-01-05'],
                    ['06:45', '07:50', '08:00', '08:00', '08:00'],
                    ['15:00', '18:00', null, '16:30', '15:20'],
                    ['E1001', 'E1001', 'E1001', 'E1001', 'E1001'],
                    ['TAE100101', 'TAE100102', 'TAE100103', 'TAE100104', 'TAE100105'],
                    [0, 1, 0, 1, 1],
                ],
            },
        };
    }
}

export default new AttData();
