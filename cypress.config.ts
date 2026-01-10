import { defineConfig } from "cypress";

export default defineConfig({
	e2e: {
		baseUrl: "http://localhost:8888",
		screenshotOnRunFailure: false,
		video: false,
		specPattern: "cypress/e2e/**/*.spec.js",
		supportFile: "cypress/support/e2e.js",
		setupNodeEvents(on, config) {
			// implement node event listeners here
		},
	},
});
