import React from 'react';
import { UserBadgeColors } from '../types';
/** Props for the mobile, picture-only auth button. Reuses UserBadgeColors. */
export interface MobileUserBadgeProps {
    /** Circle diameter in px. Default 36 */
    size?: number;
    /**
     * When provided, the button renders a generic avatar while logged out and
     * pressing it calls this (e.g. navigate to your Login screen). When omitted,
     * the button renders nothing while logged out.
     */
    onLogin?: () => void;
    /** Called after a successful sign-out from the popover */
    onSignOut?: () => void;
    /** Overrides the built-in popover: pressing the avatar calls this instead */
    onPress?: () => void;
    /** Show the little online status dot on the avatar. Default true */
    showStatusDot?: boolean;
    /** Theme colors so the button matches the host app (incl. dark mode) */
    colors?: UserBadgeColors;
    /** Extra style for the outer container */
    style?: any;
}
/**
 * MobileUserBadge — a compact, picture-only login/logout button for mobile
 * bottom bars.
 *
 * Renders just the circular avatar (photo, initial, or a generic person glyph
 * while logged out). Logged in, tapping it opens a small popover that opens
 * UPWARD (so it isn't clipped by the bottom of the screen) with the account
 * identity and a Log out action. Logged out, tapping it calls `onLogin`.
 *
 * This is the mobile counterpart to `UserBadge` (which is a full pill with the
 * user's name + chevron, designed for a top header). Same `colors` palette, so
 * both stay visually consistent across breakpoints.
 */
export declare const MobileUserBadge: React.FC<MobileUserBadgeProps>;
//# sourceMappingURL=MobileUserBadge.d.ts.map