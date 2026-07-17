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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VantaBackground = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const VantaBackground = ({ vanta, children, backgroundImage }) => {
    const containerRef = (0, react_1.useRef)(null);
    const effectRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (react_native_1.Platform.OS !== 'web')
            return;
        let mounted = true;
        const loadScript = (src) => new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const s = document.createElement('script');
            s.src = src;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error(`[VantaBackground] Failed to load: ${src}`));
            document.head.appendChild(s);
        });
        const init = async () => {
            try {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
                await loadScript(`https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.${vanta.effect}.min.js`);
                if (!mounted || !containerRef.current)
                    return;
                const VANTA = window.VANTA;
                const key = vanta.effect.toUpperCase();
                if (!VANTA?.[key])
                    return;
                effectRef.current = VANTA[key]({
                    el: containerRef.current,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    ...vanta.options,
                });
            }
            catch (err) {
                console.error('[VantaBackground]', err);
            }
        };
        init();
        return () => {
            mounted = false;
            if (effectRef.current) {
                effectRef.current.destroy();
                effectRef.current = null;
            }
        };
    }, [vanta.effect]);
    const containerStyle = backgroundImage
        ? [styles.container, { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }]
        : styles.container;
    return (react_1.default.createElement(react_native_1.View, { ref: containerRef, style: containerStyle },
        react_1.default.createElement(react_native_1.View, { style: styles.overlay }, children)));
};
exports.VantaBackground = VantaBackground;
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        ...react_native_1.Platform.select({
            web: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
            },
            default: {},
        }),
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        ...react_native_1.Platform.select({
            web: {
                position: 'relative',
                zIndex: 1,
            },
            default: {},
        }),
    },
});
