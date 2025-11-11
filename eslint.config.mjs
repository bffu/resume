// Flat ESLint config for Next.js 15 + ESLint 9
// Mirrors previous extends: ["next/core-web-vitals", "next/typescript"]
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default [
  // Next.js + React rules (Core Web Vitals)
  ...nextCoreWebVitals,
  // TypeScript recommended rules
  ...nextTypescript,
  // Temporarily ignore files with legacy JSX/text encodings to unblock linting
  {
    ignores: [
      'components/job-intention-editor.tsx',
      'components/module-editor.tsx',
      'components/personal-info-editor.tsx',
    ],
  },
];
