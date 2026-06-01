import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "teacher", "student"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Student profile table
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  studentId: varchar("studentId", { length: 64 }).notNull().unique(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  contactNumber: varchar("contactNumber", { length: 20 }),
  section: varchar("section", { length: 64 }),
  gradeLevel: varchar("gradeLevel", { length: 64 }),
  department: varchar("department", { length: 255 }),
  semester: int("semester").default(1),
  gpa: varchar("gpa", { length: 10 }).default("0.00"),
  profilePicture: text("profilePicture"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

// Teacher profile table
export const teachers = mysqlTable("teachers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  employeeId: varchar("employeeId", { length: 64 }).notNull().unique(),
  department: varchar("department", { length: 255 }),
  specialization: varchar("specialization", { length: 255 }),
  profilePicture: text("profilePicture"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = typeof teachers.$inferInsert;

// Courses table (kept for backward compatibility)
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  courseCode: varchar("courseCode", { length: 64 }).notNull().unique(),
  courseTitle: varchar("courseTitle", { length: 255 }).notNull(),
  courseType: varchar("courseType", { length: 64 }).notNull(), // Theory, Practical, Lab
  semester: int("semester").notNull(),
  credits: int("credits").default(3),
  teacherId: int("teacherId").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// Course enrollment table
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  courseId: int("courseId").notNull(),
  status: varchar("status", { length: 64 }).default("active"), // active, completed, dropped
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
});

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

// Classes table (new structure for better organization)
export const classes = mysqlTable("classes", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacherId").notNull(),
  className: varchar("className", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  section: varchar("section", { length: 64 }).notNull(),
  schoolYear: varchar("schoolYear", { length: 64 }).notNull(),
  description: text("description"),
  isArchived: boolean("isArchived").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Class = typeof classes.$inferSelect;
export type InsertClass = typeof classes.$inferInsert;

// Class-Student enrollment (many-to-many)
export const classEnrollments = mysqlTable("classEnrollments", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(),
  studentId: int("studentId").notNull(),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
});

export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type InsertClassEnrollment = typeof classEnrollments.$inferInsert;

// Grades table
export const grades = mysqlTable("grades", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  courseId: int("courseId").notNull(),
  grade: varchar("grade", { length: 2 }), // A, B, C, D, F
  marks: int("marks"),
  totalMarks: int("totalMarks").default(100),
  percentage: varchar("percentage", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Grade = typeof grades.$inferSelect;
export type InsertGrade = typeof grades.$inferInsert;

// Attendance table
export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(),
  studentId: int("studentId").notNull(),
  date: timestamp("date").notNull(),
  status: mysqlEnum("status", ["present", "absent", "late", "excused"]).notNull(),
  remarks: varchar("remarks", { length: 255 }),
  recordedBy: int("recordedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

// Announcements table
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacherId").notNull(),
  courseId: int("courseId"),
  classId: int("classId"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  priority: varchar("priority", { length: 64 }).default("normal"), // high, normal, low
  isGlobal: boolean("isGlobal").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

// Assignments table (enhanced with new structure)
export const assignments = mysqlTable("assignments", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(),
  teacherId: int("teacherId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  dueDate: timestamp("dueDate"),
  maxScore: int("maxScore").default(100),
  section: varchar("section", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = typeof assignments.$inferInsert;

// Attachments table for file management
export const attachments = mysqlTable("attachments", {
  id: int("id").autoincrement().primaryKey(),
  assignmentId: int("assignmentId"),
  submissionId: int("submissionId"),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileType: varchar("fileType", { length: 64 }).notNull(),
  fileSize: int("fileSize"),
  uploadedBy: int("uploadedBy").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;

// Assignment submissions table (enhanced with status)
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  assignmentId: int("assignmentId").notNull(),
  studentId: int("studentId").notNull(),
  status: mysqlEnum("status", ["pending", "submitted", "reviewed", "graded"]).default("pending"),
  marksObtained: int("marksObtained"),
  remarks: text("remarks"),
  submittedAt: timestamp("submittedAt"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

// Notifications table for real-time updates
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 64 }).notNull(), // assignment_created, assignment_graded, submission_received, announcement_posted
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedId: int("relatedId"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
