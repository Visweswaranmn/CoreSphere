import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  minify: false,
  // Bundle the workspace `@coresphere/shared` sources; keep node_modules external.
  noExternal: ['@coresphere/shared'],
  skipNodeModulesBundle: true,
});
