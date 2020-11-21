import { Express } from 'express-serve-static-core';
import packagejson from '../../package.json';
import express from 'express';

import jwt from 'jsonwebtoken';
// import { v5 as uuidv5 } from 'uuid';
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
        const path = `/${req.params.module}/${req.params.method}`;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const api = require(`../api${path}`).default;
        const result = api[req.params.function](req, res);
        // console.log(typeof result);
        // res.json({ ...result });
        res.send(result);
    });

    /* not authorized */
    app.use((req: express.Request, res: express.Response) => {
        res.status(404);
        res.send({ error: 'Not authorized', status: false });
    });
};

const checkJWT = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (req.params.module !== 'system') {
        try {
            if (req.signedCookies.jwt && req.signedCookies.uuid) {
                const uuid = req.signedCookies.uuid;
                const jwtSignature = hash.sha256().update(`${uuid}${process.env.JWT_KEY}`).digest('hex');
                jwt.verify(req.signedCookies.jwt, jwtSignature);
                next();
            }
        } catch (error) {
            res.status(403);
            res.send({ error: error.code, message: error.message });
        }
    } else {
        next();
    }
};

export default routes;
