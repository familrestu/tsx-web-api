declare namespace Express {
    export interface Request {
        isAppRoutes?: boolean;
        currentApp?: string;
    }
}
