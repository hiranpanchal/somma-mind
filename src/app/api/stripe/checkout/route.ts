import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: session.user.email!,
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: course.title,
            description: course.subtitle ?? undefined,
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId: course.id,
      userId: session.user.id,
    },
    success_url: `${appUrl}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/courses/${course.slug}`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
