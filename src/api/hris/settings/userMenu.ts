import express from 'express';
import Base from '@system/base';
import { query } from '@database';

class userMenu extends Base {
    async Listing(req: express.Request) {
        let result: any = {};
        try {
            const qMenu = await query(
                `
                select      c.menu_id, c.menu_name, c.group_name, c.url, c.pagepath, p.menu_name as parent_name, c.access_only, c.menu_type, c.status
                from        tclmmenu c
                left join   tclmmenu p on p.menu_id = c.parent_id
                order by    c.menu_order, c.group_name, c.parent_id, c.menu_id
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

    async GetParent(req: express.Request) {
        const result: any = {
            searchData: [],
        };

        try {
            const arrParams: any[] = [1, '10'];

            if (req.body.value && req.body.value) {
                arrParams.push(`%${req.body.value}%`);
            }

            const qMenu = await query(
                `
                select      c.menu_id, c.menu_name, c.url, c.pagepath, c.access_only, c.menu_type, c.status
                from        tclmmenu c
                where       status = $1
                ${req.body.value && req.body.value !== '' ? `and         c.menu_name ilike $3` : ''}
                order by    c.menu_order, c.parent_id, c.menu_id
                limit       $2
                `,
                arrParams,
                req.datasource.admin,
            );

            if (qMenu.rowCount) {
                for (let i = 0; i < qMenu.rowCount; i++) {
                    const rows = qMenu.rows[i];
                    result.searchData.push({
                        label: rows.menu_name,
                        value: rows.menu_id,
                    });
                }
            }
        } catch (error) {
            result.status = false;
        }

        return result;
    }

    async Add(req: express.Request) {
        const result: any = {};

        try {
            const qInsertMenu = await query(
                `
                insert into tclmmenu (
                    menu_name,
                    group_name,
                    icon,
                    parent_id,
                    url,
                    pagepath,
                    menu_type,
                    status,
                    menu_order,
                    access_only
                ) values (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
                )
            `,
                [
                    req.body.menu_name,
                    req.body.group_name,
                    req.body.icon,
                    req.body.parent_id === '' ? 0 : req.body.parent_id,
                    req.body.url,
                    req.body.pagepath,
                    req.body.menu_type,
                    req.body.status === '' ? 0 : req.body.status,
                    req.body.menu_order,
                    req.body.access_only === '' ? 0 : req.body.access_only,
                ],
                req.datasource.admin,
            );

            if (qInsertMenu.rowCount > 0) {
                result.status = true;
                result.message = 'Successfully Insert Data';
                result.alert = true;
            } else {
                result.status = false;
                result.message = qInsertMenu.error;
            }
        } catch (error) {
            result.status = false;
            result.error = error;
            result.message = error.message;
        }

        return result;
    }

    async Update(req: express.Request) {
        const result: any = {};
        try {
            const qUpdateMenu = await query(
                `
                update  tclmmenu
                set     parent_id = $1,
                        menu_name = $2,
                        group_name =$3,
                        icon = $4,
                        url = $5,
                        pagepath = $6,
                        access_only = $7,
                        menu_type = $8,
                        menu_order = $9,
                        status = $10,
                        modified_date = now(),
                        modified_by = $11
                where   menu_id = $12
            `,
                [
                    req.body.parent_id === '' ? 0 : req.body.parent_id,
                    req.body.menu_name,
                    req.body.group_name,
                    req.body.icon,
                    req.body.url,
                    req.body.pagepath === null ? '' : req.body.pagepath,
                    req.body.access_only === '' ? 0 : req.body.access_only,
                    req.body.menu_type,
                    req.body.menu_order,
                    req.body.menu_status === '' ? 0 : req.body.menu_status,
                    req.user.user_id,
                    req.body.menu_id_hidden,
                ],
                req.datasource.admin,
            );

            if (qUpdateMenu.rowCount > 0) {
                result.status = true;
                result.message = 'Successfully Update Data';
                result.alert = true;
            } else {
                result.status = false;
                result.message = qUpdateMenu.error;
            }
        } catch (error) {
            result.status = false;
            result.error = error;
            result.message = error.message;
        }

        return result;
    }

    async Details(req: express.Request) {
        const result: any = {};
        try {
            const qMenu = await query(
                `
                select      menu_id, menu_name, url, pagepath, menu_type, status as menu_status, menu_order, access_only, 
                            (case when icon is null then '' else icon end) as icon,
                            (case when group_name is null then '' else group_name end) as group_name, 
                            (case when parent_id = 0 then '' else parent_id::varchar(1) end) as parent_id
                from        tclmmenu
                where       1 = 1
                and         menu_id = $1
                order by    menu_order, parent_id, menu_id
                `,
                [req.body.menu_id],
                req.datasource.admin,
            );

            console.log(qMenu);

            if (qMenu.rowCount) {
                for (let x = 0; x < qMenu.arrColumn.length; x++) {
                    const column = qMenu.arrColumn[x];
                    result[column] = qMenu.rows[0][column];
                }
            }
        } catch (error) {
            result.status = false;
            result.error = error;
            result.message = error.message;
        }

        return result;
    }

    async Delete(req: express.Request) {
        const result: any = {};
        try {
            const qDeleteMenu = await query(`delete from tclmmenu where menu_id = $1`, [req.body.menu_id], req.datasource.admin);

            if (qDeleteMenu.rowCount > 0) {
                result.status = true;
                result.message = 'Successfully Delete Data';
                result.alert = true;
            } else {
                result.status = false;
                result.message = qDeleteMenu.error;
            }
        } catch (error) {
            result.status = false;
            result.error = error;
            result.message = error.message;
        }

        return result;
    }
}

export default new userMenu();
