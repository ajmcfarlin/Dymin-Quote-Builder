import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable noisy TypeScript rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "off", 
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      
      // Disable React rules that are noisy
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
      
      // Disable Next.js rules that are noisy
      "@next/next/no-html-link-for-pages": "warn",
      "@next/next/no-img-element": "warn",
      
      // Keep some important rules as warnings
      "prefer-const": "warn"
    },
    ignores: [
      // Ignore generated files completely
      "src/generated/**/*",
      "prisma/generated/**/*",
      "*.generated.*",
      ".next/**/*",
      "node_modules/**/*"
    ]
  }
];

export default eslintConfig;
