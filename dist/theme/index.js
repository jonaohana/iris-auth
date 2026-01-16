"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = void 0;
exports.theme = {
    colors: {
        primary: '#4285F4',
        primaryDark: '#3367D6',
        secondary: '#000000',
        apple: '#000000',
        background: '#FFFFFF',
        surface: '#F8F9FA',
        surfaceHover: '#F1F3F4',
        text: '#202124',
        textSecondary: '#5F6368',
        textLight: '#FFFFFF',
        border: '#DADCE0',
        borderFocus: '#4285F4',
        error: '#D93025',
        success: '#1E8E3E',
        overlay: 'rgba(0, 0, 0, 0.5)',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: '700',
            lineHeight: 40,
        },
        h2: {
            fontSize: 24,
            fontWeight: '600',
            lineHeight: 32,
        },
        h3: {
            fontSize: 20,
            fontWeight: '600',
            lineHeight: 28,
        },
        body: {
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 24,
        },
        bodySmall: {
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 20,
        },
        button: {
            fontSize: 16,
            fontWeight: '600',
            lineHeight: 24,
        },
    },
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
        },
    },
};
