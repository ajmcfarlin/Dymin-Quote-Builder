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
      
      // Disable React Hook dependency warnings (can be re-enabled later)
      "react-hooks/exhaustive-deps": "warn",
      
      // Keep some important rules as warnings
      "prefer-const": "warn"
    },
    ignores: [
      // Ignore generated files
      "src/generated/**/*",
      "prisma/generated/**/*",
      "*.generated.*"
    ]
  }
];

export default eslintConfig;
