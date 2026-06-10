import { Request, Response } from 'express';
export declare const getVehicles: (req: Request, res: Response) => Promise<void>;
export declare const createVehicle: (req: Request, res: Response) => Promise<void>;
export declare const getRoutes: (req: Request, res: Response) => Promise<void>;
export declare const createRoute: (req: Request, res: Response) => Promise<void>;
export declare const allocateTransport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
