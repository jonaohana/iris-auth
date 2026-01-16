"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = exports.PhoneLoginInput = exports.AuthButton = exports.LoginScreen = exports.useAuth = exports.AuthProvider = void 0;
// Components
var AuthContext_1 = require("./contexts/AuthContext");
Object.defineProperty(exports, "AuthProvider", { enumerable: true, get: function () { return AuthContext_1.AuthProvider; } });
Object.defineProperty(exports, "useAuth", { enumerable: true, get: function () { return AuthContext_1.useAuth; } });
var LoginScreen_1 = require("./components/LoginScreen");
Object.defineProperty(exports, "LoginScreen", { enumerable: true, get: function () { return LoginScreen_1.LoginScreen; } });
var AuthButton_1 = require("./components/AuthButton");
Object.defineProperty(exports, "AuthButton", { enumerable: true, get: function () { return AuthButton_1.AuthButton; } });
var PhoneLoginInput_1 = require("./components/PhoneLoginInput");
Object.defineProperty(exports, "PhoneLoginInput", { enumerable: true, get: function () { return PhoneLoginInput_1.PhoneLoginInput; } });
var theme_1 = require("./theme");
Object.defineProperty(exports, "theme", { enumerable: true, get: function () { return theme_1.theme; } });
// Re-export all types from types file
__exportStar(require("./types"), exports);
