import express from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Express } from 'express-serve-static-core';

import './env';

const allowedHost = process.env.ALLOWED_HOST;
const arrAllowedHost = allowedHost ? allowedHost.split(',') : [];

const delegateCostOptions = (req: any, callback: any) => {
    const corsOptions: any = {};
    if (req.header('Origin') !== undefined) {
        if (arrAllowedHost && arrAllowedHost.indexOf(req.header('Origin')) !== -1) {
            corsOptions.origin = true;
            corsOptions.credentials = true;
        } else {
            corsOptions.origin = false;
        }
    } else {
        corsOptions.origin = false;
    }

    callback(null, corsOptions);
};

const allMiddleware = (app: Express): void => {
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser('secret'));

    app.use((req, res, next) => {
        const reqOrigin = req.get('origin');
        let allowOrigin = '';

        if (reqOrigin !== undefined) {
            allowOrigin = arrAllowedHost.indexOf(reqOrigin) >= 0 ? arrAllowedHost[arrAllowedHost.indexOf(reqOrigin)] : 'Block';
        }

        res.header('Access-Control-Allow-Origin', `${allowOrigin}`); // update to match the domain you will make the request from
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    app.use(cors(delegateCostOptions));

    /* middleware for all routes, only able to get and post */
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (['GET', 'POST'].indexOf(req.method) < 0) {
            res.status(500).json({ message: 'Cannot make request to server', statuscode: res.statusCode, status: false });
        } else {
            next();
        }
    });
};

export default allMiddleware;
