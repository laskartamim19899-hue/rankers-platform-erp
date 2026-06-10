import { Request, Response } from 'express';
export declare const getSettings: (req: Request, res: Response) => Promise<void>;
export declare const updateSettings: (req: Request, res: Response) => Promise<void>;
export declare const waiveLateFee: (req: Request, res: Response) => Promise<void>;
