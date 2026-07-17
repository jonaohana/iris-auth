import React from 'react';
export interface UserMenuOption {
    label: string;
    icon?: string;
    onPress: () => void;
    danger?: boolean;
}
export interface UserMenuProps {
    /** Extra items shown above the default logout option */
    extraOptions?: UserMenuOption[];
    /** Accent colour for the online dot and badge border. Defaults to green. */
    accentColor?: string;
    /** Height in px — match your nav icon size. Defaults to 32. */
    height?: number;
    /** Called after successful sign-out */
    onSignOut?: () => void;
}
export declare function UserMenu({ extraOptions, accentColor, height, onSignOut }: UserMenuProps): React.JSX.Element;
//# sourceMappingURL=UserMenu.d.ts.map