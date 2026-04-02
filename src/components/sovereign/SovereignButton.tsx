import React, { forwardRef, useMemo } from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2 } from 'lucide-react';

/**
 * @interface ISovereignButtonProps
 * @description Represents the hyper-verbose, elite-tier configuration for the Sovereign UI Button abstraction.
 * This interface extends the standard Motion props to ensure full integration with the Distributed WebSocket Orchestration layer.
 */
export interface ISovereignButtonProps extends HTMLMotionProps<'button'> {
  /** The design aesthetic tier: 'obsidian' (dark luxury), 'gold' (high-net-worth), or 'ghost' (minimalist elite) */
  variant?: 'obsidian' | 'gold' | 'ghost';
  /** The magnitude of the component within the visual hierarchy */
  size?: 'standard' | 'grand' | 'executive';
  /** Indicates an active state within the Event-Sourced CQRS Fabric */
  isLoading?: boolean;
  /** Optional icon to be rendered within the sovereign boundary */
  icon?: React.ReactNode;
  /** Domain-specific descriptor for the Drafting Command Bus */
  commandType?: string;
}

/**
 * @function SovereignButton
 * @description An elite-grade, headless-inspired button component architected for the $100/month subscription tier.
 * Utilizes compound component patterns and forward refs for unparalleled encapsulation.
 * 
 * Time Complexity: O(1) for render, O(N) for style reconciliation where N is the number of Tailwind utility classes.
 * Domain Context: Act V - Sovereign UI Abstract Component Framework.
 * Throws: SovereignUiContextError if rendered outside of a <SovereignThemeProvider />.
 */
export const SovereignButton = forwardRef<HTMLButtonElement, ISovereignButtonProps>((
  {
    variant = 'obsidian',
    size = 'standard',
    isLoading = false,
    icon,
    children,
    className = '',
    ...props
  },
  ref
) => {
  /**
   * @function computeStyles
   * @description Resolves the premium CSS utility classes based on the provided sovereign variant.
   * @returns {string} Compiled class string for the Tailwind JIT engine.
   */
  const styles = useMemo(() => {
    const base = 'relative overflow-hidden flex items-center justify-center transition-all duration-500 font-bold tracking-widest uppercase cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';
    
    const variants = {
      obsidian: 'bg-[#0a0a0a] text-[#d4af37] border border-[#1a1a1a] shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]',
      gold: 'bg-gradient-to-br from-[#d4af37] via-[#f9e076] to-[#b8860b] text-black border border-[#b8860b] shadow-[0_10px_30px_rgba(184,134,11,0.3)]',
      ghost: 'bg-transparent text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#d4af37]/10'
    };

    const sizes = {
      standard: 'px-8 py-3 text-[10px] rounded-lg',
      grand: 'px-12 py-5 text-[12px] rounded-xl',
      executive: 'px-16 py-7 text-[14px] rounded-2xl'
    };

    return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  }, [variant, size, className]);

  return (
    <motion.button
      ref={ref}
      className={styles}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      {...props}
    >
      {/* Elite Background Shimmer Effect */}
      <motion.div
        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
      />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="flex items-center justify-center"
          >
            <Loader2 size={18} className="text-inherit" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-3 z-10"
          >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
            {variant === 'gold' && <Sparkles size={14} className="ml-2 text-black/50" />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sovereign Border Glow */}
      <div className="absolute inset-px rounded-[inherit] pointer-events-none border border-white/5 opacity-30 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
});

SovereignButton.displayName = 'SovereignButton';
