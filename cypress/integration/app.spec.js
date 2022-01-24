/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

const appUrl = "http://localhost:3000";

const fakeFile1 = {
  kind: "file",
  async getFile() {
    return {
      async text() {
        return "fake file 1.\nthree\nlines.";
      },
    };
  },
};
const fakeFile2 = {
  kind: "file",
  async getFile() {
    return {
      async text() {
        return "fake file 2, just one line.";
      },
    };
  },
};
const fakeFile3 = {
  kind: "file",
  async getFile() {
    return {
      async text() {
        return "fake file 3.\nTwo lines.";
      },
    };
  },
};

// TODO: this does not work because we are trying to stub the dirHandle
// with something not serializable.
describe("CLOC-WEB application", () => {
  it("should contains the title", () => {
    // Start from the index page
    cy.visit(appUrl);

    cy.get("h1").contains("C");
    cy.get("h1").contains("L");
    cy.get("h1").contains("O");
    cy.get("h1").contains("C");
    cy.get("h1").contains("-");
    cy.get("h1").contains("W");
    cy.get("h1").contains("E");
    cy.get("h1").contains("B");
  });

  it("should be able to CLOC a project", () => {
    cy.visit(appUrl, {
      onBeforeLoad: (win) => {
        const fakeDirHandle = {
          entries() {
            return [
              ["package.json", fakeFile1],
              ["README.md", fakeFile2],
              ["index.js", fakeFile3],
            ];
          },
        };
        cy.stub(win, "showDirectoryPicker")
          .resolves(fakeDirHandle)
          .as("showDirectoryPicker");
      },
    });

    cy.get("#cloc-main-thread").click();
    cy.get(".total").contains(`Counted 3 files and 6 lines of code in`);
  });
});
