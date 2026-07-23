/**
 * A user's role. Kept as a `string` (not a hard union) so consuming apps can
 * define their own role sets. The common values are suggested for convenience,
 * but any string a custom claim carries is accepted.
 */
export type Role = 'admin' | 'user' | (string & {});
/** A granular permission string, e.g. `"billing.read"` or `"posts.publish"`. */
export type Permission = string;
export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber?: string | null;
    /**
     * The user's primary role, read from the `role` custom claim on the Firebase
     * ID token. `null` when the user has no role claim yet.
     */
    role: Role | null;
    /**
     * Granular permissions, read from the `permissions` custom claim. Empty array
     * when the claim is absent. Use this when a single role isn't fine-grained
     * enough (see `hasPermission`).
     */
    permissions: Permission[];
    /**
     * The full, raw custom-claims object from the ID token. Use this to read any
     * bespoke claim your backend sets beyond `role`/`permissions`.
     */
    claims: Record<string, any>;
}
export interface AuthConfig {
    googleWebClientId?: string;
    googleIosClientId?: string;
    googleAndroidClientId?: string;
    appleEnabled?: boolean;
    emailPasswordEnabled?: boolean;
    phoneEnabled?: boolean;
    facebookAppId?: string;
    facebookAppSecret?: string;
    redirectUri?: string;
    /**
     * Roles that implicitly satisfy any `hasPermission` check (an "admin bypass").
     * A user whose `role` is in this list passes every permission check without
     * the permission needing to be listed in their `permissions` claim.
     * Defaults to `['admin']`. Pass `[]` to disable the bypass and require every
     * permission to be explicit.
     */
    superRoles?: Role[];
}
export interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    signInWithApple: () => Promise<void>;
    signInWithFacebook: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signInWithPhone: (phoneNumber: string, appVerifier: any) => Promise<any>;
    verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
    signOut: () => Promise<void>;
    /**
     * Force-refresh the ID token and re-read custom claims into `user`. Call this
     * after your backend changes a user's role/permissions so the change takes
     * effect without the user signing out and back in.
     */
    refreshUser: () => Promise<void>;
    /**
     * True when the current user's `role` matches `role` (string) or is one of
     * `role` (array). Returns false when signed out.
     */
    hasRole: (role: Role | Role[]) => boolean;
    /**
     * True when the current user has the given permission. Pass an array to
     * require ALL of them. Users whose role is in `config.superRoles`
     * (default `['admin']`) pass automatically.
     */
    hasPermission: (permission: Permission | Permission[]) => boolean;
}
export type AuthProviderId = 'google' | 'apple' | 'facebook' | 'email' | 'phone';
/** @deprecated Use {@link AuthProviderId}; kept for backwards compatibility. */
export type AuthProvider = AuthProviderId;
export type VantaEffectName = 'birds' | 'waves' | 'fog' | 'net' | 'globe' | 'cells' | 'rings' | 'halo' | 'clouds' | 'clouds2' | 'trunk' | 'topology' | 'dots';
export interface VantaConfig {
    effect: VantaEffectName;
    /** Vanta effect options passed directly to the VANTA[EFFECT]() initialiser */
    options?: Record<string, unknown>;
}
/** Theme palette for UserBadge — every field optional, merged over green defaults. */
export interface UserBadgeColors {
    /** Pill background */
    background?: string;
    /** Pill background on hover/press */
    backgroundActive?: string;
    /** Pill border */
    border?: string;
    /** Online status dot */
    dot?: string;
    /** First-name text */
    name?: string;
    /** Chevron */
    chevron?: string;
    /** Initials avatar background */
    avatarBackground?: string;
    /** Initials avatar text */
    avatarText?: string;
    /** Dropdown background */
    menuBackground?: string;
    /** Dropdown border + divider */
    menuBorder?: string;
    /** Dropdown primary text */
    menuText?: string;
    /** Dropdown secondary text (email) */
    menuSecondaryText?: string;
    /** Dropdown item hover background */
    menuHover?: string;
    /** Log out item text */
    logoutText?: string;
    /** Status dot while logged out (the "Log in" pill). Default gray */
    loginDot?: string;
}
export interface UserBadgeProps {
    /** Pill height in px — set to the same size as neighbouring header icon buttons. Default 34 */
    size?: number;
    /** Show the user's first name. Default true */
    showName?: boolean;
    /** Show the dropdown chevron. Default true */
    showChevron?: boolean;
    /** Overrides the built-in dropdown: pressing the pill calls this instead */
    onPress?: () => void;
    /** Called after a successful sign-out from the dropdown */
    onSignOut?: () => void;
    /**
     * When provided, the badge renders a "Log in" pill while logged out and
     * pressing it calls this (e.g. navigate to your Login screen).
     * When omitted, the badge renders nothing while logged out.
     */
    onLogin?: () => void;
    /** Label for the logged-out pill. Default "Log in" */
    loginLabel?: string;
    /** Theme colors so the badge matches the host app (incl. dark mode) */
    colors?: UserBadgeColors;
    /** Extra style for the outer container */
    style?: any;
}
export interface LoginScreenProps {
    onLoginSuccess?: () => void;
    showSignUp?: boolean;
    /** Web-only: animated Vanta.js background */
    vanta?: VantaConfig;
    /** Web-only: background image URL */
    backgroundImage?: string;
    /** Web-only: opacity of the login modal card (0-1), default 0.93 */
    modalOpacity?: number;
    /** Web-only: text color for header (title and subtitle) */
    headerTextColor?: string;
    /** Web-only: text color for footer links (sign up/phone toggle) */
    footerTextColor?: string;
    /** App name to display in welcome message, default "the Hub" */
    appName?: string;
}
//# sourceMappingURL=index.d.ts.map