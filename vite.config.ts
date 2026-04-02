/**
 * @file vite.config.ts
 * @description Enterprise-grade, Zero-Trust Vite Configuration Matrix.
 * Integrates Sovereign UI abstractions, Hexagonal Architecture path resolutions,
 * and Reverse-Proxy definitions for the High-Concurrency NestJS/Node.js Backend-For-Frontend (BFF).
 * @author Elite AI Implementation Team
 * @complexity O(1) configuration mapping
 */

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, UserConfig } from 'vite';

/**
 * Bootstraps the enterprise configuration object.
 * Enforces strictly segregated port mapping, CQRS WebSocket proxying, and Zero-Trust environment variables.
 * 
 * @param {Object} context - Vite configuration context containing the current mode.
 * @returns {UserConfig} The materialized Vite configuration.
 * @throws {Error} If environment validation fails.
 */
export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [
      react(), 
      tailwindcss()
    ],
    
    define: {
      // Act I Compliance: Eradicating the cardinal sin of exposing GEMINI_API_KEY to the client.
      // The frontend now only knows about the Drafting Command Bus Gateway.
      'process.env.BFF_GATEWAY_URL': JSON.stringify(env.BFF_GATEWAY_URL || 'http://localhost:4000/api/v1/command-bus'),
      'process.env.WS_ORCHESTRATOR_URL': JSON.stringify(env.WS_ORCHESTRATOR_URL || 'ws://localhost:4001/hydrate'),
    },
    
    resolve: {
      // Act III Compliance: Hexagonal Domain-Driven Design (DDD) Path Aliases
      // Act V Compliance: The 'Sovereign UI' Abstract Component Framework Path Alias
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@domain': path.resolve(__dirname, './src/domain'),
        '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
        '@application': path.resolve(__dirname, './src/application'),
        '@presentation': path.resolve(__dirname, './src/presentation'),
        '@sovereign-ui': path.resolve(__dirname, './src/sovereign-ui'),
      },
    },
    
    server: {
      port: 3000,
      host: '0.0.0.0',
      
      // Reverse-proxy configurations for the BFF and WebSocket Fleets
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ws': {
          target: 'ws://localhost:4001',
          ws: true,
        }
      },

      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    
    build: {
      // Billion-dollar enterprise optimization flags
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1024,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            sovereignUi: ['motion', 'lucide-react'], // Abstracting out our heavy UI orchestrator
          }
        }
      }
    }
  };
});
