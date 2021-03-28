declare namespace Express {
    export interface Request {
        isGlobal?: boolean;
        current_app: string;
        company_id: number;
        company_code: string;
        user: {
            user_id: number;
            username: string;
            email: string;
            company_id: number;
            company_code: string;
            user_type: number;
        };
        datasource: {
            admin: string;
            payroll: string;
        };
    }
}
