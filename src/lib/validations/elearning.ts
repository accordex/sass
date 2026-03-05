// ==============================================================================
// E-Learning & Community — Zod Validation Schemas — Phase 5
// ==============================================================================
// Covers: Course Categories, Courses, Modules, Lessons, Quizzes,
//         Enrollments, Forum Categories, Forum Posts, Forum Replies
// ==============================================================================

import { z } from "zod";

// ==============================================================================
// COURSE CATEGORY
// ==============================================================================

export const CreateCourseCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  description: z.string().optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export const UpdateCourseCategorySchema = CreateCourseCategorySchema.partial();

// ==============================================================================
// COURSE
// ==============================================================================

export const CreateCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  description: z.string().optional().nullable(),
  short_description: z.string().max(500).optional().nullable(),
  thumbnail_url: z.string().max(500).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional().default("BEGINNER"),
  duration_minutes: z.number().int().min(0).optional().default(0),
  instructor_id: z.string().uuid().optional().nullable(),
  price: z.number().min(0).optional().default(0),
  is_published: z.boolean().optional().default(false),
  enrollment_type: z.enum(["OPEN", "RESTRICTED", "ASSIGNED"]).optional().default("OPEN"),
  certificate_enabled: z.boolean().optional().default(false),
  passing_score: z.number().int().min(0).max(100).optional().default(70),
  max_enrollments: z.number().int().min(1).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  metadata: z.record(z.any()).optional().default({}),
});

export const UpdateCourseSchema = CreateCourseSchema.partial();

// ==============================================================================
// COURSE MODULE
// ==============================================================================

export const CreateCourseModuleSchema = z.object({
  course_id: z.string().uuid("Course is required"),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional().nullable(),
  sort_order: z.number().int().optional().default(0),
  duration_minutes: z.number().int().min(0).optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export const UpdateCourseModuleSchema = CreateCourseModuleSchema.omit({ course_id: true }).partial();

// ==============================================================================
// LESSON
// ==============================================================================

export const CreateLessonSchema = z.object({
  module_id: z.string().uuid("Module is required"),
  title: z.string().min(1, "Title is required").max(255),
  lesson_type: z.enum(["VIDEO", "TEXT", "QUIZ", "ASSIGNMENT", "DOWNLOAD", "LIVE_SESSION"]).optional().default("TEXT"),
  content: z.string().optional().nullable(),
  video_url: z.string().max(500).optional().nullable(),
  duration_minutes: z.number().int().min(0).optional().default(0),
  sort_order: z.number().int().optional().default(0),
  is_preview: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
});

export const UpdateLessonSchema = CreateLessonSchema.omit({ module_id: true }).partial();

// ==============================================================================
// QUIZ
// ==============================================================================

export const CreateQuizSchema = z.object({
  lesson_id: z.string().uuid("Lesson is required"),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional().nullable(),
  time_limit_min: z.number().int().min(1).optional().nullable(),
  passing_score: z.number().int().min(0).max(100).optional().default(70),
  max_attempts: z.number().int().min(1).optional().nullable(),
  shuffle_questions: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
});

export const UpdateQuizSchema = CreateQuizSchema.omit({ lesson_id: true }).partial();

// ==============================================================================
// QUIZ QUESTION
// ==============================================================================

export const CreateQuizQuestionSchema = z.object({
  quiz_id: z.string().uuid("Quiz is required"),
  question_text: z.string().min(1, "Question text is required"),
  question_type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"]).optional().default("MULTIPLE_CHOICE"),
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
    is_correct: z.boolean().optional().default(false),
  })).optional().default([]),
  correct_answer: z.string().optional().nullable(),
  points: z.number().int().min(0).optional().default(1),
  explanation: z.string().optional().nullable(),
  sort_order: z.number().int().optional().default(0),
});

export const UpdateQuizQuestionSchema = CreateQuizQuestionSchema.omit({ quiz_id: true }).partial();

// ==============================================================================
// ENROLLMENT
// ==============================================================================

export const CreateEnrollmentSchema = z.object({
  user_id: z.string().uuid("User is required"),
  course_id: z.string().uuid("Course is required"),
  expires_at: z.string().datetime().optional().nullable(),
});

export const UpdateEnrollmentSchema = z.object({
  status: z.enum(["ENROLLED", "IN_PROGRESS", "COMPLETED", "DROPPED", "EXPIRED"]).optional(),
  progress_pct: z.number().int().min(0).max(100).optional(),
});

// ==============================================================================
// FORUM CATEGORY
// ==============================================================================

export const CreateForumCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  description: z.string().optional().nullable(),
  icon: z.string().max(100).optional().nullable(),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export const UpdateForumCategorySchema = CreateForumCategorySchema.partial();

// ==============================================================================
// FORUM POST
// ==============================================================================

export const CreateForumPostSchema = z.object({
  category_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "Title is required").max(500),
  slug: z.string().min(1, "Slug is required").max(500),
  content: z.string().min(1, "Content is required"),
  post_type: z.enum(["DISCUSSION", "QUESTION", "ANNOUNCEMENT", "IDEA", "ARTICLE"]).optional().default("DISCUSSION"),
  tags: z.array(z.string()).optional().default([]),
});

export const UpdateForumPostSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  post_type: z.enum(["DISCUSSION", "QUESTION", "ANNOUNCEMENT", "IDEA", "ARTICLE"]).optional(),
  is_pinned: z.boolean().optional(),
  is_locked: z.boolean().optional(),
  moderation: z.enum(["PENDING", "APPROVED", "REJECTED", "FLAGGED"]).optional(),
  tags: z.array(z.string()).optional(),
});

// ==============================================================================
// FORUM REPLY
// ==============================================================================

export const CreateForumReplySchema = z.object({
  post_id: z.string().uuid("Post is required"),
  content: z.string().min(1, "Reply content is required"),
  parent_id: z.string().uuid().optional().nullable(),
});

export const UpdateForumReplySchema = z.object({
  content: z.string().min(1).optional(),
  is_accepted: z.boolean().optional(),
  moderation: z.enum(["PENDING", "APPROVED", "REJECTED", "FLAGGED"]).optional(),
});
