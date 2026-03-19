import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getImagesDir } from "@/lib/images";

// Serve uploaded images from the persistent storage directory.
// On Railway this is /data/images (survives redeploys).
// In dev this falls back to public/images (served here AND by Next.js static).

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Prevent path traversal
  const safe = path.basename(decodeURIComponent(filename));
  if (!safe || safe.startsWith(".")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only allow image extensions
  if (!/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(safe)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const filePath = path.join(getImagesDir(), safe);
    const buffer = await readFile(filePath);

    const ext = safe.split(".").pop()!.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
    };
    const contentType = contentTypeMap[ext] ?? "application/octet-stream";

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
