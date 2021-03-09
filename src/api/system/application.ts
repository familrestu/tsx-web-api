import express, { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { v5 as uuidv5 } from 'uuid';
import hash from 'hash.js';
import moment from 'moment';
import emp from '../hris/emp/EmpData';

// import { Pool, Client } from 'pg';
// const pool = new Pool();

type JWTPayloadType = {
    [key: string]: string | string[] | number | number[] | {[key: string]: string} | {[key: string]: string}[] | null;
};

type MenuDataType = {
    group: string | null;
    groupid: string | null;
    id: string;
    icon: string | null;
    name: string;
    link: string;
    componentPath: string | null;
    isMenu: 0 | 1 | 'No' | 'Yes' /* No | 0 = not showing at menu */;
    isGlobal: 0 | 1 | 'No' | 'Yes' /* opening page didn't based on CurrentApp (menuAuthState) */;
    accessmode: 0 | 1 | 2 | 3 | 'read' | 'write' | 'update' | 'delete';
    children?: MenuDataType[];
};

type MenuAuthReturnType = {
    menuData: MenuDataType[];
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
        const result: { [key: string]: any } = {
            status: false,
        };

        if ((req.body.email === 'dev@ersys.com' && req.body.password === 'password') || (req.body.is_accountcode !== undefined && req.body.username === 'dev' && req.body.password === 'password')) {
            const data: JWTPayloadType = {
                user_id: 1,
                username: 'famil.restu',
                email: 'famil.restu@ersys.com',
                app_id: 1,
                app_code: 'ersys',
                app_name: 'Ersys HR',
                app_logo: null,
                app_logo_small: null,
                activated_app: ['hris'],
                app_list: [{ app_code: 'ersys', app_name: 'Ersys HR' }],
                default_app: 'hris',
                current_app: 'hris',
                full_name: 'Famil Restu Pambudi',
                profile_picture: 'emil.jpg',
            };

            this.SetJWT(req, res, data);
            result.loginStatus = true;
            result.status = true;
        } else {
            result.message = 'Wrong username or password'
            result.loginStatus = false;
            result.status = false;
        }

        // result.debug = true;

        return result;
    }

    GetMenuAuth(): MenuAuthReturnType {
        return {
            menuData: [
                {
                    group: null,
                    groupid: null,
                    id: 'dashboard',
                    icon: 'fas fa-tachometer-alt',
                    name: 'Dashboard',
                    link: '/',
                    componentPath: '/dashboard',
                    isMenu: 'Yes',
                    isGlobal: 'Yes',
                    accessmode: 1,
                },
                {
                    group: null,
                    groupid: null,
                    id: 'profile',
                    icon: null,
                    name: 'Profile',
                    link: '/profile',
                    componentPath: '/profile/',
                    isMenu: 'No',
                    isGlobal: 'Yes',
                    accessmode: 3,
                },
                {
                    group: null,
                    groupid: null,
                    id: 'profile-personal-info',
                    icon: null,
                    name: 'Profile | Personal Info',
                    link: '/profile/personal-information',
                    componentPath: '/profile/personal-information',
                    isMenu: 'No',
                    isGlobal: 'Yes',
                    accessmode: 3,
                },
                {
                    group: null,
                    groupid: null,
                    id: 'profile-account-info',
                    icon: null,
                    name: 'Profile | Account Info',
                    link: '/profile/account-information',
                    componentPath: '/profile/account-information',
                    isMenu: 'No',
                    isGlobal: 'Yes',
                    accessmode: 3,
                },
                {
                    group: null,
                    groupid: null,
                    id: 'profile-address',
                    icon: null,
                    name: 'Profile | Address',
                    link: '/profile/address',
                    componentPath: '/profile/address',
                    isMenu: 'No',
                    isGlobal: 'Yes',
                    accessmode: 0,
                },
                {
                    group: 'employee',
                    groupid: 'employee',
                    id: 'employee',
                    icon: 'fas fa-users',
                    name: 'Employee Lists',
                    link: '/employee',
                    componentPath: '/employee/',
                    isMenu: 'Yes',
                    isGlobal: 'No',
                    accessmode: 0,
                },
                {
                    group: 'employee',
                    groupid: 'employee',
                    id: 'employee-details',
                    icon: 'fas fa-users',
                    name: 'Employee Details',
                    link: '/employee/details/:employee_no',
                    componentPath: '/employee/details',
                    isMenu: 'No',
                    isGlobal: 'No',
                    accessmode: 3,
                },
                {
                    group: 'employee',
                    groupid: 'employee',
                    id: 'employee-add',
                    icon: null,
                    name: 'Add Employee',
                    link: '/employee/add',
                    componentPath: '/employee/add',
                    isMenu: 'No',
                    isGlobal: 'No',
                    accessmode: 3,
                },
                {
                    group: 'components',
                    groupid: 'components',
                    id: 'components-modal',
                    icon: null,
                    name: 'Modal',
                    link: '/components/modal',
                    componentPath: '/components/modal',
                    isMenu: 'No',
                    isGlobal: 'Yes',
                    accessmode: 3,
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
        let result: { [key: string]: any } = {
            loginStatus: false,
        };

        if (req.signedCookies.jwt && req.signedCookies.uuid) {
            try {
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
        const result: { [key: string]: any } = {
            loginStatus: false,
        };

        try {
            if (req.signedCookies.jwt && req.signedCookies.uuid) {
                const decoded = this.VerifyJWT(req.signedCookies.uuid, req.signedCookies.jwt);
                const currentTime = moment();
                const expiredAt = moment(decoded.exp * 1000);
                const tokenTimeLeft = Math.round(expiredAt.diff(currentTime) / 1000);

                /* renew token on range 0 to 20 seconds */
                if (tokenTimeLeft >= 0 && tokenTimeLeft <= 20) {
                    this.SetJWT(req, res, decoded.data);
                    result.refreshToken = true;
                }

                result.loginStatus = true;
            }
        } catch (error) {
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

    GetSearch(req: express.Request, res: express.Response) {
        type SearchDetails = {
            link: string;
            navlink: string;
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
                link: `/employee/details/${empno}`,
                navlink: '/employee/details/:employee_no',
                title: `${fullname} (${empno})`,
                type: 'employee',
            });
        }

        return { data: arrReturn, datasets };
    }

    /* async TestDB(req: express.Request, res: express.Response) {
        const infSchem = await pool.query('select * from information_schema.tables');
        // res.send(infSchem);
        return infSchem;
    } */
}

export default new Global();
