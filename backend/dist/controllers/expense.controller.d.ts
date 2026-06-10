import { Request, Response } from 'express';
export declare const createExpense: (req: Request, res: Response) => Promise<void>;
export declare const getExpenses: (req: Request, res: Response) => Promise<void>;
export declare const getExpense: (req: Request, res: Response) => Promise<void>;
export declare const deleteExpense: (req: Request, res: Response) => Promise<void>;
export declare const getCategories: (req: Request, res: Response) => Promise<void>;
export declare const createCategory: (req: Request, res: Response) => Promise<void>;
export declare const deleteCategory: (req: Request, res: Response) => Promise<void>;
