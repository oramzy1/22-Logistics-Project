import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['smoke/**/*.smoke.ts'],
    globalSetup: ['./smoke/global-setup.ts'],
    // sequential: the API rate-limiters are keyed by IP, parallel files would 429 each other
    fileParallelism: false,
    maxWorkers: 1,
    sequence: { concurrent: false },
    testTimeout: 20000,
    hookTimeout: 20000,
    reporters: ['default'],
  },
});