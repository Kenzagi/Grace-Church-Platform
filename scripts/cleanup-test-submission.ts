import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Remove the browser-verification test item (submission cascades via mediaItem).
  const item = await db.mediaItem.findFirst({
    where: { title: "Walking in the Spirit" },
    select: { id: true },
  });
  if (!item) {
    console.log("Test item not found — nothing to clean.");
    return;
  }
  await db.mediaItem.delete({ where: { id: item.id } });
  console.log(`Deleted test media ${item.id} (submission cascaded).`);

  const subs = await db.submission.count();
  const media = await db.mediaItem.count();
  const missingSpeaker = await db.submission.count({ where: { mediaItem: { speakerId: null } } });
  console.log(`DB state: ${media} media, ${subs} submissions, ${missingSpeaker} missing speaker.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
