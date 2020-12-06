import express from 'express';
import jwt from 'jsonwebtoken';
import { v5 as uuidv5 } from 'uuid';
import hash from 'hash.js';

import { query } from '@database';

type MenuAuthReturnType = {
    menuData: {
        group: string | null;
        groupid: string | null;
        id: string;
        icon: string | null;
        name: string;
        link: string;
        componentPath?: string;
        isMenu: 0 | 1 | 'No' | 'Yes';
        isGlobal: 0 | 1 | 'No' | 'Yes';
        accessmode?: 0 | 1 | 2 | 3 | 'read' | 'write' | 'update' | 'delete';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children?: any;
    }[];
};

class Global {
    Login(req: express.Request, res: express.Response) {
        let result: any = {
            status: false,
        };

        if (
            (req.body.email === 'famil.restu@ersys.com' && req.body.password === 'password') ||
            (req.body.is_accountcode !== undefined && req.body.username === 'famil.restu' && req.body.password === 'password')
        ) {
            const data = {
                user_id: 1,
                app_id: 1,
                activated_app: ['hris'],
                default_app: 'hris',
                current_app: 'hris',
                username: 'famil.restu',
                email: 'famil.restu@ersys.com',
                full_name: 'Famil Restu Pambudi',
                profile_picture: 'https://lh3.googleusercontent.com/ogw/ADGmqu8Xth9CuZj0MrKx-cdFhmJXKFCCr9eEwgIy4qci1A=s83-c-mo',
            };

            const uuid = uuidv5(data.email, `${process.env.UUID_NAMESPACE as string}`);

            const iat = Math.floor(Date.now() / 1000);
            const exp = Date.now() / 1000 + 60 * 60;

            const jwtSignature = hash.sha256().update(`${uuid}${process.env.JWT_KEY}`).digest('hex');

            const jwtPayload = {
                // user_id: data.user_id,
                iss: req.headers.host,
                sub: data.username || data.email,
                data,
                iat,
                exp: Math.floor(exp),
            };

            result.jwt = jwt.sign(jwtPayload, jwtSignature);

            res.cookie('jwt', result.jwt, { httpOnly: true, signed: true, sameSite: 'lax' });
            res.cookie('uuid', uuid, { httpOnly: true, signed: true, sameSite: 'lax' });

            result.loginStatus = true;

            result = { ...result, ...data, uuid };
        }

        return { ...result };
    }

    GetMenuAuth(): MenuAuthReturnType {
        return {
            menuData: [
                {
                    group: null,
                    groupid: null,
                    id: 'profile',
                    icon: null,
                    name: 'Profile',
                    link: '/profile',
                    componentPath: '/profile/ProfileScreen',
                    isMenu: 'No',
                    isGlobal: 'Yes',
                    accessmode: 0,
                },
                {
                    group: 'Attendance',
                    groupid: 'attendance',
                    id: 'attendance',
                    icon: 'fas fa-clock',
                    name: 'Attendance Data',
                    link: '/attendance/attendancedata',
                    componentPath: '/attendance/AttendanceDataScreen',
                    isMenu: 'Yes',
                    isGlobal: 'No',
                    accessmode: 0,
                },
                {
                    group: 'Attendance',
                    groupid: 'attendance',
                    id: 'attendance',
                    icon: 'fas fa-clock',
                    name: 'Attendance Data',
                    link: '/attendance/attendancedata/details/:date',
                    componentPath: '/attendance/AttendanceDataDetailsScreen',
                    isMenu: 'No',
                    isGlobal: 'No',
                    accessmode: 0,
                },
                {
                    group: 'Components',
                    groupid: 'components',
                    id: 'components',
                    icon: 'fas fa-table',
                    name: 'Table',
                    link: '/components/table',
                    componentPath: '/components/TableScreen',
                    isMenu: 'Yes',
                    isGlobal: 'Yes',
                    accessmode: 0,
                },
                {
                    group: 'Components',
                    groupid: 'components',
                    id: 'calendar',
                    icon: 'fas fa-calendar',
                    name: 'Calendar',
                    link: '/components/calendar',
                    componentPath: '/components/CalendarScreen',
                    isMenu: 'Yes',
                    isGlobal: 'Yes',
                    accessmode: 0,
                },
            ],
        };
        /* return [
            {
                group: 'Components',
                groupid: 'components',
                id: 'form',
                icon: 'fas fa-clipboard',
                name: 'form',
                link: '/form',
            },
            {
                group: 'Components',
                groupid: 'components',
                id: 'page',
                icon: 'fas fa-columns',
                name: 'page',
                link: '/page',
            },
            {
                group: 'Components',
                groupid: 'components',
                id: 'table',
                icon: 'fas fa-table',
                name: 'table',
                link: '/table',
            },
            {
                group: 'Bootstrap',
                groupid: 'bootstrap',
                id: 'input',
                icon: 'fas fa-keyboard',
                name: 'input',
                link: '/bootstrap/input',
                children: [
                    {
                        group: null,
                        groupid: null,
                        id: 'text',
                        icon: null,
                        name: 'Text',
                        link: '/bootstrap/input/text',
                    },
                    {
                        group: 'Selection',
                        groupid: 'Selection',
                        id: 'radio',
                        icon: null,
                        name: 'radio',
                        link: '/bootstrap/input/radio',
                        children: [
                            {
                                group: 'nestedgroup',
                                groupid: 'nestedgroup',
                                id: 'textNested',
                                icon: null,
                                name: 'TextNested',
                                link: '/bootstrap/input/textNested',
                            },
                            {
                                group: 'nestedgroup',
                                groupid: 'nestedgroup',
                                id: 'radioNested',
                                icon: null,
                                name: 'radioNested',
                                link: '/bootstrap/input/radioNested',
                            },
                            {
                                group: 'nestedgroup',
                                groupid: 'nestedgroup',
                                id: 'checkboxNested',
                                icon: null,
                                name: 'checkboxNested',
                                link: '/bootstrap/input/checkboxNested',
                            },
                        ],
                    },
                    {
                        group: 'Selection',
                        groupid: 'Selection',
                        id: 'checkbox',
                        icon: null,
                        name: 'checkbox',
                        link: '/bootstrap/input/checkbox',
                    },
                ],
            },
        ]; */
    }

    LoginStatus(req: express.Request, res: express.Response) {
        let result: any = {
            loginStatus: false,
        };

        if (req.signedCookies.jwt && req.signedCookies.uuid) {
            try {
                const jwtSignature = hash.sha256().update(`${req.signedCookies.uuid}${process.env.JWT_KEY}`).digest('hex');
                const decoded: any = jwt.verify(req.signedCookies.jwt, jwtSignature);

                const now = Date.now();
                const exp = decoded.exp * 1000;

                // console.log(exp - now, new Date(exp), new Date(now));

                result = { ...result, ...decoded.data, /* exp, now, */ loginStatus: true };
            } catch (error) {
                result.loginStatus = false;
                result.error = error;
                result.message = error.message;
            }
        }

        return { ...result };
    }

    Logout(req: express.Request, res: express.Response) {
        res.clearCookie('jwt');
        res.clearCookie('uuid');
        return { loginStatus: true };
    }
}

export default new Global();
