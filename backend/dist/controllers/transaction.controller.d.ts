import { Request, Response } from 'express';
export declare const getTransactionHistory: (req: Request, res: Response) => Promise<void>;
export declare const getTransactionByTxnId: (req: Request, res: Response) => Promise<void>;
