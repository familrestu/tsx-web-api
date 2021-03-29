import express from 'express';
import { query, queryReturnType } from '@database';

type UserMenuDataType = {
    menu_id: string;
    menu_name: string;
    group_name: string | null;
    icon: string | null;
    url: string | null;
    pagepath: string | null;
    access_only: 0 | 1 | 'No' | 'Yes';
    accessmode: 0 | 1 | 2 | 3 | 'read' | 'write' | 'update' | 'delete';
    children?: UserMenuDataType[];
};

type UserAccessDataType = {
    name: string;
    url: string | null;
    pagepath: string | null;
    accessmode: 0 | 1 | 2 | 3 | 'read' | 'write' | 'update' | 'delete';
};

type UserMenuReturnType = {
    menuData: UserMenuDataType[];
    accessData: UserAccessDataType[];
    status: boolean;
};

class Application {
    async GetSearch(req: express.Request, res: express.Response) {
        /* type SearchDetails = {
            url: string;
            navurl: string;
            title: string;
            type: string;
            params?: { [key: string]: string };
        };

        const { datasets } = emp.TableData();
        const arrReturn: SearchDetails[] = [];
        const fullNameIndex = datasets.header.indexOf('full_name');
        const empNoIndex = datasets.header.indexOf('employee_no');

        for (let i = 0; i < datasets.body[empNoIndex].length; i++) {
            const empno = datasets.body[empNoIndex][i];
            const fullname = datasets.body[fullNameIndex][i];
            arrReturn.push({
                url: `/employee/details/${empno}`,
                navurl: '/employee/details/:employee_no',
                title: `${fullname} (${empno})`,
                type: 'employee',
            });
        }

        return { data: arrReturn, datasets }; */

        const result = {
            data: [],
            datasets: [],
        };

        return result;
    }

    async getMenu(req: express.Request): Promise<UserMenuReturnType> {
        const result: UserMenuReturnType = {
            menuData: [],
            accessData: [],
            status: false,
        };

        try {
            if (req.user) {
                if (req.user.user_type === 9) {
                    const qMenu = await query(
                        `
                    select      menu_id, parent_id, menu_name, group_name, icon, url, pagepath, access_only
                    from        tclmmenu
                    where       status = $1
                    order by    menu_order, menu_id, parent_id`,
                        [1],
                        req.datasource.admin,
                    );

                    if (qMenu.rowCount > 0) {
                        for (let x = 0; x < qMenu.rowCount; x++) {
                            const rows = qMenu.rows[x];
                            if (rows.parent_id === 0) {
                                const { menu_id, menu_name, group_name, icon, url, pagepath, access_only } = rows;
                                if (access_only !== 1) {
                                    result.menuData.push({
                                        menu_id,
                                        menu_name,
                                        group_name,
                                        icon,
                                        url,
                                        pagepath,
                                        access_only: access_only,
                                        accessmode: 3,
                                        children: this.GetMenuChildren(qMenu, rows.menu_id),
                                    });
                                }
                            }

                            /* access take get all from tclmmenu */
                            if (rows.pagepath) {
                                result.accessData.push({
                                    name: rows.menu_name,
                                    url: rows.url,
                                    pagepath: rows.pagepath,
                                    accessmode: 3,
                                });
                            }
                        }

                        result.status = true;
                    }
                }
            }
        } catch (error) {
            result.status = false;
            console.log(error);
        }

        return result;
    }

    GetMenuChildren(qMenu: queryReturnType, parent_id: number): UserMenuDataType[] {
        const result: UserMenuDataType[] = [];

        for (let x = 0; x < qMenu.rowCount; x++) {
            const rows = qMenu.rows[x];
            if (rows.parent_id === parent_id) {
                const { menu_id, menu_name, group_name, icon, url, pagepath, access_only } = rows;
                if (access_only !== 1) {
                    result.push({
                        menu_id,
                        menu_name,
                        group_name,
                        icon,
                        url,
                        pagepath,
                        access_only: access_only,
                        accessmode: 3,
                        children: this.GetMenuChildren(qMenu, rows.menu_id),
                    });
                }
            }
        }

        return result;
    }

    logError(req: express.Request) {
        // console.log(req);
    }

    async Query() {
        const qTest = await query(`select * from tclmmenu`, [], 'db_ersysdev');
        return qTest;
    }
}

export default new Application();
