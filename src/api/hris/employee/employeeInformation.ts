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
            const qMenu = await query(
                `
                select      emp_no as employee_no, full_name, full_name, position, department, division, join_date, grade
                from        view_employee
                order by    emp_no
                `,
                [],
                req.datasource.admin,
            );

            result = await super.SetListing(req, qMenu, req.body);
        } catch (error) {
            result.status = false;
            result.stack = error;
        }

        return result;
    }
}

export default new EmployeeInformation();
