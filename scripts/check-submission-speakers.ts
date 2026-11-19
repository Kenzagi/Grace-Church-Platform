import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const subs = await db.submission.findMany({
    include: {
      mediaItem: { select: { id: true, title: true, status: true, speakerId: true } },
      member: { select: { firstName: true, lastName: true } },
    },
  });
  console.log(
    JSON.stringify(
      subs.map((s) => ({
        subStatus: s.status,
        member: `${s.member.firstName} ${s.member.lastName}`,
        media: s.mediaItem.title,
        mediaStatus: s.mediaItem.status,
        speakerSet: Boolean(s.mediaItem.speakerId),
      })),
      null,
      2
    )
  );

  // Any published media linked to a submission but missing a speaker?
  const orphaned = subs.filter((s) => !s.mediaItem.speakerId);
  console.log(`\nSubmissions with missing speakerId on media: ${orphaned.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
