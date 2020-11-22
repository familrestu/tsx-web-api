import { Express } from 'express-serve-static-core';
import packagejson from '../../package.json';
import express from 'express';

import jwt from 'jsonwebtoken';
import hash from 'hash.js';

const routes = (app: Express): void => {
    app.all('/', (req, res) => {
        res.json({
            name: packagejson.name,
            version: packagejson.version,
        });
    });

    /* request to api */
    app.use('/api/:module/:method/:function', checkJWT);

    app.route('/api/:module/:method/:function').all((req: express.Request, res: express.Response) => {
        /* load api */
        let path;
        if (req.isAppRoutes) {
            path = `${req.currentApp}/${req.params.module}/${req.params.method}`;
        } else {
            path = `${req.params.module}/${req.params.method}`;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const api = require(`../api/${path}`).default;
            const result = api[req.params.function](req, res);

            res.send(result);
        } catch (error) {
            res.status(500);
            res.send({ error: `Function ${req.params.function} not found`, status: false });
        }
    });

    /* not authorized */
    app.use((req: express.Request, res: express.Response) => {
        res.status(401);
        res.send({ error: 'Not authorized', status: false });
    });
};

const checkJWT = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (req.params.module === 'system' && req.params.method === 'global') {
        req.isAppRoutes = false;
    } else {
        req.isAppRoutes = true;
    }

    /* login and logout doesn't require to chekc JWT */
    if (
        (req.params.module === 'system' && req.params.method === 'global' && req.params.function === 'Login') ||
        (req.params.module === 'system' && req.params.method === 'global' && req.params.function === 'Logout')
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
                /* if there is no signed cookies, and its a loginstatus checking, then next */
                if (req.params.module === 'system' && req.params.method === 'global' && req.params.function === 'LoginStatus') {
                    next();
                } else {
                    /* else, then this guy is not authorized */
                    res.status(500);
                    res.send({ error: 'JwtNoExists', message: 'You are not authorized' });
                }
            }
        } catch (error) {
            res.status(403);
            res.send({ error: error.code, message: error.message });
        }
    }
};

export default routes;
