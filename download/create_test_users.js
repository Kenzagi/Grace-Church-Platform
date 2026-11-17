#!/usr/bin/env node
/**
 * create_test_users.js — add staff accounts for the other system roles.
 *
 * Creates (or updates) `editor` and `viewer` accounts in the SAME organization
 * as the first existing admin, so RBAC can be tested end to end:
 *   admin  — full access (members, settings, audit log, deletions)
 *   editor — create/update content, no destructive or settings actions
 *   viewer — read-only
 *
 * Usage (from the project root):
 *   node scripts/create_test_users.js
 *     → uses defaults below
 *
 *   node scripts/create_test_users.js editor@example.com "S3cret!" editor "Jane Editor"
 *     → custom single account
 *
 * Environment overrides:
 *   TEST_PASSWORD  default password for both default accounts
 *   DATABASE_URL   set this when targeting the production database (Postgres).
 *                  Run the script from a checkout whose Prisma client matches
 *                  that database's schema provider (postgres), e.g. the
 *                  deployed repo copy — not from a SQLite workspace.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 10; // must match the login route's compare expectation
const VALID_ROLES = ['admin', 'editor', 'viewer'];

const DEFAULTS = [
  { email: 'editor@grace.community', password: process.env.TEST_PASSWORD || 'Editor-test-2026!', role: 'editor', name: 'Grace Editor' },
  { email: 'viewer@grace.community', password: process.env.TEST_PASSWORD || 'Viewer-test-2026!', role: 'viewer', name: 'Grace Viewer' },
];

async function main() {
  const prisma = new PrismaClient();

  // Custom single-account mode: email password role [name]
  let targets = DEFAULTS;
  const [email, password, role, name] = process.argv.slice(2);
  if (email) {
    if (!password || !role) {
      console.error('Custom mode requires: <email> <password> <role> [name]');
      process.exit(1);
    }
    targets = [{ email, password, role, name: name || role }];
  }

  for (const t of targets) {
    if (!VALID_ROLES.includes(t.role)) {
      console.error(`Invalid role "${t.role}" — must be one of: ${VALID_ROLES.join(', ')}`);
      process.exit(1);
    }
    if (!t.email.includes('@')) {
      console.error(`Invalid email "${t.email}"`);
      process.exit(1);
    }
    if (t.password.length < 8) {
      console.error('Password must be at least 8 characters.');
      process.exit(1);
    }
  }

  // Attach to the same organization as the first admin (or the only org).
  const org = await prisma.organization.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!org) {
    console.error('No Organization found — create one first (the admin signup flow does this).');
    process.exit(1);
  }

  console.log(`Target organization: ${org.id}`);

  for (const t of targets) {
    const passwordHash = await bcrypt.hash(t.password, BCRYPT_ROUNDS);
    const user = await prisma.adminUser.upsert({
      where: { email: t.email },
      update: { passwordHash, role: t.role, name: t.name, orgId: org.id },
      create: { email: t.email, passwordHash, role: t.role, name: t.name, orgId: org.id },
    });
    console.log(`✓ ${t.role.padEnd(6)} ${user.email}  (password: ${t.password})  [upserted, id=${user.id}]`);
  }

  await prisma.$disconnect();
  console.log('\nDone. Log in at / with any of these accounts to test the role gates.');
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
