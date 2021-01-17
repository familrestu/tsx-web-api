import express, { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { v5 as uuidv5 } from 'uuid';
import hash from 'hash.js';
import moment from 'moment';

import { query } from '@database';

type JWTPayloadType = {
    [key: string]: string | string[] | number | number[];
};

type MenuDataType = {
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
    children?: MenuDataType[];
};

type MenuAuthReturnType = {
    menuData: MenuDataType[];
};

type AuthReturnType = {
    loginStatus: boolean;
    refreshToken?: boolean;
    error?: TypeError;
    message?: string;
};

let cookeiConfig: CookieOptions;

if (process.env.NODE_ENV === 'development') {
    cookeiConfig = {
        httpOnly: true,
        signed: true,
        sameSite: 'lax',
    };
} else {
    cookeiConfig = {
        httpOnly: true,
        signed: true,
        sameSite: 'none',
        secure: true,
    };
}

class Global {
    SetJWT(req: express.Request, res: express.Response, data: JWTPayloadType) {
        const expiredNumber = 15 * 60;
        const cookieExp = new Date(Date.now() + expiredNumber * 1000);

        const iat = Math.floor(Date.now() / 1000);
        const exp = Date.now() / 1000 + expiredNumber;
        const uuid = uuidv5(iat.toString(), `${process.env.UUID_NAMESPACE as string}`);
        const jwtSignature = hash.sha256().update(`${uuid}${process.env.JWT_KEY}`).digest('hex');
        const jwtPayload = {
            // user_id: data.user_id,
            iss: req.headers.host,
            sub: data.username || data.email,
            data,
            iat,
            exp: Math.floor(exp),
        };

        cookeiConfig.expires = cookieExp;

        res.cookie('jwt', jwt.sign(jwtPayload, jwtSignature), cookeiConfig);
        res.cookie('uuid', uuid, cookeiConfig);
    }

    Login(req: express.Request, res: express.Response) {
        const result: any = {
            status: false,
        };

        if ((req.body.email === 'dev@ersys.com' && req.body.password === 'password') || (req.body.is_accountcode !== undefined && req.body.username === 'dev' && req.body.password === 'password')) {
            const data: JWTPayloadType = {
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

            this.SetJWT(req, res, data);
            result.loginStatus = true;
        }

        return { ...result };
    }

    GetMenuAuth_DEV(): MenuAuthReturnType {
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
                    icon: 'fas fa-calendar-day',
                    name: 'Calendar',
                    link: '/components/calendar',
                    componentPath: '/components/CalendarScreen',
                    isMenu: 'Yes',
                    isGlobal: 'Yes',
                    accessmode: 0,
                },
            ],
        };
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
                    group: 'Employee',
                    groupid: 'employee',
                    id: 'employee',
                    icon: 'fas fa-users',
                    name: 'Employee Lists',
                    link: '/employee/list',
                    componentPath: '/employee/EmployeeListScreen',
                    isMenu: 'Yes',
                    isGlobal: 'No',
                    accessmode: 0,
                },
                {
                    group: 'Employee',
                    groupid: 'employee',
                    id: 'employee',
                    icon: 'fas fa-users',
                    name: 'Employee Lists',
                    link: '/employee/list/details/:employee_no',
                    componentPath: '/employee/EmployeeListDetailScreen',
                    isMenu: 'No',
                    isGlobal: 'No',
                    accessmode: 0,
                },
            ],
        };
    }

    GetHoliday() {
        return {
            holiday: [
                { date: '25-12-YYYY', name: 'Christmas Eve' },
                { date: '31-12-YYYY', name: 'New Years Eve' },
                { date: '01-01-YYYY', name: 'New Years Eve' },
                { date: '17-08-YYYY', name: 'Indonesian Independance Day' },
                { date: '01-05-YYYY', name: 'International Labor Day' },
                { date: '12-02-2021', name: 'Chinese Lunar Festival' },
                { date: '11-03-2021', name: 'Ascension of the Prophet Muhammad' },
                { date: '14-03-2021', name: "Bali's Day of Silence and Hindu New Year" },
                { date: '02-04-2021', name: 'Good Friday' },
                { date: '04-04-2021', name: 'Easter Sunday' },
                { date: '13-05-2021', name: 'Ascension Day of Jesus Christ' },
                { date: '13-05-2021', name: 'Idul Fitri' },
                { date: '14-05-2021', name: 'Idul Fitri Holiday' },
            ],
        };
    }

    VerifyJWT(uuid: string, jwtString: string) {
        const jwtSignature = hash.sha256().update(`${uuid}${process.env.JWT_KEY}`).digest('hex');
        const decoded: any = jwt.verify(jwtString, jwtSignature);

        return decoded;
    }

    LoginStatus(req: express.Request) {
        let result: AuthReturnType = {
            loginStatus: false,
        };

        if (req.signedCookies.jwt && req.signedCookies.uuid) {
            try {
                // const jwtSignature = hash.sha256().update(`${req.signedCookies.uuid}${process.env.JWT_KEY}`).digest('hex');
                // const decoded: any = jwt.verify(req.signedCookies.jwt, jwtSignature);
                const decoded = this.VerifyJWT(req.signedCookies.uuid, req.signedCookies.jwt);

                result = { ...result, ...decoded.data, loginStatus: true };
            } catch (error) {
                result.loginStatus = false;
                result.error = error;
                result.message = error.message;
            }
        } else {
            result.loginStatus = false;
            result.message = 'JWTNoExists';
        }

        return { ...result };
    }

    GetToken(req: express.Request, res: express.Response) {
        const result: AuthReturnType = {
            loginStatus: false,
        };

        try {
            if (req.signedCookies.jwt && req.signedCookies.uuid) {
                const decoded = this.VerifyJWT(req.signedCookies.uuid, req.signedCookies.jwt);
                const currentTime = moment();
                const expiredAt = moment(decoded.exp * 1000);
                const tokenTimeLeft = Math.round(expiredAt.diff(currentTime) / 1000);

                // console.log(`user_id: ${decoded.data.user_id}, app_id: ${decoded.data.app_id}, available: ${tokenTimeLeft.toFixed(2)} seconds left`);

                /* renew token on range 0 to 20 seconds */
                if (tokenTimeLeft >= 0 && tokenTimeLeft <= 20) {
                    this.SetJWT(req, res, decoded.data);
                    result.refreshToken = true;
                }

                result.loginStatus = true;
            }
        } catch (error) {
            // console.log(error);
            result.loginStatus = false;
            result.error = error;
            result.message = error.message;

            res.clearCookie('jwt');
            res.clearCookie('uuid');
        }

        return result;
    }

    Logout(req: express.Request, res: express.Response) {
        res.clearCookie('jwt', cookeiConfig);
        res.clearCookie('uuid', cookeiConfig);
        return { loginStatus: false, message: 'Successfully logout' };
    }
}

export default new Global();
