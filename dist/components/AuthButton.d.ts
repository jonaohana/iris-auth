import React from 'react';
interface AuthButtonProps {
    onPress: () => void;
    title: string;
    provider: 'google' | 'apple' | 'facebook' | 'email' | 'phone';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
}
export declare const AuthButton: React.FC<AuthButtonProps>;
export {};
//# sourceMappingURL=AuthButton.d.ts.map