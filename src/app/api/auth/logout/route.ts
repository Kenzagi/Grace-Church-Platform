import { destroySession } from "@/lib/auth";
import { ok, withErrorHandler } from "@/lib/api";

async function _handlePOST() {
  await destroySession();
  return ok({ ok: true });
}

export const POST = withErrorHandler(_handlePOST);
