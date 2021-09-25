import express, { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { v5 as uuidv5 } from 'uuid';
import hash from 'hash.js';
import moment from 'moment';
import bcrypt from 'bcrypt';
import { query } from '@database';

type JWTPayloadType = {
    [key: string]: string | string[] | number | number[] | { [key: string]: string } | { [key: string]: string }[] | null;
};

class Authorization {
    CookieConfig: CookieOptions | undefined;

    constructor() {
        this.Init();
    }

    Init() {
        /* if (process.env.NODE_ENV === 'development') {
            this.CookieConfig = {
                httpOnly: true,
                signed: true,
                sameSite: 'lax',
            };
        } else {
            this.CookieConfig = {
                httpOnly: true,
                signed: true,
                sameSite: 'none',
                secure: true,
            };
        } */

        this.CookieConfig = {
            httpOnly: true,
            signed: true,
            sameSite: 'lax',
        };
    }

    setJWT(req: express.Request, res: express.Response, data: JWTPayloadType) {
        const expiredNumber = 15 * 60;
        const cookieExp = new Date(Date.now() + expiredNumber * 1000);

        const iat = Math.floor(Date.now() / 1000);
        const exp = Date.now() / 1000 + expiredNumber;
        const uuid = uuidv5(iat.toString(), `${process.env.UUID_NAMESPACE as string}`);
        const jwtSignature = hash.sha256().update(`${uuid}${process.env.JWT_KEY}`).digest('hex');
        const jwtPayload = {
            iss: req.headers.host,
            sub: data.user_name || data.user_email,
            data,
            iat,
            exp: Math.floor(exp),
        };

        if (this.CookieConfig) {
            this.CookieConfig.expires = cookieExp;
            res.cookie('jwt', jwt.sign(jwtPayload, jwtSignature), this.CookieConfig);
            res.cookie('uuid', uuid, this.CookieConfig);
        }
    }

    verifyJWT(uuid: string, jwtString: string) {
        const jwtSignature = hash.sha256().update(`${uuid}${process.env.JWT_KEY}`).digest('hex');
        const decoded: any = jwt.verify(jwtString, jwtSignature);

        return decoded;
    }

    loginStatus(req: express.Request) {
        let result: { [key: string]: any } = {
            loginStatus: false,
        };

        if (req.signedCookies) {
            if (req.signedCookies.jwt && req.signedCookies.uuid) {
                try {
                    const decoded = this.verifyJWT(req.signedCookies.uuid, req.signedCookies.jwt);

                    result = { ...result, ...decoded.data, loginStatus: true };
                } catch (error: any) {
                    result.loginStatus = false;
                    result.error = error;
                    result.message = error.message;
                }
            } else {
                result.loginStatus = false;
                result.message = 'JWTNoExists';
            }
        }

        return result;
    }

    checkToken(req: express.Request, res: express.Response) {
        const result: { [key: string]: any } = {
            loginStatus: false,
        };

        try {
            if (req.signedCookies.jwt && req.signedCookies.uuid) {
                const decoded = this.verifyJWT(req.signedCookies.uuid, req.signedCookies.jwt);
                const currentTime = moment();
                const expiredAt = moment(decoded.exp * 1000);
                const tokenTimeLeft = Math.round(expiredAt.diff(currentTime) / 1000);

                /* renew token on range 0 to 20 seconds */
                if (tokenTimeLeft >= 0 && tokenTimeLeft <= 20) {
                    this.setJWT(req, res, decoded.data);
                    result.refreshToken = true;
                }

                result.loginStatus = true;
            }
        } catch (error: any) {
            result.loginStatus = false;
            result.error = error;
            result.message = error.message;

            res.clearCookie('jwt');
            res.clearCookie('uuid');
        }

        return result;
    }

    async login(req: express.Request, res: express.Response) {
        const result: { [key: string]: string | number | boolean } = {
            status: false,
        };

        try {
            const { useAccountcode, accountcode, email, username, password } = req.body;
            const company_code = useAccountcode !== undefined && useAccountcode === 'Y' ? accountcode : email.split('@')[1].split('.')[0];
            const database = `db_${company_code}`;

            /* check account */
            const qAccount = await query('select datname from pg_database where datname = $1', [database], database);
            if (qAccount.rowCount > 0) {
                let qUser;
                if (useAccountcode !== undefined && useAccountcode === 'Y') {
                    qUser = await query(
                        `select user_id, user_uuid, user_name, user_password, email, displayname, profile_picture,
                                user_type, is_reset, last_login, last_reset, status 
                        from    tclmuser 
                        where   user_name = $1`,
                        [username],
                        database,
                    );
                } else {
                    qUser = await query(
                        `select user_id, user_uuid, user_name, user_password, email, displayname, profile_picture,
                                user_type, is_reset, last_login, last_reset, status 
                        from    tclmuser
                        where   email = $1`,
                        [email],
                        database,
                    );
                }

                if (qUser.rowCount > 0) {
                    const rowDataUser = qUser.rows[0];
                    if (rowDataUser.status === 0) {
                        result.message = 'User inactive.\nContact system administrator';
                    } else {
                        /* check password */
                        if (bcrypt.compareSync(password, rowDataUser.user_password)) {
                            /* superadmin */
                            if (rowDataUser.user_type === 9) {
                                const qCompany = await query(
                                    `select company_id, company_code, company_name, company_address, company_logo, company_logo_small, app_type, is_default 
                                    from    teomcompany
                                    where   company_code = $1`,
                                    [company_code],
                                    database,
                                );

                                if (qCompany.rowCount > 0) {
                                    const rowDataCompany = qCompany.rows[0];

                                    const data: JWTPayloadType = {
                                        user_id: rowDataUser.user_id,
                                        user_name: rowDataUser.user_name,
                                        email: rowDataUser.email,
                                        company_id: rowDataCompany.company_id,
                                        company_code: rowDataCompany.company_code,
                                        company_name: rowDataCompany.company_name,
                                        company_logo: rowDataCompany.company_logo,
                                        company_logo_small: rowDataCompany.company_logo_small,
                                        current_app: rowDataCompany.app_type,
                                        displayname: rowDataUser.displayname,
                                        profile_picture: rowDataUser.profile_picture,
                                        user_type: rowDataUser.user_type,
                                    };

                                    this.setJWT(req, res, data);

                                    result.loginStatus = true;
                                    result.status = true;
                                    result.alert = false;
                                }
                            } else {
                                /*  */
                            }
                        } else {
                            result.message = 'Wrong username or password';
                        }
                    }
                } else {
                    result.message = 'Wrong username or password';
                }
            } else {
                result.message = 'Company not found!\nContact System Administrator';
            }
        } catch (error: any) {
            result.message = `Something wrong.\nContact system administrator!.\n${error.message}`;
            console.log(error.message);
        }

        return result;
    }

    logout(req: express.Request, res: express.Response) {
        if (this.CookieConfig) {
            res.clearCookie('jwt', this.CookieConfig);
            res.clearCookie('uuid', this.CookieConfig);
            return { loginStatus: false, message: 'Successfully logout' };
        }
    }

    /* http://localhost:5000/api/system/application/Register?username=ersysdev&password=P455w0rd.2020!&company_code=ersysdev&email=famil.restu@ersysdev.com&adminregister=3m!l0nly! */
    async register(req: express.Request, res: express.Response) {
        let result: any = {};

        if (req.query.adminregister !== undefined && req.query.adminregister === '3m!l0nly!') {
            const { genSaltSync, hashSync } = bcrypt;
            const { username, password, email, company_code } = req.query;
            const database = `db_${company_code}`;

            const salt = genSaltSync(10);
            const hashPassword = hashSync(password, salt);
            const combinedString = this.shuffleString(`${username} ${email} ${moment().toString()}`);
            const uuid = uuidv5(combinedString, `${process.env.UUID_NAMESPACE as string}`);
            result = {
                ...req.query,
            };
            result.combinedString = combinedString;
            result.hashPassword = hashPassword;
            result.uuid = uuid;

            try {
                const qInsert = await query(
                    `insert into tclmuser (
                    user_uuid, 
                    user_name, 
                    user_password, 
                    email, 
                    displayname,
                    user_type,
                    status
                ) values ($1, $2, $3, $4, $5, $6, $7)`,
                    [uuid, username, hashPassword, email, username, 9, 1],
                    database,
                );

                // console.log(qInsert);
            } catch (error: any) {
                result.error = error;
                console.log(error.message);
            }
        } else {
            result.status = false;
            result.message = 'Not Authorized';
        }

        return result;
    }

    shuffleString(string: string): string {
        const a = string.split(''),
            n = a.length;

        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = a[i];
            a[i] = a[j];
            a[j] = tmp;
        }

        return a.join('');
    }
}

export default new Authorization();
