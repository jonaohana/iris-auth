import React from 'react';
interface AuthButtonProps {
    onPress: () => void;
    title: string;
    provider: 'google' | 'apple' | 'facebook' | 'email' | 'phone';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    /** Shorter button with tighter spacing — for space-constrained layouts. */
    compact?: boolean;
    /** Show only the icon (title becomes the accessibility label) — for a row of providers. */
    iconOnly?: boolean;
}
export declare const AuthButton: React.FC<AuthButtonProps>;
export {};
//# sourceMappingURL=AuthButton.d.ts.map