import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import financeRoutes from './routes/finance.routes';
import academicRoutes from './routes/academic.routes';
import residentialRoutes from './routes/residential.routes';
import communicationRoutes from './routes/communication.routes';
import reportRoutes from './routes/report.routes';
import expenseRoutes from './routes/expense.routes';
import settingsRoutes from './routes/settings.routes';
import transactionRoutes from './routes/transaction.routes';
import userRoutes from './routes/user.routes';
import inquiryRoutes from './routes/inquiry.routes';
import leaveRoutes from './routes/leave.routes';
import timetableRoutes from './routes/timetable.routes';
import inventoryRoutes from './routes/inventory.routes';
import meritRoutes from './routes/merit.routes';
import salaryRoutes from './routes/salary.routes';
import guestRoutes from './routes/guest.routes';
import dataRoutes from './routes/data.routes';
import transportRoutes from './routes/transport.routes';
import certificateRoutes from './routes/certificate.routes';
import otherIncomeRoutes from './routes/otherIncome.routes';
import cbtRoutes from './routes/cbt.routes';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/residential', residentialRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/merit', meritRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/other-income', otherIncomeRoutes);
app.use('/api/cbt', cbtRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
