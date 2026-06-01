import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Student routes
  student: router({
    profile: protectedProcedure.query(({ ctx }) => db.getStudentByUserId(ctx.user.id)),
    
    createProfile: protectedProcedure
      .input(z.object({
        studentId: z.string(),
        fullName: z.string(),
        email: z.string().optional(),
        contactNumber: z.string().optional(),
        section: z.string().optional(),
        gradeLevel: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createStudent({
        userId: ctx.user.id,
        studentId: input.studentId,
        fullName: input.fullName,
        email: input.email || null,
        contactNumber: input.contactNumber || null,
        section: input.section || null,
        gradeLevel: input.gradeLevel || null,
      })),
    
    courses: protectedProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) return [];
      return db.getStudentCourses(student.id);
    }),
    
    grades: protectedProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) return [];
      return db.getStudentGrades(student.id);
    }),
    
    attendance: protectedProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) return [];
      return db.getStudentAttendance(student.id);
    }),
  }),

  // Teacher routes
  teacher: router({
    profile: protectedProcedure.query(({ ctx }) => db.getTeacherByUserId(ctx.user.id)),
    
    createProfile: protectedProcedure
      .input(z.object({
        employeeId: z.string(),
        department: z.string().optional(),
        specialization: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createTeacher({
        userId: ctx.user.id,
        employeeId: input.employeeId,
        department: input.department,
        specialization: input.specialization,
      })),
    
    courses: protectedProcedure.query(async ({ ctx }) => {
      const teacher = await db.getTeacherByUserId(ctx.user.id);
      if (!teacher) return [];
      return db.getCoursesByTeacher(teacher.id);
    }),
  }),

  // Grade routes
  grades: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) return [];
      return db.getStudentGrades(student.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        studentId: z.number(),
        courseId: z.number(),
        grade: z.string().optional(),
        marks: z.number().optional(),
        totalMarks: z.number().optional(),
        percentage: z.string().optional(),
      }))
      .mutation(({ input }) => db.createGrade(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        grade: z.string().optional(),
        marks: z.number().optional(),
        percentage: z.string().optional(),
      }))
      .mutation(({ input }) => db.updateGrade(input.id, input)),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteGrade(input.id)),
  }),

  // Attendance routes
  attendance: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) return [];
      return db.getStudentAttendance(student.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        studentId: z.number(),
        classId: z.number(),
        date: z.date(),
        status: z.enum(["present", "absent", "late", "excused"]),
        remarks: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) throw new Error("Teacher profile not found");
        return db.createAttendance({
          ...input,
          recordedBy: teacher.id,
        });
      }),
  }),

  // Announcement routes
  announcements: router({
    list: publicProcedure
      .input(z.object({ courseId: z.number().optional() }))
      .query(({ input }) => db.getAnnouncements(input.courseId)),
    
    create: protectedProcedure
      .input(z.object({
        courseId: z.number().optional(),
        title: z.string(),
        content: z.string(),
        priority: z.string().optional(),
        isGlobal: z.boolean().optional(),
        section: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) throw new Error("Teacher profile not found");
        return db.createAnnouncement({
          title: input.title,
          content: input.content,
          courseId: input.courseId,
          priority: input.priority,
          isGlobal: input.isGlobal,
          teacherId: teacher.id,
          // Note: section field can be stored/used for filtering when creating notification records
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        priority: z.string().optional(),
      }))
      .mutation(({ input }) => db.updateAnnouncement(input.id, input)),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteAnnouncement(input.id)),
  }),

  // Assignment routes
  assignments: router({
    listByCourse: publicProcedure
      .input(z.object({ courseId: z.number() }))
      .query(({ input }) => db.getAssignmentsByCourse(input.courseId)),
    
    create: protectedProcedure
      .input(z.object({
        classId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        instructions: z.string().optional(),
        dueDate: z.date().optional(),
        maxScore: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) throw new Error("Teacher profile not found");
        return db.createAssignment({
          teacherId: teacher.id,
          classId: input.classId,
          title: input.title,
          description: input.description,
          instructions: input.instructions,
          dueDate: input.dueDate,
          maxScore: input.maxScore,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(({ input }) => db.updateAssignment(input.id, input)),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteAssignment(input.id)),
  }),

  // ========== NEW ROUTERS FOR ENHANCED FEATURES ==========

  // Student Management routes
  students: router({
    all: protectedProcedure.query(() => db.getAllStudents()),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getStudentById(input.id)),
    
    getByUserId: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(({ input }) => db.getStudentByUserId(input.userId)),
    
    create: protectedProcedure
      .input(z.object({
        studentId: z.string(),
        fullName: z.string(),
        email: z.string().email().optional(),
        contactNumber: z.string().optional(),
        section: z.string().optional(),
        gradeLevel: z.string().optional(),
        department: z.string().optional(),
        semester: z.number().optional(),
        profilePicture: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createStudent({
        userId: ctx.user.id,
        studentId: input.studentId,
        fullName: input.fullName,
        email: input.email || null,
        contactNumber: input.contactNumber || null,
        section: input.section || null,
        gradeLevel: input.gradeLevel || null,
        department: input.department || null,
        semester: input.semester,
        profilePicture: input.profilePicture || null,
      })),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        fullName: z.string().optional(),
        email: z.string().email().optional(),
        contactNumber: z.string().optional(),
        section: z.string().optional(),
        gradeLevel: z.string().optional(),
        gpa: z.string().optional(),
        profilePicture: z.string().optional(),
      }))
      .mutation(({ input }) => db.updateStudent(input.id, input)),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteStudent(input.id)),
    
    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input }) => db.searchStudents(input.query)),
    
    bySection: protectedProcedure
      .input(z.object({ section: z.string() }))
      .query(({ input }) => db.getStudentsBySection(input.section)),
  }),

  // Classes Management routes
  classes: router({
    all: protectedProcedure.query(() => db.getAllClasses()),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getClassById(input.id)),
    
    byTeacher: protectedProcedure.query(async ({ ctx }) => {
      const teacher = await db.getTeacherByUserId(ctx.user.id);
      if (!teacher) return [];
      return db.getClassesByTeacher(teacher.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        className: z.string(),
        subject: z.string(),
        section: z.string(),
        schoolYear: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) throw new Error("Teacher profile not found");
        return db.createClass({
          ...input,
          teacherId: teacher.id,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        className: z.string().optional(),
        subject: z.string().optional(),
        section: z.string().optional(),
        schoolYear: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => db.updateClass(input.id, input)),
    
    archive: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.archiveClass(input.id)),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteClass(input.id)),
    
    students: protectedProcedure
      .input(z.object({ classId: z.number() }))
      .query(({ input }) => db.getClassStudents(input.classId)),
    
    enrollStudent: protectedProcedure
      .input(z.object({ classId: z.number(), studentId: z.number() }))
      .mutation(({ input }) => db.enrollStudentInClass(input)),
    
    removeStudent: protectedProcedure
      .input(z.object({ classId: z.number(), studentId: z.number() }))
      .mutation(({ input }) => db.removeStudentFromClass(input.classId, input.studentId)),
  }),

  // Enhanced Assignments routes
  classAssignments: router({
    byClass: protectedProcedure
      .input(z.object({ classId: z.number() }))
      .query(({ input }) => db.getAssignmentsByClass(input.classId)),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getAssignmentById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        classId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        instructions: z.string().optional(),
        dueDate: z.date().optional(),
        maxScore: z.number().optional(),
        section: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) throw new Error("Teacher profile not found");
        return db.createAssignmentForClass({
          ...input,
          teacherId: teacher.id,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        instructions: z.string().optional(),
        dueDate: z.date().optional(),
        maxScore: z.number().optional(),
        section: z.string().optional(),
      }))
      .mutation(({ input }) => db.updateAssignmentForClass(input.id, input)),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteAssignmentForClass(input.id)),
  }),

  // Submissions routes
  submissions: router({
    getByAssignment: protectedProcedure
      .input(z.object({ assignmentId: z.number() }))
      .query(({ input }) => db.getAssignmentSubmissions(input.assignmentId)),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getSubmissionById(input.id)),
    
    getStudentSubmission: protectedProcedure
      .input(z.object({ assignmentId: z.number(), studentId: z.number() }))
      .query(({ input }) => db.getStudentSubmission(input.assignmentId, input.studentId)),
    
    create: protectedProcedure
      .input(z.object({
        assignmentId: z.number(),
        studentId: z.number().optional(),
        status: z.enum(["pending", "submitted", "reviewed", "graded"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const student = await db.getStudentByUserId(ctx.user.id);
        const studentId = input.studentId || student?.id;
        if (!studentId) throw new Error("Student not found");
        
        return db.createOrUpdateSubmission(input.assignmentId, studentId, {
          status: input.status || "pending",
        });
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "submitted", "reviewed", "graded"]),
        submittedAt: z.date().optional(),
        reviewedAt: z.date().optional(),
      }))
      .mutation(({ input }) => db.updateSubmission(input.id, input)),
    
    grade: protectedProcedure
      .input(z.object({
        id: z.number(),
        marksObtained: z.number(),
        remarks: z.string().optional(),
      }))
      .mutation(({ input }) => db.updateSubmission(input.id, {
        status: "graded",
        marksObtained: input.marksObtained,
        remarks: input.remarks,
        reviewedAt: new Date(),
      })),
  }),

  // Attachments routes
  attachments: router({
    byAssignment: protectedProcedure
      .input(z.object({ assignmentId: z.number() }))
      .query(({ input }) => db.getAttachmentsByAssignment(input.assignmentId)),
    
    bySubmission: protectedProcedure
      .input(z.object({ submissionId: z.number() }))
      .query(({ input }) => db.getAttachmentsBySubmission(input.submissionId)),
    
    create: protectedProcedure
      .input(z.object({
        assignmentId: z.number().optional(),
        submissionId: z.number().optional(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileType: z.string(),
        fileSize: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(ctx.user?.openId || "");
        const userId = user?.id || 0;
        return db.createAttachment({
          ...input,
          uploadedBy: userId,
        });
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteAttachment(input.id)),
  }),

  // Attendance routes (enhanced)
  attendanceManagement: router({
    getByClass: protectedProcedure
      .input(z.object({ classId: z.number(), date: z.date().optional() }))
      .query(({ input }) => db.getClassAttendance(input.classId, input.date)),
    
    getStudentAttendance: protectedProcedure
      .input(z.object({ classId: z.number(), studentId: z.number() }))
      .query(({ input }) => db.getStudentClassAttendance(input.classId, input.studentId)),
    
    record: protectedProcedure
      .input(z.object({
        classId: z.number(),
        studentId: z.number(),
        date: z.date(),
        status: z.enum(["present", "absent", "late", "excused"]),
        remarks: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teacher = await db.getTeacherByUserId(ctx.user.id);
        if (!teacher) throw new Error("Teacher profile not found");
        
        return db.recordAttendance({
          ...input,
          recordedBy: teacher.id,
        });
      }),
    
    getPercentage: protectedProcedure
      .input(z.object({ classId: z.number(), studentId: z.number() }))
      .query(({ input }) => db.calculateAttendancePercentage(input.classId, input.studentId)),
    
    getAttendanceSummary: protectedProcedure
      .input(z.object({ classId: z.number(), studentId: z.number() }))
      .query(async ({ input }) => {
        const records = await db.getStudentClassAttendance(input.classId, input.studentId);
        const present = records.filter(r => r.status === "present").length;
        const absent = records.filter(r => r.status === "absent").length;
        const late = records.filter(r => r.status === "late").length;
        const excused = records.filter(r => r.status === "excused").length;
        const total = records.length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return { present, absent, late, excused, total, percentage };
      }),
  }),

  // Notifications routes
  notifications: router({
    getAll: protectedProcedure.query(({ ctx }) => db.getUserNotifications(ctx.user.id)),
    
    getUnread: protectedProcedure.query(({ ctx }) => db.getUserNotifications(ctx.user.id, true)),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.markNotificationAsRead(input.id)),
    
    markAllAsRead: protectedProcedure
      .mutation(({ ctx }) => db.markAllNotificationsAsRead(ctx.user.id)),
  }),

  // Student Dashboard routes (for students to view their content)
  studentDashboard: router({
    myClasses: protectedProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) return [];
      return db.getStudentClasses(student.id);
    }),
    
    myAssignments: protectedProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) return [];
      const classes = await db.getStudentClasses(student.id);
      const allAssignments: any[] = [];
      for (const cls of classes) {
        const assignments = await db.getAssignmentsByClass(cls.id);
        // Add class name to each assignment
        const assignmentsWithClass = assignments.map(a => ({
          ...a,
          className: cls.className,
          classSection: cls.section,
        }));
        allAssignments.push(...assignmentsWithClass);
      }
      return allAssignments.sort((a, b) => (b.dueDate?.getTime() || 0) - (a.dueDate?.getTime() || 0));
    }),
    
    mySubmissions: protectedProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) return [];
      const classes = await db.getStudentClasses(student.id);
      const allSubmissions: any[] = [];
      for (const cls of classes) {
        const assignments = await db.getAssignmentsByClass(cls.id);
        for (const assignment of assignments) {
          const submission = await db.getStudentSubmission(assignment.id, student.id);
          if (submission) {
            allSubmissions.push({
              ...submission,
              assignment: assignment,
            });
          }
        }
      }
      return allSubmissions;
    }),
    
    myAttendance: protectedProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) return {};
      
      const classes = await db.getStudentClasses(student.id);
      const attendanceData: Record<number, any> = {};
      
      for (const cls of classes) {
        const summary = await db.calculateAttendancePercentage(cls.id, student.id);
        attendanceData[cls.id] = {
          className: cls.className,
          section: cls.section,
          percentage: summary,
        };
      }
      
      return attendanceData;
    }),
  }),
});

export type AppRouter = typeof appRouter;
