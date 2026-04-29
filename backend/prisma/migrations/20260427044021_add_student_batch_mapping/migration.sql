-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudentCourse" (
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "batchId" TEXT,

    PRIMARY KEY ("studentId", "courseId"),
    CONSTRAINT "StudentCourse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentCourse_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StudentCourse" ("courseId", "studentId") SELECT "courseId", "studentId" FROM "StudentCourse";
DROP TABLE "StudentCourse";
ALTER TABLE "new_StudentCourse" RENAME TO "StudentCourse";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
