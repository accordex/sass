"use server";

// ==============================================================================
// E-Learning & Community Server Actions — Phase 5
// ==============================================================================
// CRUD for: Course Categories, Courses, Modules, Lessons, Quizzes,
//           Enrollments, Certificates, Forum Categories, Posts, Replies
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import {
  CreateCourseCategorySchema, UpdateCourseCategorySchema,
  CreateCourseSchema, UpdateCourseSchema,
  CreateCourseModuleSchema, UpdateCourseModuleSchema,
  CreateLessonSchema, UpdateLessonSchema,
  CreateQuizSchema, UpdateQuizSchema,
  CreateQuizQuestionSchema, UpdateQuizQuestionSchema,
  CreateEnrollmentSchema, UpdateEnrollmentSchema,
  CreateForumCategorySchema, UpdateForumCategorySchema,
  CreateForumPostSchema, UpdateForumPostSchema,
  CreateForumReplySchema, UpdateForumReplySchema,
} from "@/lib/validations/elearning";
import { EnrollmentStatus, CertificateStatus, ModerationStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

// ==============================================================================
// COURSE CATEGORY ACTIONS
// ==============================================================================

export async function getCourseCategories({
  search = "", includeInactive = false,
}: { search?: string; includeInactive?: boolean } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (!includeInactive) where.is_active = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const categories = await prisma.courseCategory.findMany({
    where,
    orderBy: { sort_order: "asc" },
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { courses: true, children: true } },
    },
  });
  return { categories, total: categories.length };
}

export async function createCourseCategory(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateCourseCategorySchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const category = await prisma.courseCategory.create({ data: { tenant_id: tenantId, ...parsed.data } });
    revalidatePath("/elearning/categories");
    return { category };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Category slug already exists" };
    return { error: "Failed to create course category" };
  }
}

export async function updateCourseCategory(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateCourseCategorySchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const category = await prisma.courseCategory.update({ where: { id }, data: parsed.data });
    revalidatePath("/elearning/categories");
    return { category };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Category slug already exists" };
    return { error: "Failed to update course category" };
  }
}

export async function deleteCourseCategory(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.courseCategory.delete({ where: { id } });
    revalidatePath("/elearning/categories");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2003") return { error: "Cannot delete: category has courses or subcategories" };
    return { error: "Failed to delete course category" };
  }
}

// ==============================================================================
// COURSE ACTIONS
// ==============================================================================

export async function getCourses({
  page = 1, perPage = 20, search = "", category_id, level, published,
}: {
  page?: number; perPage?: number; search?: string;
  category_id?: string; level?: string; published?: boolean;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { short_description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category_id) where.category_id = category_id;
  if (level) where.level = level;
  if (published !== undefined) where.is_published = published;

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        instructor: { select: { id: true, first_name: true, last_name: true } },
        _count: { select: { modules: true, enrollments: true, certificates: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return { courses, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getCourse(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      instructor: { select: { id: true, first_name: true, last_name: true } },
      modules: {
        orderBy: { sort_order: "asc" },
        include: {
          lessons: {
            orderBy: { sort_order: "asc" },
            include: { quiz: { select: { id: true, title: true } } },
          },
        },
      },
      _count: { select: { enrollments: true, certificates: true } },
    },
  });
  if (!course) return { error: "Course not found" };
  return { course };
}

export async function createCourse(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateCourseSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const course = await prisma.course.create({ data: { tenant_id: tenantId, ...parsed.data } });
    revalidatePath("/elearning/courses");
    return { course };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Course slug already exists" };
    return { error: "Failed to create course" };
  }
}

export async function updateCourse(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateCourseSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const course = await prisma.course.update({ where: { id }, data: parsed.data });
    revalidatePath("/elearning/courses");
    return { course };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Course slug already exists" };
    return { error: "Failed to update course" };
  }
}

export async function deleteCourse(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.course.delete({ where: { id } });
    revalidatePath("/elearning/courses");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2003") return { error: "Cannot delete: course has enrollments" };
    return { error: "Failed to delete course" };
  }
}

// ==============================================================================
// COURSE MODULE ACTIONS
// ==============================================================================

export async function getCourseModules(courseId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const modules = await prisma.courseModule.findMany({
    where: { course_id: courseId },
    orderBy: { sort_order: "asc" },
    include: {
      _count: { select: { lessons: true } },
      lessons: { orderBy: { sort_order: "asc" }, select: { id: true, title: true, lesson_type: true, duration_minutes: true } },
    },
  });
  return { modules };
}

export async function createCourseModule(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateCourseModuleSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const mod = await prisma.courseModule.create({ data: parsed.data });
    revalidatePath("/elearning/courses");
    return { module: mod };
  } catch (e: any) {
    return { error: "Failed to create module" };
  }
}

export async function updateCourseModule(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateCourseModuleSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const mod = await prisma.courseModule.update({ where: { id }, data: parsed.data });
    revalidatePath("/elearning/courses");
    return { module: mod };
  } catch (e: any) {
    return { error: "Failed to update module" };
  }
}

export async function deleteCourseModule(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.courseModule.delete({ where: { id } });
    revalidatePath("/elearning/courses");
    return { success: true };
  } catch (e: any) {
    return { error: "Failed to delete module" };
  }
}

// ==============================================================================
// LESSON ACTIONS
// ==============================================================================

export async function createLesson(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateLessonSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const lesson = await prisma.lesson.create({ data: parsed.data });
    revalidatePath("/elearning/courses");
    return { lesson };
  } catch (e: any) {
    return { error: "Failed to create lesson" };
  }
}

export async function updateLesson(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateLessonSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const lesson = await prisma.lesson.update({ where: { id }, data: parsed.data });
    revalidatePath("/elearning/courses");
    return { lesson };
  } catch (e: any) {
    return { error: "Failed to update lesson" };
  }
}

export async function deleteLesson(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.lesson.delete({ where: { id } });
    revalidatePath("/elearning/courses");
    return { success: true };
  } catch (e: any) {
    return { error: "Failed to delete lesson" };
  }
}

// ==============================================================================
// QUIZ ACTIONS
// ==============================================================================

export async function createQuiz(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateQuizSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const quiz = await prisma.quiz.create({ data: parsed.data });
    revalidatePath("/elearning/courses");
    return { quiz };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "This lesson already has a quiz" };
    return { error: "Failed to create quiz" };
  }
}

export async function updateQuiz(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateQuizSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const quiz = await prisma.quiz.update({ where: { id }, data: parsed.data });
    revalidatePath("/elearning/courses");
    return { quiz };
  } catch (e: any) {
    return { error: "Failed to update quiz" };
  }
}

export async function deleteQuiz(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.quiz.delete({ where: { id } });
    revalidatePath("/elearning/courses");
    return { success: true };
  } catch (e: any) {
    return { error: "Failed to delete quiz" };
  }
}

// ==============================================================================
// QUIZ QUESTION ACTIONS
// ==============================================================================

export async function getQuizQuestions(quizId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const questions = await prisma.quizQuestion.findMany({
    where: { quiz_id: quizId },
    orderBy: { sort_order: "asc" },
  });
  return { questions };
}

export async function createQuizQuestion(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateQuizQuestionSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const question = await prisma.quizQuestion.create({ data: parsed.data });
    return { question };
  } catch (e: any) {
    return { error: "Failed to create question" };
  }
}

export async function updateQuizQuestion(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateQuizQuestionSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const question = await prisma.quizQuestion.update({ where: { id }, data: parsed.data });
    return { question };
  } catch (e: any) {
    return { error: "Failed to update question" };
  }
}

export async function deleteQuizQuestion(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.quizQuestion.delete({ where: { id } });
    return { success: true };
  } catch (e: any) {
    return { error: "Failed to delete question" };
  }
}

// ==============================================================================
// ENROLLMENT ACTIONS
// ==============================================================================

export async function getEnrollments({
  page = 1, perPage = 20, search = "", course_id, status,
}: {
  page?: number; perPage?: number; search?: string;
  course_id?: string; status?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (course_id) where.course_id = course_id;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { user: { first_name: { contains: search, mode: "insensitive" } } },
      { user: { last_name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { course: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: {
        user: { select: { id: true, first_name: true, last_name: true, email: true, avatar_url: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    }),
    prisma.enrollment.count({ where }),
  ]);

  return { enrollments, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createEnrollment(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateEnrollmentSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const enrollment = await prisma.enrollment.create({
      data: {
        tenant_id: tenantId,
        user_id: parsed.data.user_id,
        course_id: parsed.data.course_id,
        expires_at: parsed.data.expires_at ? new Date(parsed.data.expires_at) : null,
      },
    });
    revalidatePath("/elearning/enrollments");
    return { enrollment };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "User is already enrolled in this course" };
    return { error: "Failed to create enrollment" };
  }
}

export async function updateEnrollment(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateEnrollmentSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  const updateData: any = { ...parsed.data };
  if (parsed.data.status === "IN_PROGRESS" && !updateData.started_at) {
    updateData.started_at = new Date();
  }
  if (parsed.data.status === "COMPLETED") {
    updateData.completed_at = new Date();
    updateData.progress_pct = 100;
  }
  if (parsed.data.status) {
    updateData.status = parsed.data.status as EnrollmentStatus;
  }

  try {
    const enrollment = await prisma.enrollment.update({ where: { id }, data: updateData });
    revalidatePath("/elearning/enrollments");
    return { enrollment };
  } catch (e: any) {
    return { error: "Failed to update enrollment" };
  }
}

export async function deleteEnrollment(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.enrollment.delete({ where: { id } });
    revalidatePath("/elearning/enrollments");
    return { success: true };
  } catch (e: any) {
    return { error: "Failed to delete enrollment" };
  }
}

// ==============================================================================
// CERTIFICATE ACTIONS
// ==============================================================================

export async function getCertificates({
  page = 1, perPage = 20, search = "", course_id,
}: {
  page?: number; perPage?: number; search?: string; course_id?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (course_id) where.course_id = course_id;
  if (search) {
    where.OR = [
      { certificate_no: { contains: search, mode: "insensitive" } },
      { recipient_name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [certificates, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { issued_at: "desc" },
      include: {
        user: { select: { id: true, first_name: true, last_name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    }),
    prisma.certificate.count({ where }),
  ]);

  return { certificates, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function issueCertificate(enrollmentId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  // Fetch enrollment with user and course info
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      user: { select: { id: true, first_name: true, last_name: true } },
      course: { select: { id: true, title: true, certificate_enabled: true } },
    },
  });

  if (!enrollment) return { error: "Enrollment not found" };
  if (!enrollment.course.certificate_enabled) return { error: "Certificates not enabled for this course" };
  if (enrollment.status !== "COMPLETED") return { error: "Course not completed yet" };

  // Check for existing certificate
  const existing = await prisma.certificate.findFirst({
    where: { user_id: enrollment.user.id, course_id: enrollment.course.id },
  });
  if (existing) return { error: "Certificate already issued" };

  // Generate certificate number
  const year = new Date().getFullYear();
  const count = await prisma.certificate.count({ where: { tenant_id: tenantId } });
  const certNo = `CERT-${year}-${String(count + 1).padStart(4, "0")}`;

  try {
    const certificate = await prisma.certificate.create({
      data: {
        tenant_id: tenantId,
        user_id: enrollment.user.id,
        course_id: enrollment.course.id,
        certificate_no: certNo,
        recipient_name: `${enrollment.user.first_name} ${enrollment.user.last_name}`,
      },
    });
    return { certificate };
  } catch (e: any) {
    return { error: "Failed to issue certificate" };
  }
}

export async function revokeCertificate(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const certificate = await prisma.certificate.update({
      where: { id },
      data: { status: CertificateStatus.REVOKED },
    });
    return { certificate };
  } catch (e: any) {
    return { error: "Failed to revoke certificate" };
  }
}

// ==============================================================================
// FORUM CATEGORY ACTIONS
// ==============================================================================

export async function getForumCategories({
  search = "", includeInactive = false,
}: { search?: string; includeInactive?: boolean } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (!includeInactive) where.is_active = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const categories = await prisma.forumCategory.findMany({
    where,
    orderBy: { sort_order: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  return { categories, total: categories.length };
}

export async function createForumCategory(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateForumCategorySchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const category = await prisma.forumCategory.create({ data: { tenant_id: tenantId, ...parsed.data } });
    revalidatePath("/community/categories");
    return { category };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Category slug already exists" };
    return { error: "Failed to create forum category" };
  }
}

export async function updateForumCategory(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateForumCategorySchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const category = await prisma.forumCategory.update({ where: { id }, data: parsed.data });
    revalidatePath("/community/categories");
    return { category };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Category slug already exists" };
    return { error: "Failed to update forum category" };
  }
}

export async function deleteForumCategory(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.forumCategory.delete({ where: { id } });
    revalidatePath("/community/categories");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2003") return { error: "Cannot delete: category has posts" };
    return { error: "Failed to delete forum category" };
  }
}

// ==============================================================================
// FORUM POST ACTIONS
// ==============================================================================

export async function getForumPosts({
  page = 1, perPage = 20, search = "", category_id, post_type,
}: {
  page?: number; perPage?: number; search?: string;
  category_id?: string; post_type?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId, moderation: "APPROVED" as ModerationStatus };
  if (category_id) where.category_id = category_id;
  if (post_type) where.post_type = post_type;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: [{ is_pinned: "desc" }, { created_at: "desc" }],
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, first_name: true, last_name: true, avatar_url: true } },
        _count: { select: { replies: true } },
      },
    }),
    prisma.forumPost.count({ where }),
  ]);

  return { posts, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getForumPost(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const post = await prisma.forumPost.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      author: { select: { id: true, first_name: true, last_name: true, avatar_url: true } },
      replies: {
        where: { moderation: "APPROVED" as ModerationStatus },
        orderBy: { created_at: "asc" },
        include: {
          author: { select: { id: true, first_name: true, last_name: true, avatar_url: true } },
          children: {
            include: {
              author: { select: { id: true, first_name: true, last_name: true, avatar_url: true } },
            },
          },
        },
      },
    },
  });

  if (!post) return { error: "Post not found" };

  // Increment view count
  await prisma.forumPost.update({ where: { id }, data: { view_count: { increment: 1 } } });

  return { post };
}

export async function createForumPost(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;
  const userId = (user as any).id;

  const parsed = CreateForumPostSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const post = await prisma.forumPost.create({
      data: {
        tenant_id: tenantId,
        author_id: userId,
        ...parsed.data,
      },
    });
    revalidatePath("/community/discussions");
    return { post };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Post slug already exists" };
    return { error: "Failed to create post" };
  }
}

export async function updateForumPost(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateForumPostSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  const updateData: any = { ...parsed.data };
  if (parsed.data.moderation) updateData.moderation = parsed.data.moderation as ModerationStatus;

  try {
    const post = await prisma.forumPost.update({ where: { id }, data: updateData });
    revalidatePath("/community/discussions");
    return { post };
  } catch (e: any) {
    return { error: "Failed to update post" };
  }
}

export async function deleteForumPost(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.forumPost.delete({ where: { id } });
    revalidatePath("/community/discussions");
    return { success: true };
  } catch (e: any) {
    return { error: "Failed to delete post" };
  }
}

// ==============================================================================
// FORUM REPLY ACTIONS
// ==============================================================================

export async function createForumReply(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const userId = (user as any).id;

  const parsed = CreateForumReplySchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const reply = await prisma.forumReply.create({
      data: { author_id: userId, ...parsed.data },
    });

    // Increment reply count on the post
    await prisma.forumPost.update({
      where: { id: parsed.data.post_id },
      data: { reply_count: { increment: 1 } },
    });

    revalidatePath("/community/discussions");
    return { reply };
  } catch (e: any) {
    return { error: "Failed to create reply" };
  }
}

export async function updateForumReply(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateForumReplySchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  const updateData: any = { ...parsed.data };
  if (parsed.data.moderation) updateData.moderation = parsed.data.moderation as ModerationStatus;

  try {
    const reply = await prisma.forumReply.update({ where: { id }, data: updateData });
    return { reply };
  } catch (e: any) {
    return { error: "Failed to update reply" };
  }
}

export async function deleteForumReply(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  // Get post_id before deleting
  const reply = await prisma.forumReply.findUnique({ where: { id }, select: { post_id: true } });

  try {
    await prisma.forumReply.delete({ where: { id } });

    // Decrement reply count
    if (reply) {
      await prisma.forumPost.update({
        where: { id: reply.post_id },
        data: { reply_count: { decrement: 1 } },
      });
    }

    return { success: true };
  } catch (e: any) {
    return { error: "Failed to delete reply" };
  }
}
