import { User } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
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
}

export type AuthProvider = 'google' | 'apple' | 'facebook' | 'email' | 'phone';

export type VantaEffectName =
  | 'birds' | 'waves' | 'fog' | 'net' | 'globe'
  | 'cells' | 'rings' | 'halo' | 'clouds' | 'clouds2'
  | 'trunk' | 'topology' | 'dots';

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
