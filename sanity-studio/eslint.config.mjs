import studio from '@sanity/eslint-config-studio'

export default [
  ...studio,
  {
    files: ['migrations/**/*.js', 'test-color.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
]
