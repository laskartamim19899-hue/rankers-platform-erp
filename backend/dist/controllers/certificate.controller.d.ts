import { Request, Response } from 'express';
export declare const getCertificates: (req: Request, res: Response) => Promise<void>;
export declare const issueCertificate: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCertificateById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCertificate: (req: Request, res: Response) => Promise<void>;
