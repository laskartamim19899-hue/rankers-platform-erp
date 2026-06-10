import { Request, Response } from 'express';
export declare const getAnnouncements: (req: Request, res: Response) => Promise<void>;
export declare const createAnnouncement: (req: Request, res: Response) => Promise<void>;
export declare const deleteAnnouncement: (req: Request, res: Response) => Promise<void>;
