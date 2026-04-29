-- CreateTable
CREATE TABLE "GuestTeacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "subject" TEXT NOT NULL,
    "qualification" TEXT,
    "ratePerClass" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GuestPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guestTeacherId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "classesHeld" INTEGER NOT NULL,
    "ratePerClass" REAL NOT NULL,
    "classAmount" REAL NOT NULL,
    "allowances" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "paymentMode" TEXT NOT NULL DEFAULT 'CASH',
    "transactionId" TEXT,
    "remarks" TEXT,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    CONSTRAINT "GuestPayment_guestTeacherId_fkey" FOREIGN KEY ("guestTeacherId") REFERENCES "GuestTeacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
