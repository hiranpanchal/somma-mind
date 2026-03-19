import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const url = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), "dev.db")}`;
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sommamind.com" },
    update: {},
    create: {
      email: "admin@sommamind.com",
      name: "Somma Admin",
      hashedPassword: adminPassword,
      role: "ADMIN",
    },
  });

  // Create demo student
  const studentPassword = await bcrypt.hash("student123", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      name: "Sarah Johnson",
      hashedPassword: studentPassword,
      role: "STUDENT",
    },
  });

  // Create a sample course
  const course = await prisma.course.upsert({
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

  // Create modules
  const mod1 = await prisma.module.upsert({
    where: { id: "mod-1-seed" },
    update: {},
    create: {
      id: "mod-1-seed",
      courseId: course.id,
      title: "Welcome — The Somma Philosophy",
      description: "An introduction to the principles that guide this work",
      type: "TEXT",
      order: 0,
      lesson: {
        create: {
          content: `<h2>Welcome to Your Journey</h2>
<p>You are here because something inside you knows that change is possible — and that the answers don't lie in pushing harder, thinking more, or willing yourself into a different life.</p>
<p>The Somma Method is built on a simple truth: <strong>your body holds the key to your freedom</strong>.</p>
<p>Years of research in neuroscience, somatic psychology, and trauma therapy have shown us that unresolved experiences don't disappear — they live in the nervous system, shaping how we move through the world.</p>
<blockquote>The body keeps the score. And through gentle, intentional practice, the body can also release it.</blockquote>
<p>In this course, you will learn to:</p>
<ul>
<li>Understand your nervous system and stress responses</li>
<li>Recognise patterns that no longer serve you</li>
<li>Use somatic practices to create genuine, lasting shift</li>
</ul>
<p>There is nothing to fix and nowhere to rush to. You are already whole. This work simply helps you remember that.</p>`,
        },
      },
    },
  });

  const mod2 = await prisma.module.upsert({
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
          content: `<p>Before beginning this meditation, find a comfortable position — either seated or lying down. Allow yourself a few moments to settle.</p>
<p>This practice will guide you into deep body awareness, helping you feel anchored in the present moment.</p>`,
        },
      },
    },
  });

  const mod3 = await prisma.module.upsert({
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
            text: "What sensations or feelings came up for you during the grounding meditation? Describe them as specifically as you can — location in the body, texture, temperature.",
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
          {
            text: "What is one pattern in your life that you'd like to explore releasing through this course?",
            type: "OPEN_ENDED",
            order: 2,
          },
        ],
      },
    },
  });

  // Enroll the student in the course
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: { userId: student.id, courseId: course.id },
  });

  console.log("✓ Admin user: admin@sommamind.com / admin123");
  console.log("✓ Demo student: student@example.com / student123");
  console.log("✓ Sample course created and published");
  console.log("✓ Student enrolled in demo course");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
