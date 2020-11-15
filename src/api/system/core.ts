import express from 'express';
import jwt from 'jsonwebtoken';
import { v5 as uuidv5 } from 'uuid';
import hash from 'hash.js';

class Core {
    login(req: express.Request, res: express.Response) {
        let result: any = {
            status: false,
        };

        if (req.body.email === 'famil.restu@ersys.com' && req.body.password === 'password') {
            const data = {
                user_id: 1,
                app: [],
                username: 'famil.restu',
                email: 'famil.restu@ersys.com',
                full_name: 'Famil Restu Pambudi',
                profile_picture: 'https://lh3.googleusercontent.com/ogw/ADGmqu8Xth9CuZj0MrKx-cdFhmJXKFCCr9eEwgIy4qci1A=s83-c-mo',
            };

            const uuid = uuidv5(data.email, `${process.env.UUID_NAMESPACE as string}`);
            console.log(uuid);
            const iat = Math.floor(Date.now() / 1000);
            const exp = Date.now() / 1000 + 60 * 60;

            const jwtSignature = hash.sha256().update(uuid).digest('hex');

            const jwtPayload = {
                iss: req.headers.host,
                sub: data.username || data.email,
                uuid,
                user_id: data.user_id,
                iat,
                exp: Math.floor(exp),
            };

            result.jwt = jwt.sign(jwtPayload, jwtSignature);
            res.cookie('jwt', result.jwt, { httpOnly: true, signed: true });
            result.status = true;

            result = { ...result, ...data, uuid };
        }

        return { ...result };
    }

    loginStatus(req: express.Request, res: express.Response) {
        const result: any = {
            loginStatus: false,
        };

        if (req.signedCookies.jwt) {
            try {
                if (jwt.verify(req.signedCookies.jwt, process.env.JWT_KEY as string)) {
                    result.loginStatus = true;
                } else {
                    result.loginStatus = false;
                    result.message = 'JWT Expired';
                }
            } catch (error) {
                result.loginStatus = false;
                result.error = error;
                result.message = error.message;
            }
        }

        return { ...result };
    }

    logout() {
        return 'logout';
    }
}

export default new Core();
