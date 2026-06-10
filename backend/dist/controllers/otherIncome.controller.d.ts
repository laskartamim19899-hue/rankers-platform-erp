import { Request, Response } from 'express';
export declare const createOtherIncome: (req: Request, res: Response) => Promise<void>;
export declare const getAllOtherIncome: (req: Request, res: Response) => Promise<void>;
export declare const getOtherIncomeById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteOtherIncome: (req: Request, res: Response) => Promise<void>;
