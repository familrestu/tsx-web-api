import express from 'express';
import Base from '@system/base';
import { query } from '@database';

class EmployeeInformation extends Base {
    async TableData(req: express.Request) {
        return await this.Listing(req);
    }

    async Listing(req: express.Request) {
        let result: any = {};
        try {
            const qData = await query(
                `
                select      emp_no as employee_no, full_name, position, department, division, join_date, grade, gender
                from        view_employee
                order by    emp_no
                `,
                [],
                req.datasource.admin,
            );

            result = await super.SetListing(req, qData, req.body);
        } catch (error) {
            result.status = false;
            result.stack = error;
        }

        return result;
    }

    async ViewData(req: express.Request) {
        let result: any = {};

        try {
            const qData = await query(
                `
                select  emp_no, full_name, 1 as position_id, position, department, division, to_char(join_date, 'yyyy-mm-dd') as join_date,
                        grade, gender, to_char(birth_date, 'yyyy-mm-dd') as birth_date, concat(lower(replace(full_name, ' ', '.')), '@ersysdev.com') as email, 'Earth' as birth_place
                from    view_employee
                where   1 = 1
                and     emp_no = $1
                `,
                [req.body.employee_no],
                req.datasource.admin,
            );

            result = await super.GetFormData(qData);

            const full_name = qData.rows[0].full_name.split(' ');

            let first_name = '';
            let middle_name = '';
            let last_name = '';

            if (full_name.length === 1) {
                first_name = full_name[full_name.length - 1];
            } else {
                if (full_name.length <= 2) {
                    first_name = full_name[0];
                    last_name = full_name[full_name.length - 1];
                } else {
                    first_name = full_name[0];
                    middle_name = full_name[1];
                    last_name = full_name[full_name.length - 1];
                }
            }

            result.first_name = first_name;
            result.middle_name = middle_name;
            result.last_name = last_name;
        } catch (error: any) {
            result.status = false;
            result.error = error;
            result.message = error.message;
        }

        // console.log(result);

        return result;
    }

    async Delete(req: express.Request) {
        const result: any = {
            status: true,
        };

        return result;
    }

    async GetPositions(req: express.Request) {
        const result: any = {
            status: true,
            searchData: [],
        };

        const arrSearchData = [
            {
                position_id: 1,
                position_name: 'Junior Software Developer',
                department: 'Tech Development',
                division: 'Technology',
                grade: '1F',
            },
            {
                position_id: 2,
                position_name: 'Software Developer',
                department: 'Tech Development',
                division: 'Technology',
                grade: '2F',
            },
            {
                position_id: 3,
                position_name: 'Senior Software Developer',
                department: 'Tech Development',
                division: 'Technology',
                grade: '3F',
            },
        ];

        for (let i = 0; i < arrSearchData.length; i++) {
            const rows = arrSearchData[i];
            result.searchData.push({
                label: rows.position_name,
                value: rows.position_id,
                ...rows,
            });
        }

        return result;
    }

    async Save(req: express.Request) {
        console.log(req.body);
    }

    async GetShift(req: express.Request) {
        const arrOptions: any = [];
        const totalData = 500;

        for (let i = 0; i < totalData; i++) {
            arrOptions.push({
                label: `Shift ${i}`,
                value: `SHIFT_${i}`,
            });
        }

        return {
            arrOptions: arrOptions,
        };
    }
}

export default new EmployeeInformation();
