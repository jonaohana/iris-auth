import React, { useEffect, useRef } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { VantaConfig } from '../types';

interface Props {
  vanta: VantaConfig;
  children: React.ReactNode;
  backgroundImage?: string;
}

export const VantaBackground: React.FC<Props> = ({ vanta, children, backgroundImage }) => {
  const containerRef = useRef<any>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let mounted = true;

    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
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
        await loadScript(
          `https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.${vanta.effect}.min.js`
        );
        if (!mounted || !containerRef.current) return;
        const VANTA = (window as any).VANTA;
        const key = vanta.effect.toUpperCase();
        if (!VANTA?.[key]) return;
        effectRef.current = VANTA[key]({
          el: containerRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          ...vanta.options,
        });
      } catch (err) {
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
    ? [styles.container, { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } as any]
    : styles.container;

  return (
    <View ref={containerRef} style={containerStyle as any}>
      <View style={styles.overlay as any}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
      } as any,
      default: {},
    }),
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        position: 'relative',
        zIndex: 1,
      } as any,
      default: {},
    }),
  },
});
