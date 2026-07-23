import React from 'react';
import { GestureResponderEvent } from 'react-native';
interface HelloBearButtonProps {
    onPress?: (event: GestureResponderEvent) => void;
    title?: string;
}
/**
 * A simple shared "Hello Bear" button.
 * Lives in @iris/auth so every consuming app (ganjahub, forsparta, iris, ...)
 * picks it up from the same source.
 */
export declare const HelloBearButton: React.FC<HelloBearButtonProps>;
export {};
//# sourceMappingURL=HelloBearButton.d.ts.map