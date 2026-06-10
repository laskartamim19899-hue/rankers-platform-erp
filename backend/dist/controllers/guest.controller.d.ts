import { Request, Response } from 'express';
export declare const getAllGuestTeachers: (req: Request, res: Response) => Promise<void>;
export declare const createGuestTeacher: (req: Request, res: Response) => Promise<void>;
export declare const updateGuestTeacher: (req: Request, res: Response) => Promise<void>;
export declare const deleteGuestTeacher: (req: Request, res: Response) => Promise<void>;
export declare const disburseGuestPayment: (req: Request, res: Response) => Promise<void>;
export declare const getGuestPayment: (req: Request, res: Response) => Promise<void>;
export declare const getGuestPaymentHistory: (req: Request, res: Response) => Promise<void>;
export declare const deleteGuestPayment: (req: Request, res: Response) => Promise<void>;
