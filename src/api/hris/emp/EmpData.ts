import express from 'express';
import Base, { TableDataReturnType } from '@system/base';

const datasets = {
    header: [
        'employee_no',
        'full_name',
        'position',
        'department',
        'division',
        'join_date',
        'grade',
        'first_name',
        'middle_name',
        'last_name',
        'gender',
        'email',
        'birth_place',
        'birth_date',
        'phone',
        'mobile_phone',
        'address',
    ],
    body: [
        [
            'EE20171001',
            'EE20171002',
            'EE20171003',
            'EE20171004',
            'EE20171005',
            'EE20171006',
            'EE20171007',
            'EE20171008',
            'EE20171009',
            'EE20171010',
            'EE20171001',
            'EE20171002',
            'EE20171003',
            'EE20171004',
            'EE20171005',
            'EE20171006',
            'EE20171007',
            'EE20171008',
            'EE20171009',
            'EE20171010',
            'EE20171001',
            'EE20171002',
            'EE20171003',
            'EE20171004',
            'EE20171005',
            'EE20171006',
            'EE20171007',
            'EE20171008',
            'EE20171009',
            'EE20171010',
            'EE20171001',
            'EE20171002',
            'EE20171003',
            'EE20171004',
            'EE20171005',
            'EE20171006',
            'EE20171007',
            'EE20171008',
            'EE20171009',
            'EE20171010',
            'EE20171001',
            'EE20171002',
            'EE20171003',
            'EE20171004',
            'EE20171005',
            'EE20171006',
            'EE20171007',
            'EE20171008',
            'EE20171009',
            'EE20171010',
            'EE20171001',
            'EE20171002',
            'EE20171003',
            'EE20171004',
            'EE20171005',
            'EE20171006',
            'EE20171007',
            'EE20171008',
            'EE20171009',
            'EE20171010',
            'EE20171001',
            'EE20171002',
            'EE20171003',
            'EE20171004',
            'EE20171005',
            'EE20171006',
            'EE20171007',
            'EE20171008',
            'EE20171009',
            'EE20171010',
            'EE20171001',
            'EE20171002',
            'EE20171003',
            'EE20171004',
            'EE20171005',
            'EE20171006',
            'EE20171007',
            'EE20171008',
            'EE20171009',
            'EE20171010',
        ],
        ['NEIL BATES', 'MARION WATSON', 'CLARA MANNING', 'REGINALD ERICKSON', 'SEAN ALEXANDER', 'PAULA WILLIAMSON', 'CARLOS VAUGHN', 'HUBERT HAYES', 'CLYDE HUNTER', 'KURT BASS'],
        ['SOFTWARE DEVELOPER', 'SOFTWARE DEVELOPER', 'RELATIONSHIP MANAGER'],
        [null, 'SYSTEM DEVELOPMENT', 'REGION I'],
        [null, 'INFORMATION TECHNOLOGY', 'RM REGION I'],
        ['2017-10-23', '2016-10-23'],
        ['AA', 9, 10],
        ['FAMIL', 'BRAD', 'GREG'],
        ['RESTU', null, null],
        ['PAMBUDI', 'PITT', 'SON'],
        [0, 0, 0],
        ['example@ersys.com', 'brad.pitt@ersys.com', 'example@ersys.com'],
        ['Jakarta', 'Bandung', 'Jakarta'],
        ['1992-06-09', '0000-00-00', '0000-00-00'],
        [null, null, null],
        ['085780537793', '08373617212', '0819847612'],
        ['Rempoa, Tangerang Selatan, Banten', 'Bandung', 'Jl. Gadog raya, RT 032, RW 666'],
    ],
};

class Data extends Base {
    TableData(): TableDataReturnType {
        return {
            datasets,
        };
    }

    FormData(req: express.Request) {
        const formData: any = {};

        const indexOfId = datasets.header.indexOf('employee_no');
        const bodyData = datasets.body[indexOfId].indexOf(req.body.employee_no);

        for (let i = 0; i < datasets.header.length; i++) {
            const column = datasets.header[i];
            formData[column] = datasets.body[datasets.header.indexOf(column)][bodyData];
        }

        return {
            ...formData,
        };
    }
}
export default new Data();
