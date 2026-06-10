import { Request, Response } from 'express';
export declare const getAllStaffSalaries: (req: Request, res: Response) => Promise<void>;
export declare const upsertStaffProfile: (req: Request, res: Response) => Promise<void>;
export declare const disburseSalary: (req: Request, res: Response) => Promise<void>;
export declare const getSalaryRecord: (req: Request, res: Response) => Promise<void>;
export declare const getStaffSalaryHistory: (req: Request, res: Response) => Promise<void>;
export declare const deleteSalaryRecord: (req: Request, res: Response) => Promise<void>;
