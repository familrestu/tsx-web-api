import express from 'express';

import debug from 'debug';
import { Express } from 'express-serve-static-core';

import routes from './config/routes';
import middlewares from './config/middlewares';
import database from './config/database';

import './config/env';

const port = process.env.PORT || 5000;
const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

(async () => {
    const app = express();

    // await database();

    await database();

    // console.log('test');

    app.listen(port)
        .on('error', (err: NodeJS.ErrnoException) => () => onErrorServer(err))
        .on('listening', () => onServerListening(app));
})();

const onErrorServer = (err: NodeJS.ErrnoException) => {
    if (err.syscall === 'listen') {
        throw err;
    }

    if (err.code?.toUpperCase() === 'EACCES') {
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
    } else if (err.code?.toUpperCase() === 'EADDRINUSE') {
        console.error(bind + ' is already in use');
        process.exit(1);
    } else {
        throw err;
    }
};

const onServerListening = (app: Express) => {
    // debugger
    debug('server')(`Listening on ${bind}`);

    // all middleware
    middlewares(app);

    // application routes
    routes(app);

    // console.clear();

    console.log(`Listening on port: ${port}`);
};
