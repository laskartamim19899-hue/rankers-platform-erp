import express, { Application, Request, Response } from 'express';
import cors from 'cors';
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

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

export default app;
