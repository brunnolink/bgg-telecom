import { Request, Response, NextFunction } from 'express';
import { jwtSingleton } from './jwt';
 

export type AuthUser = {
    id: string; 
    role: "CLIENT" | "TECH";
};
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export function ensureAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token missing" });
    }

    const [, token] = authHeader.split(" ");

    try {
        const decoded = jwtSingleton.verify(token);

        req.user = {
            id: decoded.sub,
            role: decoded.role,
        };

        return next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
