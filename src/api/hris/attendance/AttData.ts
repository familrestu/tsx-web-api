import express from 'express';

class AttData extends global.Core {
    Listing() {
        return {
            header: ['date', 'start_time', 'end_time', 'employee_no', 'id'],
            body: [
                ['2020-01-06', '2020-01-02', '2020-01-03', '2020-01-04', '2020-01-05'],
                ['06:45', '07:50', '08:00', '08:00', '08:00'],
                ['15:00', '18:00', null, '16:30', '15:20'],
                ['E1001', 'E1001', 'E1001', 'E1001', 'E1001'],
                ['TAE100101', 'TAE100102', 'TAE100103', 'TAE100104', 'TAE100105'],
            ],
        };
    }
}

export default new AttData();
