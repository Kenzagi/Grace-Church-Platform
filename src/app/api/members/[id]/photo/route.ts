import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireWriteSession } from "@/lib/auth";
import { ok, badRequest, notFound, withErrorHandler } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import sharp from "sharp";

/**
 * Member photo upload endpoint.
 * Accepts multipart/form-data with a single "photo" file field.
 * Resizes to 400x400 (square crop), stores in /public/uploads/members/,
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

type Params = { params: Promise<{ id: string }> };

async function _handlePOST(req: NextRequest, { params }: Params) {
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

  // Resize to a square 400x400 crop using sharp
  let processedBuffer: Buffer;
  try {
    processedBuffer = await sharp(buffer)
      .resize(PHOTO_SIZE, PHOTO_SIZE, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch {
    return badRequest("Could not process the image. Please ensure it's a valid image file.");
  }

  // Store as base64 data URL (works on Vercel read-only filesystem)
  const photoUrl = `data:image/jpeg;base64,${processedBuffer.toString("base64")}`;

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
