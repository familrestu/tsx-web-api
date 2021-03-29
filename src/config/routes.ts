import { Express } from 'express-serve-static-core';
import packagejson from '../../package.json';
import express from 'express';
import npmpath from 'path';
import fs from 'fs-extra';
import jwt from 'jsonwebtoken';
import hash from 'hash.js';

const routes = (app: Express): void => {
    const apiRouting = process.env.NODE_ENV === 'development' ? '/api/*' : '/*';

    /* check api version */
    app.all('/', (req, res) => {
        res.json({
            name: packagejson.name,
            version: packagejson.version,
        });
    });

    /* api to get photo */
    app.use('/files/:client/:folder/:file_name', (req: express.Request, res: express.Response) => {
        // console.log(req.params)
        const { client, folder, file_name } = req.params;
        const path = npmpath.join(__dirname, '../../public/client/', client, folder, file_name);
        // console.log(path)
        try {
            const img = fs.readFileSync(path);
            // res.writeHead(200, { 'Content-Type': 'image/jpg' })
            res.status(200);
            res.header({ 'Content-Type': 'image/jpg' });
            res.end(img, 'binary');
        } catch (error) {
            res.status(404);
            res.send({ status: false, message: `${path} not found` });
        }
    });

    /* start: api routing */
    app.route(apiRouting).all(async (req: express.Request, res: express.Response) => {
        /* load api */
        let fileName = '';
        let functionName = '';

        const arrTempFolderPath: string[] = [];
        const arrUrl = req.url.split('/');

        /* set fileName dan functionName */
        if (arrUrl.length) {
            if (arrUrl[arrUrl.length - 1]) {
                fileName = arrUrl[arrUrl.length - 1].split('.')[0];
                functionName = arrUrl[arrUrl.length - 1].split('.')[1];
            }
        }

        /* check JWT */
        if ((fileName !== 'authorization' && functionName !== 'login') || (fileName !== 'authorization' && functionName !== 'logout')) {
            try {
                /* only check if jwt and uuid exists in signed cookies and file is not authorization and function is not login or logout */
                if (req.signedCookies.jwt && req.signedCookies.uuid) {
                    const uuid = req.signedCookies.uuid;
                    const jwtSignature = hash.sha256().update(`${uuid}${process.env.JWT_KEY}`).digest('hex');
                    const decoded: any = jwt.verify(req.signedCookies.jwt, jwtSignature);

                    /* set new routes based on curent_app */
                    req.current_app = decoded.data.current_app;

                    /* set request variable */
                    req.company_id = decoded.data.company_id;
                    req.company_code = decoded.data.company_code;
                    req.datasource = {
                        admin: `db_${decoded.data.company_code}`,
                        payroll: `db_${decoded.data.company_code}`,
                    };

                    /* user type */
                    req.user = {
                        user_id: decoded.data.user_id,
                        username: decoded.data.username,
                        email: decoded.data.email,
                        company_id: decoded.data.company_id,
                        company_code: decoded.data.company_code,
                        user_type: decoded.data.user_type,
                    };
                } else {
                    if (req.signedCookies === undefined && fileName !== 'application' && functionName === 'getMenu') {
                        res.status(500);
                        res.send({ error: 'NotAuthorized', message: 'You are not authorized' });
                        return false;
                    }
                }
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    res.status(200);
                    res.clearCookie('jwt');
                    res.clearCookie('uuid');
                    res.send({ error: error.code, message: error.message, stack: error });
                    return false;
                } else {
                    res.status(403);
                    res.send({ error: error.code, message: error.message, stack: error });
                    return false;
                }
            }
        }

        const urlIndexNumber = process.env.NODE_ENV === 'development' ? 2 : 1;

        /* masukin url menjadi array */
        if (arrUrl.length > urlIndexNumber) {
            for (let x = urlIndexNumber; x < arrUrl.length - 1; x++) {
                const url = arrUrl[x];
                arrTempFolderPath.push(url);
            }
        }

        /* jika bukan filenya application, authorization  */
        if ((arrUrl[urlIndexNumber] !== 'system' && fileName !== 'application') || (arrUrl[urlIndexNumber] !== 'system' && fileName !== 'authorization')) {
            arrTempFolderPath.unshift(req.current_app);
        }

        const apipath = npmpath.join(__dirname, '../api', arrTempFolderPath.join('/'), fileName);
        // console.log(arrUrl, arrTempFolderPath, apipath);

        /* check if file exists */
        try {
            const isExists = fs.pathExistsSync(`${apipath}.${process.env.NODE_ENV === 'development' ? 'ts' : 'js'}`);
            if (isExists) {
                if (functionName === undefined) {
                    res.status(200);
                    res.send({ message: `Method not found in Url`, status: false });
                    return false;
                }
            } else {
                res.status(200);
                res.send({ message: `File ${fileName} not found`, status: false, apipath, arrUrl, arrTempFolderPath, env: process.env.NODE_ENV });
                return false;
            }
        } catch (error) {
            res.status(200);
            res.send({ message: `File ${fileName} not found`, status: false, error: error });
            return false;
        }

        /* load file */
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const api = require(apipath).default;
            const result = await api[functionName](req, res);

            res.send({
                status: true,
                ...result,
            });
            return false;
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const api = require(apipath).default;

            res.status(200);
            res.send({ message: `Method ${functionName} not found in ${fileName}`, status: false, error, apipath, arrUrl, arrTempFolderPath, env: process.env.NODE_ENV, api });
            // console.log(error);
            return false;
        }
    });
    /* end: api routing V2 */

    /* not authorized */
    app.use((req: express.Request, res: express.Response) => {
        res.status(401);
        res.send({ error: 'Not authorized', status: false });
    });
};

const checkJWT = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    /* login and logout doesn't require to chekc JWT */
    if (
        (req.params.module === 'system' && req.params.method === 'application' && req.params.function === 'Login') ||
        (req.params.module === 'system' && req.params.method === 'application' && req.params.function === 'Logout')
    ) {
        next();
    } else {
        try {
            /* only check if jwt and uuid exists in signed cookies */
            if (req.signedCookies.jwt && req.signedCookies.uuid) {
                const uuid = req.signedCookies.uuid;
                const jwtSignature = hash.sha256().update(`${uuid}${process.env.JWT_KEY}`).digest('hex');
                const decoded: any = jwt.verify(req.signedCookies.jwt, jwtSignature);

                /* set new routes based on curent_app */
                req.current_app = decoded.data.current_app;

                /* set request variable */
                req.company_id = decoded.data.company_id;
                req.company_code = decoded.data.company_code;
                req.datasource = {
                    admin: `db_${decoded.data.company_code}`,
                    payroll: `db_${decoded.data.company_code}`,
                };

                /* user type */
                req.user = {
                    user_id: decoded.data.user_id,
                    username: decoded.data.username,
                    email: decoded.data.email,
                    company_id: decoded.data.company_id,
                    company_code: decoded.data.company_code,
                    user_type: decoded.data.user_type,
                };
                // req.user.user_type = decoded.user_type;
                next();
            } else {
                /* if there is no signed cookies, and checking loginstatus, then next */
                if (req.params.module === 'system' && req.params.method === 'application' && (req.params.function === 'LoginStatus' || req.params.function === 'Register')) {
                    next();
                    /* if its getting menuAuth, send empty array */
                } else if (req.params.module === 'system' && req.params.method === 'application' && req.params.function === 'GetMenu') {
                    res.status(200);
                    res.send({ status: true, menuData: [] });
                } else {
                    /* else, then this guy is not authorized */
                    res.status(500);
                    res.send({ error: 'NotAuthorized', message: 'You are not authorized' });
                }
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(200);
                res.clearCookie('jwt');
                res.clearCookie('uuid');
                res.send({ error: error.code, message: error.message, stack: error });
            } else {
                res.status(403);
                res.send({ error: error.code, message: error.message, stack: error });
            }
        }
    }
};

const isGlobal = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (req.params.module === 'system' && req.params.method === 'application') {
        req.isGlobal = true;
    } else {
        req.isGlobal = false;
    }

    next();
};

export default routes;
