import { and, eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, students, teachers, courses, grades, attendance, announcements, assignments, enrollments, submissions, classes, classEnrollments, attachments, notifications } from "../drizzle/schema";
import { ENV } from "./_core/env";
import type { InsertStudent, InsertTeacher, InsertCourse, InsertGrade, InsertAttendance, InsertAnnouncement, InsertAssignment, InsertEnrollment, InsertSubmission, InsertClass, InsertClassEnrollment, InsertAttachment, InsertNotification } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Student queries
export async function getStudentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(students).where(eq(students.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createStudent(data: InsertStudent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(students).values(data);
  return (result as any).insertId || 0;
}

export async function getStudentCourses(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
}

// Teacher queries
export async function getTeacherByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTeacher(data: InsertTeacher) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(teachers).values(data);
  return (result as any).insertId || 0;
}

// Course queries
export async function getCoursesByTeacher(teacherId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.teacherId, teacherId));
}

export async function createCourse(data: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(courses).values(data);
  return (result as any).insertId || 0;
}

export async function getCourseById(courseId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Grade queries
export async function getStudentGrades(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(grades).where(eq(grades.studentId, studentId));
}

export async function createGrade(data: InsertGrade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(grades).values(data);
  return (result as any).insertId || 0;
}

export async function updateGrade(id: number, data: Partial<InsertGrade>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(grades).set(data).where(eq(grades.id, id));
}

export async function deleteGrade(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(grades).where(eq(grades.id, id));
}

// Attendance queries
export async function getStudentAttendance(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendance).where(eq(attendance.studentId, studentId)).orderBy(desc(attendance.date));
}

export async function createAttendance(data: InsertAttendance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(attendance).values(data);
  return (result as any).insertId || 0;
}

export async function getCourseAttendance(classId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendance).where(eq(attendance.classId, classId));
}

// Announcement queries
export async function getAnnouncements(classId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (classId) {
    return db.select().from(announcements).where(eq(announcements.classId, classId)).orderBy(desc(announcements.createdAt));
  }
  return db.select().from(announcements).orderBy(desc(announcements.createdAt));
}

export async function createAnnouncement(data: InsertAnnouncement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(announcements).values(data);
  return (result as any).insertId || 0;
}

export async function updateAnnouncement(id: number, data: Partial<InsertAnnouncement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(announcements).set(data).where(eq(announcements.id, id));
}

export async function deleteAnnouncement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(announcements).where(eq(announcements.id, id));
}

// Assignment queries
export async function getAssignmentsByCourse(classId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assignments).where(eq(assignments.classId, classId)).orderBy(desc(assignments.dueDate));
}

export async function createAssignment(data: InsertAssignment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(assignments).values(data);
  return (result as any).insertId || 0;
}

export async function updateAssignment(id: number, data: Partial<InsertAssignment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(assignments).set(data).where(eq(assignments.id, id));
}

export async function deleteAssignment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(assignments).where(eq(assignments.id, id));
}

// Submission queries
export async function getSubmissionsByAssignment(assignmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(submissions).where(eq(submissions.assignmentId, assignmentId));
}

export async function createSubmission(data: InsertSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(submissions).values(data);
  return (result as any).insertId || 0;
}

export async function updateSubmission(id: number, data: Partial<InsertSubmission>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(submissions).set(data).where(eq(submissions.id, id));
}

// Enrollment queries
export async function enrollStudent(data: InsertEnrollment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(enrollments).values(data);
  return (result as any).insertId || 0;
}

export async function getCourseEnrollments(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
}

// ========== NEW CRUD OPERATIONS FOR ENHANCED FEATURES ==========

// Class Management queries
export async function createClass(data: InsertClass) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(classes).values(data);
  return (result as any).insertId || 0;
}

export async function getClassById(classId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getClassesByTeacher(teacherId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(classes).where(and(eq(classes.teacherId, teacherId), eq(classes.isArchived, false))).orderBy(desc(classes.createdAt));
}

export async function getAllClasses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(classes).where(eq(classes.isArchived, false)).orderBy(desc(classes.createdAt));
}

export async function updateClass(id: number, data: Partial<InsertClass>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(classes).set(data).where(eq(classes.id, id));
}

export async function deleteClass(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(classes).where(eq(classes.id, id));
}

export async function archiveClass(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(classes).set({ isArchived: true }).where(eq(classes.id, id));
}

// Class Enrollment queries
export async function enrollStudentInClass(data: InsertClassEnrollment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(classEnrollments).values(data);
  return (result as any).insertId || 0;
}

export async function getClassStudents(classId: number) {
  const db = await getDb();
  if (!db) return [];
  const enrollments = await db.select().from(classEnrollments).where(eq(classEnrollments.classId, classId));
  const studentIds = enrollments.map(e => e.studentId);
  if (studentIds.length === 0) return [];
  
  // Get student details
  return db.select().from(students).where(
    and(...studentIds.map(id => eq(students.id, id)))
  );
}

export async function getStudentClasses(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  const enrollments = await db.select().from(classEnrollments).where(eq(classEnrollments.studentId, studentId));
  const classIds = enrollments.map(e => e.classId);
  if (classIds.length === 0) return [];
  
  // Get class details
  return db.select().from(classes).where(
    and(...classIds.map(id => eq(classes.id, id)))
  );
}

export async function removeStudentFromClass(classId: number, studentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(classEnrollments).where(and(eq(classEnrollments.classId, classId), eq(classEnrollments.studentId, studentId)));
}

// Enhanced Assignment queries (using classId instead of courseId)
export async function getAssignmentsByClass(classId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assignments).where(eq(assignments.classId, classId)).orderBy(desc(assignments.dueDate));
}

export async function getAssignmentById(assignmentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(assignments).where(eq(assignments.id, assignmentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAssignmentForClass(data: InsertAssignment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(assignments).values(data);
  return (result as any).insertId || 0;
}

export async function updateAssignmentForClass(id: number, data: Partial<InsertAssignment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(assignments).set(data).where(eq(assignments.id, id));
}

export async function deleteAssignmentForClass(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(assignments).where(eq(assignments.id, id));
}

// Attachment queries
export async function createAttachment(data: InsertAttachment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(attachments).values(data);
  return (result as any).insertId || 0;
}

export async function getAttachmentsByAssignment(assignmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attachments).where(eq(attachments.assignmentId, assignmentId));
}

export async function getAttachmentsBySubmission(submissionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attachments).where(eq(attachments.submissionId, submissionId));
}

export async function deleteAttachment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(attachments).where(eq(attachments.id, id));
}

// Enhanced Submission queries
export async function getSubmissionById(submissionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(submissions).where(eq(submissions.id, submissionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentSubmission(assignmentId: number, studentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(submissions).where(and(eq(submissions.assignmentId, assignmentId), eq(submissions.studentId, studentId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAssignmentSubmissions(assignmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(submissions).where(eq(submissions.assignmentId, assignmentId)).orderBy(desc(submissions.submittedAt));
}

export async function createOrUpdateSubmission(assignmentId: number, studentId: number, data: Partial<InsertSubmission>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getStudentSubmission(assignmentId, studentId);
  if (existing) {
    await db.update(submissions).set(data).where(eq(submissions.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(submissions).values({
      assignmentId,
      studentId,
      status: "pending",
      ...data,
    });
    return (result as any).insertId || 0;
  }
}

// Attendance queries (updated for classes)
export async function getClassAttendance(classId: number, date?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  if (date) {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    
    return db.select().from(attendance).where(and(eq(attendance.classId, classId), eq(attendance.date, dateStart)));
  }
  
  return db.select().from(attendance).where(eq(attendance.classId, classId)).orderBy(desc(attendance.date));
}

export async function recordAttendance(data: InsertAttendance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(attendance).values(data);
  return (result as any).insertId || 0;
}

export async function getStudentClassAttendance(classId: number, studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendance).where(and(eq(attendance.classId, classId), eq(attendance.studentId, studentId))).orderBy(desc(attendance.date));
}

export async function calculateAttendancePercentage(classId: number, studentId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const allRecords = await db.select().from(attendance).where(and(eq(attendance.classId, classId), eq(attendance.studentId, studentId)));
  
  if (allRecords.length === 0) return 0;
  
  const presentCount = allRecords.filter(r => r.status === "present").length;
  return Math.round((presentCount / allRecords.length) * 100);
}

// Notification queries
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return (result as any).insertId || 0;
}

export async function getUserNotifications(userId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];
  
  if (unreadOnly) {
    return db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false))).orderBy(desc(notifications.createdAt));
  }
  
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

// Student management queries
export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(students).orderBy(desc(students.createdAt));
}

export async function getStudentById(studentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateStudent(id: number, data: Partial<InsertStudent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(students).set(data).where(eq(students.id, id));
}

export async function deleteStudent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(students).where(eq(students.id, id));
}

export async function searchStudents(query: string) {
  const db = await getDb();
  if (!db) return [];
  // Basic search - in production, use full-text search or similar
  const allStudents = await db.select().from(students);
  return allStudents.filter(s => 
    s.fullName.toLowerCase().includes(query.toLowerCase()) ||
    s.studentId.toLowerCase().includes(query.toLowerCase()) ||
    s.email?.toLowerCase().includes(query.toLowerCase())
  );
}

export async function getStudentsBySection(section: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(students).where(eq(students.section, section));
}
