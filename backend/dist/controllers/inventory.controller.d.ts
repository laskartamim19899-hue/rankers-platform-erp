import { Request, Response } from 'express';
export declare const getAllItems: (req: Request, res: Response) => Promise<void>;
export declare const createItem: (req: Request, res: Response) => Promise<void>;
export declare const issueItem: (req: Request, res: Response) => Promise<void>;
export declare const returnItem: (req: Request, res: Response) => Promise<void>;
export declare const deleteItem: (req: Request, res: Response) => Promise<void>;
export declare const getAllIssues: (req: Request, res: Response) => Promise<void>;
