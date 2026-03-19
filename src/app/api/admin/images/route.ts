import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readdir, stat } from "fs/promises";
import path from "path";
import { getImagesDir, getImageUrl } from "@/lib/images";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const imagesDir = getImagesDir();
    const files = await readdir(imagesDir);
    const images = await Promise.all(
      files
        .filter((f) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
        .map(async (f) => {
          const s = await stat(path.join(imagesDir, f));
          return { name: f, url: getImageUrl(f), size: s.size, createdAt: s.birthtime };
        })
    );
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(images);
  } catch {
    return NextResponse.json([]);
  }
}
