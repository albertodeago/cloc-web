import js from "@eslint/js";

export default [
	{
		ignores: ["out/", ".next/", "node_modules/", ".netlify/", "cypress/"],
	},
	js.configs.recommended,
	{
		// Basic settings for next.js project files
		languageOptions: {
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				ecmaFeatures: {
					jsx: true,
				},
			},
			// Manually defining common globals to avoid no-undef errors without full plugin setup
			globals: {
				process: "readonly",
				module: "readonly",
				require: "readonly",
				console: "readonly",
				window: "readonly",
				document: "readonly",
				self: "readonly",
				fetch: "readonly",
				URL: "readonly",
			},
		},
	},
];
