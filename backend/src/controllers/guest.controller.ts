import { Request, Response } from 'express';
import prisma from '../prisma';

// GET all guest teachers with recent payments
export const getAllGuestTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    const teachers = await prisma.guestTeacher.findMany({
      include: {
        payments: { orderBy: { paidAt: 'desc' }, take: 6 }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// CREATE guest teacher
export const createGuestTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, subject, qualification, ratePerClass } = req.body;
    const teacher = await prisma.guestTeacher.create({
      data: { name, phone, email, subject, qualification, ratePerClass: parseFloat(ratePerClass) }
    });
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// UPDATE guest teacher
export const updateGuestTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, subject, qualification, ratePerClass } = req.body;
    const teacher = await prisma.guestTeacher.update({
      where: { id: req.params.id as string },
      data: { name, phone, email, subject, qualification, ratePerClass: parseFloat(ratePerClass) }
    });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// DELETE guest teacher (Deep wipe: Teacher + Payments + Associated Ledger/Expenses)
export const deleteGuestTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Fetch teacher and their payments to know what expenses to delete
    const teacher = await prisma.guestTeacher.findUnique({
      where: { id: id as string },
      include: { payments: true }
    });

    if (!teacher) {
      res.status(404).json({ message: 'Guest teacher not found' });
      return;
    }

    // 2. Perform deep delete in a transaction
    await prisma.$transaction(async (tx) => {
      // Find all expenses linked to this teacher's payments
      // We search by payeeName and purpose
      const relatedExpenses = await tx.expense.findMany({
        where: {
          payeeName: teacher.name,
          purpose: 'GUEST_FACULTY_PAYROLL'
        }
      });

      // Delete the expenses
      if (relatedExpenses.length > 0) {
        await tx.expense.deleteMany({
          where: { id: { in: relatedExpenses.map(e => e.id) } }
        });
      }

      // Delete all payments
      await tx.guestPayment.deleteMany({
        where: { guestTeacherId: id as string }
      });

      // Finally delete the teacher profile
      await tx.guestTeacher.delete({
        where: { id: id as string }
      });
    });

    res.json({ message: 'Teacher, payment history, and ledger records completely wiped.' });
  } catch (error) {
    console.error('Deep Delete Guest Teacher Error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// DISBURSE payment to guest teacher
export const disburseGuestPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { guestTeacherId, month, classesHeld, ratePerClass, allowances, paymentMode, transactionId, remarks } = req.body;
    const classes = parseInt(classesHeld);
    const rate = parseFloat(ratePerClass);
    const allow = parseFloat(allowances || '0');
    const classAmount = classes * rate;
    const totalAmount = classAmount + allow;

    // 1. Get guest teacher name
    const guest = await prisma.guestTeacher.findUnique({
      where: { id: guestTeacherId }
    });

    if (!guest) {
      res.status(404).json({ message: 'Guest teacher not found' });
      return;
    }

    // 2. Create payment and expense in a transaction
    const [payment] = await prisma.$transaction([
      prisma.guestPayment.create({
        data: {
          guestTeacherId,
          month,
          classesHeld: classes,
          ratePerClass: rate,
          classAmount,
          allowances: allow,
          totalAmount,
          paymentMode,
          transactionId,
          remarks,
          status: 'PAID'
        },
        include: { guestTeacher: true }
      }),
      prisma.expense.create({
        data: {
          title: `Guest Teacher Payment - ${guest.name} - ${month}`,
          category: 'SALARY',
          amount: totalAmount,
          date: new Date(),
          description: `${classes} classes @ ₹${rate}/class. Allowances: ₹${allow}`,
          payeeName: guest.name,
          purpose: 'GUEST_FACULTY_PAYROLL'
        }
      })
    ]);

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET payment by ID (for slip)
export const getGuestPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await prisma.guestPayment.findUnique({
      where: { id: req.params.id as string },
      include: { guestTeacher: true }
    });
    if (!payment) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET all payments for a guest teacher
export const getGuestPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await prisma.guestPayment.findMany({
      where: { guestTeacherId: req.params.id as string },
      orderBy: { paidAt: 'desc' },
      include: { guestTeacher: true }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// DELETE payment record
export const deleteGuestPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // 1. Get the payment details before deleting to find the associated expense
    const payment = await prisma.guestPayment.findUnique({
      where: { id: id as string },
      include: { guestTeacher: true }
    });

    if (!payment) {
      res.status(404).json({ message: 'Payment record not found' });
      return;
    }

    // 2. Use a transaction to delete both the payment and the potential expense
    await prisma.$transaction(async (tx) => {
      // Delete the payment
      await tx.guestPayment.delete({ where: { id: id as string } });

      // Try to find and delete the associated expense
      // We search by amount, payee name, and purpose
      const relatedExpense = await tx.expense.findFirst({
        where: {
          amount: payment.totalAmount,
          payeeName: payment.guestTeacher.name,
          purpose: 'GUEST_FACULTY_PAYROLL',
          // Optionally check for same day if we want to be very strict
        }
      });

      if (relatedExpense) {
        await tx.expense.delete({ where: { id: relatedExpense.id } });
      }
    });

    res.json({ message: 'Payment and associated ledger entry deleted' });
  } catch (error) {
    console.error('Delete Guest Payment Error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
