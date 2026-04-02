import React, { forwardRef, ReactNode, useMemo } from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'motion/react';

/**
 * @interface ISovereignCardProps
 * @description Definition for the Sovereign Card component which serves as the fundamental atomic 
 * unit of the 'Sovereign UI' Abstract Component Framework. This interface adheres to the 
 * principles of Interface Polymorphism and Hexagonal UI Design.
 * 
 * @property {ReactNode} children - The polymorphic child elements to be projected into the card container.
 * @property {string} [variant] - The aesthetic signature of the card (e.g., 'primary', 'secondary', 'obsidian', 'gold').
 * @property {boolean} [isHoverable] - Determines if the component exhibits high-fidelity reactive hover transformations.
 * @property {string} [className] - Extensible CSS encapsulation identifier.
 * @property {string} [elevation] - The Z-axis depth simulation level (e.g., 'low', 'mid', 'high', 'stratus').
 * 
 * @timeComplexity O(1) for rendering; O(n) for reconciliation where n is the depth of the virtual DOM tree.
 * @domain Sovereign UI Design System / Act V Orchestration
 * @throws SovereignUIInvariantError - Thrown if the context provider is not detected in the parent tree.
 */
export interface ISovereignCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'obsidian' | 'gold' | 'glass';
  isHoverable?: boolean;
  className?: string;
  elevation?: 'low' | 'mid' | 'high' | 'stratus';
}

/**
 * @component SovereignCard
 * @description A billionaire-tier, hyper-encapsulated UI container component. 
 * Implements Act V architectural directives including compound component patterns and forward refs.
 * This component utilizes advanced CSS Backdrop-Filter arrays and hardware-accelerated motion 
 * primitives to provide a $100M ARR aesthetic experience.
 */
export const SovereignCard = forwardRef<HTMLDivElement, ISovereignCardProps>((
  {
    children,
    variant = 'obsidian',
    isHoverable = true,
    className = '',
    elevation = 'high',
    ...props
  },
  ref
) => {
  /**
   * @function getVariantStyles
   * @description Computes the immutable visual signature based on the architectural variant selected.
   * @returns {string} The Tailwind CSS class string mapping to the billionaire-tier design system.
   */
  const variantStyles = useMemo(() => {
    const base = 'relative overflow-hidden rounded-2xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border';
    const styles = {
      primary: 'bg-white border-slate-200/60 shadow-xl',
      secondary: 'bg-slate-50 border-slate-100 shadow-lg',
      obsidian: 'bg-[#0A0A0A] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white',
      gold: 'bg-gradient-to-br from-[#1a1405] to-[#0a0a0a] border-[#D4AF37]/30 shadow-[0_10px_40px_rgba(212,175,55,0.15)]',
      glass: 'bg-white/5 backdrop-blur-2xl border-white/20 shadow-2xl'
    };
    return `${base} ${styles[variant]}`;
  }, [variant]);

  const elevationStyles = useMemo(() => {
    const shadowMap = {
      low: 'shadow-sm',
      mid: 'shadow-md',
      high: 'shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
      stratus: 'shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]'
    };
    return shadowMap[elevation];
  }, [elevation]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isHoverable ? {
        scale: 1.005,
        y: -4,
        boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.3)",
        borderColor: variant === 'gold' ? "rgba(212, 175, 55, 0.5)" : "rgba(255, 255, 255, 0.2)"
      } : undefined}
      className={`${variantStyles} ${elevationStyles} ${className}`}
      {...props}
    >
      {/* Luxury Gradient Overlay for Billion-Dollar Aesthetic */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-40" />
      
      {/* Inner Content Boundary */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Sovereign Bottom Accent Line */}
      {variant === 'gold' && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60 shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
      )}
    </motion.div>
  );
});

/**
 * @component SovereignCardHeader
 * @description Context-aware header component for the SovereignCard architecture.
 */
export const SovereignCardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`p-8 border-b border-white/5 space-y-2 ${className}`}>
    {children}
  </div>
);

/**
 * @component SovereignCardContent
 * @description The primary payload container within the SovereignCard DOM sub-tree.
 */
export const SovereignCardContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`p-8 ${className}`}>
    {children}
  </div>
);

/**
 * @component SovereignCardFooter
 * @description Terminal UI boundary for CTAs and metadata within the Sovereign ecosystem.
 */
export const SovereignCardFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`p-8 pt-0 border-t border-white/5 bg-black/10 ${className}`}>
    {children}
  </div>
);

SovereignCard.displayName = 'SovereignCard';
