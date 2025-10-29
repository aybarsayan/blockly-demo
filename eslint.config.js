import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
  { languageOptions: { globals: globals.browser } },
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
    }
  },
  {
    ignores: ["dist/**", "eslint.config.js", "client/src/components/ui/**"]
  }
];