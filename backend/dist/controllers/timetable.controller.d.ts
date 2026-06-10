import { Request, Response } from 'express';
export declare const getTimetable: (req: Request, res: Response) => Promise<void>;
export declare const getAllTimetables: (req: Request, res: Response) => Promise<void>;
export declare const upsertTimetable: (req: Request, res: Response) => Promise<void>;
export declare const deleteSlot: (req: Request, res: Response) => Promise<void>;
