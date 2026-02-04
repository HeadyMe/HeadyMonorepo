// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-ide/packages/core/src/sacred-geometry.ts
// LAYER: root
// 
//         _   _  _____    _  __   __
//        | | | || ____|  / \ \  / /
//        | |_| ||  _|   / _ \ \ V / 
//        |  _  || |___ / ___ \ | |  
//        |_| |_||_____/_/   \_\|_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
// HEADY_BRAND:END

/**
 * Sacred Geometry Theme Engine
 * 
 * Implements golden ratio (φ) based design system
 */

import { injectable } from 'inversify';
import { SacredGeometryTheme } from './types';

const PHI = 1.618033988749895; // Golden ratio

@injectable()
export class SacredGeometryThemeEngine {
  private theme: SacredGeometryTheme;

  constructor() {
    this.theme = this.createDefaultTheme();
  }

  /**
   * Create default Sacred Geometry theme
   */
  private createDefaultTheme(): SacredGeometryTheme {
    return {
      phi: PHI,
      colors: {
        primary: '#6366f1',    // Indigo
        secondary: '#8b5cf6',  // Purple
        accent: '#ec4899',     // Pink
        background: '#0f172a', // Dark slate
        foreground: '#f1f5f9'  // Light slate
      },
      spacing: {
        base: 8,
        scale: (level: number) => {
          // Use golden ratio for spacing scale
          return Math.round(8 * Math.pow(PHI, level));
        }
      },
      animations: {
        breathingDuration: 3000, // 3 seconds
        transitionTiming: 'cubic-bezier(0.618, 0, 0.382, 1)' // Golden ratio bezier
      }
    };
  }

  /**
   * Get current theme
   */
  getTheme(): SacredGeometryTheme {
    return this.theme;
  }

  /**
   * Calculate golden ratio spacing
   */
  spacing(level: number): number {
    return this.theme.spacing.scale(level);
  }

  /**
   * Generate CSS variables for theme
   */
  generateCSSVariables(): string {
    const { colors, spacing, animations } = this.theme;

    return `
      :root {
        /* Golden Ratio */
        --phi: ${PHI};
        
        /* Colors */
        --color-primary: ${colors.primary};
        --color-secondary: ${colors.secondary};
        --color-accent: ${colors.accent};
        --color-background: ${colors.background};
        --color-foreground: ${colors.foreground};
        
        /* Spacing (Golden Ratio Scale) */
        --spacing-0: ${spacing.scale(0)}px;
        --spacing-1: ${spacing.scale(1)}px;
        --spacing-2: ${spacing.scale(2)}px;
        --spacing-3: ${spacing.scale(3)}px;
        --spacing-4: ${spacing.scale(4)}px;
        --spacing-5: ${spacing.scale(5)}px;
        
        /* Animations */
        --animation-breathing: ${animations.breathingDuration}ms;
        --animation-timing: ${animations.transitionTiming};
        
        /* Border Radius (Golden Ratio) */
        --radius-sm: ${Math.round(4 * PHI)}px;
        --radius-md: ${Math.round(8 * PHI)}px;
        --radius-lg: ${Math.round(16 * PHI)}px;
        
        /* Typography (Golden Ratio Scale) */
        --font-size-xs: ${Math.round(12 / PHI)}px;
        --font-size-sm: ${Math.round(14 / PHI)}px;
        --font-size-base: 14px;
        --font-size-lg: ${Math.round(14 * PHI)}px;
        --font-size-xl: ${Math.round(14 * PHI * PHI)}px;
        --font-size-2xl: ${Math.round(14 * PHI * PHI * PHI)}px;
      }
    `;
  }

  /**
   * Generate breathing animation CSS
   */
  generateBreathingAnimation(): string {
    return `
      @keyframes sacred-breathing {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(${1 + (1 / PHI - 1) * 0.1});
          opacity: ${1 - (1 / PHI - 1) * 0.2};
        }
      }
      
      .sacred-breathing {
        animation: sacred-breathing var(--animation-breathing) var(--animation-timing) infinite;
      }
    `;
  }

  /**
   * Calculate optimal layout proportions using golden ratio
   */
  calculateLayout(totalWidth: number): { sidebar: number; main: number } {
    const sidebar = Math.round(totalWidth / PHI);
    const main = totalWidth - sidebar;
    
    return { sidebar, main };
  }

  /**
   * Generate organic curve path for SVG
   */
  generateOrganicCurve(points: number = 10): string {
    const path: string[] = [];
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radius = 100 * (1 + Math.sin(angle * PHI) * 0.2);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        path.push(`M ${x} ${y}`);
      } else {
        path.push(`L ${x} ${y}`);
      }
    }
    
    path.push('Z');
    return path.join(' ');
  }

  /**
   * Apply theme to DOM
   */
  applyTheme(): void {
    const style = document.createElement('style');
    style.textContent = this.generateCSSVariables() + this.generateBreathingAnimation();
    document.head.appendChild(style);
  }
}
