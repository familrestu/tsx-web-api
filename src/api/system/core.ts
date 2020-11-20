import express from 'express';
import jwt from 'jsonwebtoken';
import { v5 as uuidv5 } from 'uuid';
import hash from 'hash.js';

import { query } from './../../config/database';

class Core {
    login(req: express.Request, res: express.Response) {
        let result: any = {
            status: false,
        };

        /* query(`select 1`).then((res) => {
            console.log(res);
        }); */

        if (req.body.email === 'famil.restu@ersys.com' && req.body.password === 'password') {
            const data = {
                user_id: 1,
                app: [],
                defaultApp: null,
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
                user_id: data.user_id,
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

    loginStatus(req: express.Request, res: express.Response) {
        let result: any = {
            loginStatus: false,
        };

        if (req.signedCookies.jwt && req.signedCookies.uuid) {
            try {
                const jwtSignature = hash.sha256().update(`${req.signedCookies.uuid}${process.env.JWT_KEY}`).digest('hex');
                const decoded: any = jwt.verify(req.signedCookies.jwt, jwtSignature);

                const now = Date.now();
                const exp = decoded.exp * 1000;

                console.log(exp - now, new Date(exp), new Date(now));

                result = { ...result, ...decoded.data, /* exp, now, */ loginStatus: true };
            } catch (error) {
                result.loginStatus = false;
                result.error = error;
                result.message = error.message;
            }
        }

        return { ...result };
    }

    logout(req: express.Request, res: express.Response) {
        res.clearCookie('jwt');
        res.clearCookie('uuid');
        return { loginStatus: true };
    }
}

export default new Core();
