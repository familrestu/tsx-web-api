import { Express } from 'express-serve-static-core';
import packagejson from '../../package.json';
import express from 'express';
import npmpath from 'path';
import fs from 'fs-extra';
import jwt from 'jsonwebtoken';
import hash from 'hash.js';


const routes = (app: Express): void => {
    const apiRouting = process.env.NODE_ENV === 'development' ? '/api/:module/:method/:function' : '/:module/:method/:function';

    app.all('/', (req, res) => {
        res.json({
            name: packagejson.name,
            version: packagejson.version,
        });
    });

    /* request photo */
    app.use('/files/:client/:folder/:file_name', (req: express.Request, res: express.Response) => {
        // console.log(req.params)
        const { client, folder, file_name } = req.params;
        const path = npmpath.join(__dirname, '../../public/client/', client, folder, file_name );
        // console.log(path)
        try {
            const img = fs.readFileSync(path)
            // res.writeHead(200, { 'Content-Type': 'image/jpg' })
            res.status(200);
            res.header({ 'Content-Type': 'image/jpg' })
            res.end(img, 'binary')
        } catch (error) {
            res.status(404);
            res.send({ status: false, message: `${path} not found` });
        }

    })

    /* request to api */
    app.use(apiRouting, checkJWT);

    app.route(apiRouting).all(async (req: express.Request, res: express.Response) => {
        /* load api */
        let path;
        /* appRoutes is relative to application API */
        /* such as hris, etc... */
        if (req.isAppRoutes) {
            path = `${req.currentApp}/${req.params.module}/${req.params.method}`;
        } else {
            path = `${req.params.module}/${req.params.method}`;
        }

        try {
            // const apipath = `../api/${path}`;
            const apipath = npmpath.join(__dirname, '../api/', path);
            // console.log(npmpath.resolve());
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const api = require(apipath).default;
            const result = await api[req.params.function](req, res);

            res.send({
                status: true,
                ...result,
            });
        } catch (error) {
            res.status(500);
            res.send({ error: `Function ${req.params.function} not found`, status: false, stack: error.message });
            // console.log(error);
        }
    });

    /* not authorized */
    app.use((req: express.Request, res: express.Response) => {
        res.status(401);
        res.send({ error: 'Not authorized', status: false });
    });
};

const checkJWT = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if ((req.params.module === 'system' && req.params.method === 'application') || req.params.module === 'components') {
        req.isAppRoutes = false;
    } else {
        req.isAppRoutes = true;
    }

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
                req.currentApp = decoded.data.current_app;
                next();
            } else {
                /* if there is no signed cookies, and checking loginstatus, then next */
                if (req.params.module === 'system' && req.params.method === 'application' && req.params.function === 'LoginStatus') {
                    next();
                    /* if its getting menuAuth, send empty array */
                } else if (req.params.module === 'system' && req.params.method === 'application' && req.params.function === 'GetMenuAuth') {
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

export default routes;
