import { Request, Response } from 'express';
export declare const exportAllData: (req: Request, res: Response) => Promise<void>;
export declare const resetAllData: (req: Request, res: Response) => Promise<void>;
export declare const importData: (req: Request, res: Response) => Promise<void>;
