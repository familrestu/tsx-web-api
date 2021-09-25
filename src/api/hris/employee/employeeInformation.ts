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
                select  emp_no, full_name, position, department, division, to_char(join_date, 'yyyy-mm-dd') as join_date, grade, gender, to_char(birth_date, 'yyyy-mm-dd') as birth_date
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
}

export default new EmployeeInformation();
