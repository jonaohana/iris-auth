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
 */
const admin = require('firebase-admin');

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
    console.log('Usage: node scripts/set-role.js (--email <email> | --uid <uid>) --role <role> [--permissions a,b,c] [--key <path>]');
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
  const nextClaims = { ...existing };

  if (args.role !== undefined) {
    if (args.role === 'none' || args.role === '') {
      delete nextClaims.role;
    } else {
      nextClaims.role = args.role;
    }
  }

  if (args.permissions !== undefined && typeof args.permissions === 'string') {
    nextClaims.permissions = Array.from(
      new Set(args.permissions.split(',').map((p) => p.trim()).filter(Boolean)),
    );
  }

  await auth.setCustomUserClaims(user.uid, nextClaims);

  console.log(`✅ Updated ${user.email || user.uid}`);
  console.log('   Claims now:', JSON.stringify(nextClaims));
  console.log('   Note: the user must refresh their ID token (call refreshUser(), or sign out/in) to see the change.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Failed:', err.message || err);
  process.exit(1);
});
