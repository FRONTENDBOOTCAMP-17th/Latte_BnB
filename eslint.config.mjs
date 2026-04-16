import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['node_modules/', 'build/', 'dist/', '*.config.mjs'],
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'warn', // 안 쓰는 변수 경고
      'no-console': 'off', // console 허용
      semi: ['error', 'always'], // 세미콜론 강제
      quotes: ['error', 'single'], // 작은따옴표
      indent: ['error', 2], // 들여쓰기 2칸
      'no-trailing-spaces': ['error'], //줄 끝 불필요한 공백 제거 요구
      'prefer-const': 'error', //재할당이 없으면 const 강제
      eqeqeq: 'error', // === 사용 강제
      curly: 'error', // if/else 에서 중괄호({}) 사용 강제
      'no-implicit-globals': 'error', //전역 변수 생성 금지
      'no-var': 'error', //var 사용 금지
    },
  },
]);
