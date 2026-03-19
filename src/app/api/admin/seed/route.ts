import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token || token !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Admin user
    const adminPassword = await bcrypt.hash("admin123", 12);
    const admin = await db.user.upsert({
      where: { email: "admin@sommamind.com" },
      update: {},
      create: {
        email: "admin@sommamind.com",
        name: "Somaa Admin",
        hashedPassword: adminPassword,
        role: "ADMIN",
      },
    });

    // Demo student
    const studentPassword = await bcrypt.hash("student123", 12);
    const student = await db.user.upsert({
      where: { email: "student@example.com" },
      update: {},
      create: {
        email: "student@example.com",
        name: "Sarah Johnson",
        hashedPassword: studentPassword,
        role: "STUDENT",
      },
    });

    // Sample course
    const course = await db.course.upsert({
      where: { slug: "foundations-of-somatic-healing" },
      update: {},
      create: {
        slug: "foundations-of-somatic-healing",
        title: "Foundations of Somatic Healing",
        subtitle: "Release stored trauma and reconnect with your body's wisdom",
        description:
          "This foundational course introduces you to the principles of somatic healing — how trauma is stored in the body, and how you can gently release it. Through guided practices, reflective exercises, and hypnotherapy audio sessions, you will learn to work with your nervous system, not against it.",
        price: 147,
        published: true,
        order: 0,
      },
    });

    // Module 1
    await db.module.upsert({
      where: { id: "mod-1-seed" },
      update: {},
      create: {
        id: "mod-1-seed",
        courseId: course.id,
        title: "Welcome — The Somaa Philosophy",
        description: "An introduction to the principles that guide this work",
        type: "TEXT",
        order: 0,
        lesson: {
          create: {
            content: `<h2>Welcome to Your Journey</h2><p>You are here because something inside you knows that change is possible.</p><p>The Somaa Method is built on a simple truth: <strong>your body holds the key to your freedom</strong>.</p><blockquote>The body keeps the score. And through gentle, intentional practice, the body can also release it.</blockquote><p>In this course, you will learn to:</p><ul><li>Understand your nervous system and stress responses</li><li>Recognise patterns that no longer serve you</li><li>Use somatic practices to create genuine, lasting shift</li></ul>`,
          },
        },
      },
    });

    // Module 2
    await db.module.upsert({
      where: { id: "mod-2-seed" },
      update: {},
      create: {
        id: "mod-2-seed",
        courseId: course.id,
        title: "Grounding Meditation",
        description: "A 15-minute somatic grounding practice",
        type: "AUDIO",
        order: 1,
        lesson: {
          create: {
            content: `<p>Before beginning this meditation, find a comfortable position — either seated or lying down.</p>`,
          },
        },
      },
    });

    // Module 3
    await db.module.upsert({
      where: { id: "mod-3-seed" },
      update: {},
      create: {
        id: "mod-3-seed",
        courseId: course.id,
        title: "Module 1 Reflection",
        description: "Integrate what arose for you in this module",
        type: "QUIZ",
        order: 2,
        questions: {
          create: [
            {
              text: "What sensations or feelings came up for you during the grounding meditation?",
              type: "OPEN_ENDED",
              order: 0,
            },
            {
              text: "Where do you most often carry tension or discomfort in your body?",
              type: "MULTIPLE_CHOICE",
              order: 1,
              options: {
                create: [
                  { text: "Shoulders and neck", isCorrect: false },
                  { text: "Chest and stomach", isCorrect: false },
                  { text: "Lower back and hips", isCorrect: false },
                  { text: "Jaw and face", isCorrect: false },
                ],
              },
            },
          ],
        },
      },
    });

    // Enrol student
    await db.enrollment.upsert({
      where: { userId_courseId: { userId: student.id, courseId: course.id } },
      update: {},
      create: { userId: student.id, courseId: course.id },
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      admin: admin.email,
      student: student.email,
      course: course.slug,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
