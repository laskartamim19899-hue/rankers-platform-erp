import { Request, Response } from 'express';
export declare const getAllHostels: (req: Request, res: Response) => Promise<void>;
export declare const allocateRoom: (req: Request, res: Response) => Promise<void>;
export declare const deallocateRoom: (req: Request, res: Response) => Promise<void>;
export declare const createHostel: (req: Request, res: Response) => Promise<void>;
export declare const deleteHostel: (req: Request, res: Response) => Promise<void>;
