import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    fileParallelism: false,
    coverage: {
      provider: 'istanbul',
      all: true,
      include: ['src/**/*.js'],
      exclude: [
        'src/**/_test/*.js',
        'src/Commons/config.js',
        'src/app.js'
      ],
    },
  },
})