import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // One-time backfill: published media linked to a submission but with no
  // speakerId — set the submitting member as the speaker.
  const subs = await db.submission.findMany({
    where: { mediaItem: { speakerId: null } },
    select: { id: true, memberId: true, mediaItemId: true },
  });

  for (const s of subs) {
    await db.mediaItem.update({
      where: { id: s.mediaItemId },
      data: { speakerId: s.memberId },
    });
    console.log(`Backfilled speaker on media ${s.mediaItemId} from submission ${s.id}`);
  }

  console.log(`Done — ${subs.length} media item(s) repaired.`);

  // Re-check
  const remaining = await db.submission.count({ where: { mediaItem: { speakerId: null } } });
  console.log(`Submissions still missing speaker: ${remaining}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
