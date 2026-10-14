#!/usr/bin/env node
/**
 * Bootstrap / manual role assignment.
 *
 * Sets a role (and optionally permissions) custom claim on a Firebase user.
 * Use this to grant the FIRST admin — after that you can manage roles from your
 * app via the `setRole` callable (see ROLES.md), which requires an existing
 * admin and so can't create the very first one.
 *
 * Requires `firebase-admin` and a service-account key.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
 *     node scripts/set-role.js --email you@example.com --role admin
 *
 *   node scripts/set-role.js --uid <uid> --role editor \
 *     --permissions posts.publish,posts.delete
 *
 *   # Or point at the key file explicitly:
 *   node scripts/set-role.js --key ./service-account.json --email you@x.com --role admin
 *
 * Tiers (see ROLES.md "Access tiers"):
 *   # the first super admin
 *   node scripts/set-role.js --email you@x.com --role superadmin
 *
 *   # admin of one app only (use `app:none` to remove)
 *   node scripts/set-role.js --email staff@x.com --apps ganjahub:admin,forsparta:staff
 *
 *   # owner / manager / staff of one store (key is `<app>/<storeId>`; `:none` removes)
 *   node scripts/set-role.js --email owner@store.com --tenants ganjahub/<storeId>:owner
 *
 *   # end the user's existing sessions so a removal takes effect immediately
 *   node scripts/set-role.js --email x@y.com --role none --revoke
 *
 * This tool runs with the service-account key, i.e. with super-admin power: it does not apply the who-may-grant-what
 * rules (those are for the in-app callable). It does validate names / roles and the 1000-byte claims limit.
 */
const admin = require('firebase-admin');
const { applyChange, parseClaims, reducesAccess } = require('../dist/access');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help || (!args.email && !args.uid)) {
    console.log('Usage: node scripts/set-role.js (--email <email> | --uid <uid>) [--role <role>] [--apps app:role,...] [--tenants app/id:role,...] [--permissions a,b,c] [--revoke] [--key <path>]');
    process.exit(args.help ? 0 : 1);
  }

  // Initialize admin. Prefer an explicit --key, else GOOGLE_APPLICATION_CREDENTIALS.
  if (args.key) {
    admin.initializeApp({ credential: admin.credential.cert(require(require('path').resolve(args.key))) });
  } else {
    admin.initializeApp();
  }

  const auth = admin.auth();
  const user = args.uid
    ? await auth.getUser(args.uid)
    : await auth.getUserByEmail(args.email);

  const existing = user.customClaims || {};
  let nextClaims = { ...existing };

  // role / apps / tenants go through the shared, validated logic (names, roles, 1000-byte limit).
  const parseMap = (csv) => Object.fromEntries(csv.split(',').map((x) => x.trim()).filter(Boolean).map((pair) => {
    const i = pair.lastIndexOf(':');
    if (i < 0) throw new Error(`Expected key:role, got "${pair}"`);
    const role = pair.slice(i + 1);
    return [pair.slice(0, i), role === 'none' ? null : role];
  }));
  const change = {};
  if (args.role !== undefined) change.role = (args.role === 'none' || args.role === '') ? null : args.role;
  if (typeof args.apps === 'string') change.apps = parseMap(args.apps);
  if (typeof args.tenants === 'string') change.tenants = parseMap(args.tenants);
  const accessChanged = Object.keys(change).length > 0;
  // Replace, don't merge: applyChange deletes emptied maps and removed roles, which a merge would resurrect.
  if (accessChanged) nextClaims = applyChange(nextClaims, change);

  if (args.permissions !== undefined && typeof args.permissions === 'string') {
    nextClaims.permissions = Array.from(
      new Set(args.permissions.split(',').map((p) => p.trim()).filter(Boolean)),
    );
  }

  await auth.setCustomUserClaims(user.uid, nextClaims);
  const lostAccess = accessChanged && reducesAccess(parseClaims(existing), parseClaims(nextClaims));
  if (args.revoke || lostAccess) {
    await auth.revokeRefreshTokens(user.uid);
    console.log('   Sessions revoked: the user must sign in again' + (lostAccess && !args.revoke ? ' (access was removed)' : '') + '.');
  }

  console.log(`✅ Updated ${user.email || user.uid}`);
  console.log('   Claims now:', JSON.stringify(nextClaims));
  console.log('   Note: the user must refresh their ID token (call refreshUser(), or sign out/in) to see the change.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Failed:', err.message || err);
  process.exit(1);
});
