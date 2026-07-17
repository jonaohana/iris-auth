import React from 'react';
import { UserBadgeProps } from '../types';
/**
 * UserBadge — the logged-in indicator pill for app headers.
 *
 * Renders an "online" pill with a status dot, the user's avatar (photo or
 * initial), their first name and a chevron. Clicking it opens a dropdown
 * with the account identity and a Log out action. Renders nothing when
 * logged out, so it can be dropped into any header unconditionally.
 *
 * - `size` — pill height in px; set to the same size as the neighbouring
 *   header icon buttons so it stretches to match (contents scale to fit).
 * - `colors` — partial palette merged over the green defaults, so the pill
 *   and dropdown can match the host app's theme (incl. dark mode).
 * - `onPress` — overrides the built-in dropdown toggle entirely.
 * - `onSignOut` — called after a successful sign-out from the dropdown.
 * - `onLogin` — when provided, the badge renders a "Log in" pill while logged
 *   out (pressing it calls this — e.g. navigate to your Login screen). When
 *   omitted, the badge renders nothing while logged out (legacy behaviour).
 */
export declare const UserBadge: React.FC<UserBadgeProps>;
//# sourceMappingURL=UserBadge.d.ts.map