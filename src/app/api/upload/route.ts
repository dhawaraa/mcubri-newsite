import { NextResponse } from "next/server";
import { getSessionContext } from "@/features/identity/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Validates buffer against known image magic bytes
 */
function isValidImageSignature(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return true;
  }

  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return true;
  }

  // WebP: RIFF .... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
}

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting: Max 20 uploads per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`upload:${clientIp}`, {
      limit: 20,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "คำขออัปโหลดถี่เกินไป กรุณารอสักครู่ (Rate limit exceeded)" },
        { status: 429 }
      );
    }

    // 2. Authentication Check
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. ตรวจสอบ MIME type (ตัด SVG ออกเพื่อป้องกัน Stored XSS)
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WebP, GIF) เท่านั้น" },
        { status: 400 }
      );
    }

    // 4. จำกัดขนาดไฟล์ไม่เกิน 10MB
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: "ขนาดไฟล์ต้องไม่เกิน 10MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 5. Deep Packet / Magic Bytes Inspection (ป้องกันการปลอมนามสกุลไฟล์ เช่น PHP/Shell หลอกเป็น .jpg)
    if (!isValidImageSignature(buffer)) {
      return NextResponse.json(
        { error: "โครงสร้างไฟล์รูปภาพไม่ถูกต้องหรืออาจเป็นไฟล์อันตราย (Invalid magic bytes)" },
        { status: 400 }
      );
    }

    // 6. Whitelist extensions based on genuine mime type
    const mimeToExtMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
    };
    const ext = mimeToExtMap[file.type] || ".jpg";

    const uniqueFileName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "news");
    const filePath = path.join(uploadDir, uniqueFileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/news/${uniqueFileName}`;
    return NextResponse.json({ url: publicUrl, fileName: uniqueFileName });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
