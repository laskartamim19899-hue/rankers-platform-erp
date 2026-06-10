import { Request, Response } from 'express';
export declare const createInquiry: (req: Request, res: Response) => Promise<void>;
export declare const getInquiries: (req: Request, res: Response) => Promise<void>;
export declare const updateInquiryStatus: (req: Request, res: Response) => Promise<void>;
export declare const deleteInquiry: (req: Request, res: Response) => Promise<void>;
