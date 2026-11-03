import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireWriteSession } from "@/lib/auth";
import { ok, badRequest, notFound, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { checkWriteRateLimit } from "@/lib/rate-limit";

/**
 * Member photo upload endpoint.
 * Accepts multipart/form-data with a single "photo" file field.
 * Resizes to 400x400 (square crop) with sharp when available, stores as a
 * base64 data URL (works on Vercel's read-only filesystem — no /public writes),
 * and updates the Member.photoUrl field.
 *
 * Validation:
 *  - Only image MIME types (jpeg, png, webp, gif)
 *  - Max 5 MB
 *  - Member must belong to the session's org
 */
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const PHOTO_SIZE = 400; // 400x400 square

/**
 * sharp is loaded lazily: if the native binary is missing or broken in a
 * deployment target, the route still works (the image is stored un-resized)
 * instead of the whole module crashing with a 500 on import.
 */
async function processImage(buffer: Buffer): Promise<{ buffer: Buffer; resized: boolean }> {
  try {
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default ?? sharpModule;
    const out = await sharp(buffer)
      .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: "cover", position: "center" })
      .jpeg({ quality: 80 })
      .toBuffer();
    return { buffer: out, resized: true };
  } catch (err) {
    console.error("[photo] sharp unavailable, storing original image:", err instanceof Error ? err.message : err);
    return { buffer, resized: false };
  }
}

type Params = { params: Promise<{ id: string }> };

async function _handlePOST(req: NextRequest, { params }: Params) {
  const limited = checkWriteRateLimit(req, "photo-upload", 20, 60 * 1000);
  if (limited) return limited;

  const session = await requireWriteSession();
  const { id } = await params;

  const member = await db.member.findFirst({ where: { id, orgId: session.orgId } });
  if (!member) return notFound("Member not found");

  const formData = await req.formData();
  const file = formData.get("photo");

  if (!file || !(file instanceof File)) {
    return badRequest("No photo file provided. Send a multipart/form-data request with a 'photo' field.");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return badRequest(`Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF.`);
  }

  if (file.size > MAX_SIZE) {
    return badRequest(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max size is 5 MB.`);
  }

  // Read file buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Resize to a square 400x400 crop using sharp (falls back gracefully)
  const { buffer: processedBuffer, resized } = await processImage(buffer);

  // Store as base64 data URL (works on Vercel read-only filesystem).
  // When sharp resized, output is JPEG; otherwise keep the original MIME type.
  const mime = resized ? "image/jpeg" : (ALLOWED_TYPES.has(file.type) ? file.type : "image/jpeg");
  const photoUrl = `data:${mime};base64,${processedBuffer.toString("base64")}`;

  await db.member.update({
    where: { id },
    data: { photoUrl },
  });

  await writeAudit({
    orgId: session.orgId,
    adminId: session.adminId,
    action: "member.photo",
    entity: "member",
    entityId: id,
    detail: `Updated photo for ${member.firstName} ${member.lastName}`,
  });

  return ok({ photoUrl });
}

async function _handleDELETE(_req: NextRequest, { params }: Params) {
  const session = await requireWriteSession();
  const { id } = await params;

  const member = await db.member.findFirst({ where: { id, orgId: session.orgId } });
  if (!member) return notFound("Member not found");

  // Base64 photos don't need file cleanup

  await db.member.update({
    where: { id },
    data: { photoUrl: null },
  });

  await writeAudit({
    orgId: session.orgId,
    adminId: session.adminId,
    action: "member.photo",
    entity: "member",
    entityId: id,
    detail: `Removed photo for ${member.firstName} ${member.lastName}`,
  });

  return ok({ ok: true });
}

export const POST = withErrorHandler(_handlePOST);
export const DELETE = withErrorHandler(_handleDELETE);
