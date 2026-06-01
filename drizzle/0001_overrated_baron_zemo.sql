CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherId` int NOT NULL,
	`courseId` int,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`priority` varchar(64) DEFAULT 'normal',
	`isGlobal` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`teacherId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`fileUrl` text,
	`dueDate` timestamp,
	`totalMarks` int DEFAULT 10,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`courseId` int NOT NULL,
	`date` timestamp NOT NULL,
	`status` varchar(64) NOT NULL,
	`remarks` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseCode` varchar(64) NOT NULL,
	`courseTitle` varchar(255) NOT NULL,
	`courseType` varchar(64) NOT NULL,
	`semester` int NOT NULL,
	`credits` int DEFAULT 3,
	`teacherId` int NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_courseCode_unique` UNIQUE(`courseCode`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`courseId` int NOT NULL,
	`status` varchar(64) DEFAULT 'active',
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`courseId` int NOT NULL,
	`grade` varchar(2),
	`marks` int,
	`totalMarks` int DEFAULT 100,
	`percentage` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `grades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentId` varchar(64) NOT NULL,
	`department` varchar(255),
	`semester` int DEFAULT 1,
	`gpa` varchar(10) DEFAULT '0.00',
	`profilePicture` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `students_studentId_unique` UNIQUE(`studentId`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assignmentId` int NOT NULL,
	`studentId` int NOT NULL,
	`submissionUrl` text,
	`marksObtained` int,
	`feedback` varchar(1000),
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`gradedAt` timestamp,
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`department` varchar(255),
	`specialization` varchar(255),
	`profilePicture` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teachers_id` PRIMARY KEY(`id`),
	CONSTRAINT `teachers_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `teachers_employeeId_unique` UNIQUE(`employeeId`)
);
