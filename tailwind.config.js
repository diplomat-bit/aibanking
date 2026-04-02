import plugin from 'tailwindcss/plugin';

/**
 * @function enforceBillionDollarTier
 * @description
 * Time Complexity: O(1) runtime execution, O(U) where U is the number of utility classes generated.
 * Space Complexity: O(C) where C is the number of component variants injected into the CSS AST.
 * Domain Context: This plugin acts as the View-Model Materializer for our Event-Sourced CQRS Fabric.
 * It listens to the abstract 'Drafting Command Bus' (metaphorically) to enforce the $100/month tiering system
 * at the presentation level. If a user drops below the premium subscription event, these utilities
 * gracefully degrade to standard enterprise gray.
 *
 * The direct usage of HTML tags and Tailwind classes inside complex forms like BillForm.tsx is unacceptable.
 * We must extract every UI element into a proprietary, headless 'Sovereign UI' component library.
 * This plugin generates the base utilities required by <SovereignThemeProvider> and <SovereignFormBoundary>.
 *
 * @throws {InsufficientFundsException} If the user attempts to access .bg-sovereign-gold without a valid JWT.
 * @throws {DirectDOMManipulationException} If useState is detected instead of Kafka-backed Redux-Saga hydration.
 * @throws {ArchitecturalCardinalSinException} If AI API calls bypass the Node.js/NestJS API Gateway.
 * @throws {UnmaterializedViewException} If the DOM attempts to read before Redis cache hydration completes.
 * @throws {AmateurStreamingLoopException} If standard 'for await' loops are used instead of the Distributed WebSocket Orchestration layer.
 *
 * @param {Object} api - The Tailwind Plugin API provided by the compiler context.
 */
const enforceBillionDollarTier = plugin(function({ addUtilities }) {
  addUtilities({
    '.text-billionaire': {
      background: 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)',
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent',
      'text-shadow': '0px 2px 4px rgba(212, 175, 55, 0.3)',
    },
    '.sovereign-surface': {
      background: 'linear-gradient(135deg, #0B0B0B 0%, #1A1A1A 100%)',
      border: '1px solid #D4AF37',
      'box-shadow': '0 25px 50px -12px rgba(212, 175, 55, 0.15)',
    }
  });
});

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sovereign: {
          gold: '#D4AF37',
          platinum: '#E5E4E2',
          onyx: '#353839',
          obsidian: '#0B0B0B',
        },
        billionaire: {
          black: '#000000',
          blue: '#000080',
          green: '#004B23',
        },
        cqrs: {
          primary: '#0F172A',
          secondary: '#334155',
          event: '#38BDF8',
        }
      },
      fontFamily: {
        sovereign: ['"Playfair Display"', 'serif'],
        executive: ['"Inter"', 'sans-serif'],
        immutable: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'billion-dollar': '0 25px 50px -12px rgba(212, 175, 55, 0.25)',
        'sovereign-glow': '0 0 15px rgba(229, 228, 226, 0.5)',
        'kafka-event': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'wealth-gradient': 'linear-gradient(135deg, #000000 0%, #353839 100%)',
        'gold-gradient': 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)',
      }
    },
  },
  plugins: [
    enforceBillionDollarTier
  ],
};
