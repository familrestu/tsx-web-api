import { Express } from 'express-serve-static-core';
import packagejson from '../../package.json';
import express from 'express';

const routes = (app: Express): void => {
    app.all('/', (req, res) => {
        res.json({
            name: packagejson.name,
            version: packagejson.version,
        });
    });

    /* request to api */
    app.route('/api/:module/:method/:function').all((req: express.Request, res: express.Response) => {
        /* system module doesn't need to check JWT */
        if (req.params.module !== 'system') {
            if (!checkJWT(req.signedCookies)) {
                res.status(403);
                res.json({ error: 'JWT Expired', statuscode: res.statusCode, status: false });
            }
        }

        /* load api */
        const path = `/${req.params.module}/${req.params.method}`;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const api = require(`../api${path}`).default;
        const result = api[req.params.function](req, res);

        res.json({ ...result });
    });

    /* not authorized */
    app.use((req: express.Request, res: express.Response) => {
        res.status(404);
        res.json({ error: 'Not authorized', status: false });
    });
};

const checkJWT = (jwt: any): boolean => {
    return true;
};

export default routes;
