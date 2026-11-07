import nextConfig from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [
      "_backup/**",
      ".next/**",
      "node_modules/**",
      "public/**",
    ],
  },
  ...nextConfig,
  {
    rules: {
      "import/no-anonymous-default-export": "off",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/static-components": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "warn",
      "@next/next/no-assign-module-variable": "warn",
    },
  },
];

export default eslintConfig;
