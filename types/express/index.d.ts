// import { Express as ExpressTypes } from 'express';

declare namespace Express {
    export interface Request {
        isAppRoutes?: boolean;
        currentApp?: string;
    }
}

declare namespace NodeJS {
    export interface Global {
        Core: any;
    }
}
