import { Request, Response } from 'express';
export declare const getStudentFees: (req: Request, res: Response) => Promise<void>;
export declare const recordPayment: (req: Request, res: Response) => Promise<void>;
export declare const allocateFee: (req: Request, res: Response) => Promise<void>;
export declare const getAllDues: (req: Request, res: Response) => Promise<void>;
export declare const getAllPendingFees: (req: Request, res: Response) => Promise<void>;
export declare const getPayment: (req: Request, res: Response) => Promise<void>;
export declare const deletePayment: (req: Request, res: Response) => Promise<void>;
export declare const getStudentLedger: (req: Request, res: Response) => Promise<void>;
