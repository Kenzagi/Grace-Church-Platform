import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // TypeScript rules
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-unused-disable-directive": "off",
    
    // React rules
    "react-hooks/exhaustive-deps": "off",
    "react-hooks/purity": "off",
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react/prop-types": "off",
    "react-compiler/react-compiler": "off",
    
    // Next.js rules
    "@next/next/no-img-element": "off",
    "@next/next/no-html-link-for-pages": "off",
    
    // General JavaScript rules
    "prefer-const": "off",
    "no-unused-vars": "off",
    "no-console": "off",
    "no-debugger": "off",
    "no-empty": "off",
    "no-irregular-whitespace": "off",
    "no-case-declarations": "off",
    "no-fallthrough": "off",
    "no-mixed-spaces-and-tabs": "off",
    "no-redeclare": "off",
    "no-undef": "off",
    "no-unreachable": "off",
    "no-useless-escape": "off",
  },
}, {
  // Vendored registry sources (uiarc "arc" + beui "motion" pickers) stay
  // byte-identical to upstream so registry updates re-apply cleanly. Relax the
  // react-hooks compiler rules for those paths only; app code keeps them all.
  files: [
    "src/components/motion/**",
    "src/components/arc/**",
    "src/lib/ease.ts",
    "src/lib/focusable.ts",
    "src/lib/hooks/use-hover-capable.ts",
  ],
  rules: {
    "react-hooks/refs": "off",
    "react-hooks/immutability": "off",
    "react-hooks/set-state-in-effect": "off",
    "react-hooks/preserve-manual-memoization": "off",
  },
}, {
  // Icon & chart single-sourcing (strict): every icon comes from the
  // @/components/icons barrel (lucide-react); every chart from
  // @/components/charts. Raw imports bypass the theme/stroke/tooltip rules.
  files: ["src/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [
        {
          group: ["lucide-react", "lucide-react/*"],
          message: "Import icons from @/components/icons (the barrel) — never from lucide-react directly.",
        },
        {
          group: ["nucleo-*"],
          message: "Nucleo was replaced by Lucide; import from @/components/icons.",
        },
        {
          group: ["recharts", "recharts/*"],
          message: "Use the chart components in @/components/charts — never import recharts in sections/pages.",
        },
      ],
    }],
  },
}, {
  // The barrels themselves are the one place allowed to import the sources.
  files: ["src/components/icons.tsx", "src/components/charts/**"],
  rules: {
    "no-restricted-imports": "off",
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "examples/**", "skills", "external/**", "download/**", "upload/**", "scripts/**", "docs/**", "prisma/migrations/**"]
}];

export default eslintConfig;
