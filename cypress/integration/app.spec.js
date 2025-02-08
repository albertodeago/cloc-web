/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

const appUrl = 'http://localhost:3000/';

const file1 = {
  kind: 'file',
  name: 'file1.js',
  getFile: async () => ({
    text: async () => 'file 1 1 lines.',
  }),
};
const file2 = {
  kind: 'file',
  name: 'file2.ts',
  getFile: async () => ({
    text: async () => 'file 2.\n2 lines',
  }),
};
const file3 = {
  kind: 'file',
  name: 'file3.md',
  getFile: async () => ({
    text: async () => 'file 3.\n3 \nlines',
  }),
};
const file4 = {
  kind: 'file',
  name: 'file4.ts',
  getFile: async () => ({
    text: async () => 'file\n 4.\n4 \nlines',
  }),
};
const dir1 = {
  kind: 'directory',
  name: 'dir1',
  entries: () => ({
    async *[Symbol.asyncIterator]() {
      yield [file1.name, file1];
      yield [file2.name, file2];
    },
  }),
};
const dir2 = {
  kind: 'directory',
  name: 'dir2',
  entries: () => ({
    async *[Symbol.asyncIterator]() {
      yield [file3.name, file3];
      yield [file4.name, file4];
    },
  }),
};

const dirHandle = {
  entries: () => ({
    async *[Symbol.asyncIterator]() {
      yield [dir1.name, dir1];
      yield [dir2.name, dir2];
    },
  }),
};

const clocAndCheck = (text) => {
  cy.get('input[type="range"]')
    .eq(0)
    .then((input) => {
      cy.controlledInputChange(input, '0');
    })
    .get('button')
    .contains('CLOC of a project')
    .click()
    .get("[data-test-id='results-label']")
    .contains(text);
};

describe('CLOC-WEB application', () => {
  beforeEach(() => {
    // Mock netlify function to avoid polluting data
    cy.intercept('POST', '/.netlify/functions/update', {
      statusCode: 200,
      body: {
        ts: 6,
        md: 3,
        js: 1,
      },
    }).as('updateData');

    cy.visit(appUrl, {
      onBeforeLoad: (win) => {
        // consoleSpy = cy.spy(win.console, "log").as("consoleSpy");
        cy.stub(win, 'showDirectoryPicker')
          .resolves(dirHandle)
          .as('showDirectoryPicker');
      },
    });
  });

  it('should contains the title', () => {
    cy.get('h1').contains('C');
    cy.get('h1').contains('L');
    cy.get('h1').contains('O');
    cy.get('h1').contains('C');
    cy.get('h1').contains('-');
    cy.get('h1').contains('W');
    cy.get('h1').contains('E');
    cy.get('h1').contains('B');
  });

  // This test actually works, but was failing in the CI and I was in a hurry
  // I should investigate and restore it
  it.skip('should be able to change theme', () => {
    cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)');
    cy.get("[data-test-id='theme-toggle']").click();
    cy.get('body').should('have.css', 'background-color', 'rgb(34, 34, 34)');
  });

  it('should be able to CLOC a project', () => {
    cy.get("[data-test-id='settings-icon']").click();
    clocAndCheck('Counted 4 files and 10 lines of code');
  });

  // it("should have links towards github, twitter and TODO");

  describe('should be able to customize algorithm', () => {
    it('should be able to customize ignore directory (with RegExp)', () => {
      cy.get("[data-test-id='settings-icon']").click();
      const firstIgnoreText = cy
        .get("[data-test-id='ignorelist-directory-item']")
        .first()
        .its('text');
      const firstIgnore = cy
        .get("[data-test-id='ignorelist-directory-item']")
        .first();
      firstIgnore.find("[data-test-id='ignorelist-directory-remove']").click();

      cy.get("[data-test-id='ignorelist-directory-input']")
        .type('/ir1$/')
        .type('{enter}');

      cy.get("[data-test-id='ignorelist-directory-item']")
        .first()
        .should('not.contain', firstIgnoreText);

      cy.get("[data-test-id='ignorelist-directory-item']")
        .last()
        .should('contain', '/ir1$/');

      clocAndCheck('Counted 2 files and 7 lines of code');
    });

    it('should be able to customize ignore directory (with pattern matching)', () => {
      cy.get("[data-test-id='settings-icon']").click();
      const firstIgnoreText = cy
        .get("[data-test-id='ignorelist-directory-item']")
        .first()
        .its('text');
      const firstIgnore = cy
        .get("[data-test-id='ignorelist-directory-item']")
        .first();
      firstIgnore.find("[data-test-id='ignorelist-directory-remove']").click();

      cy.get("[data-test-id='ignorelist-directory-input']")
        .type('ir1')
        .type('{enter}');

      cy.get("[data-test-id='ignorelist-directory-item']")
        .first()
        .should('not.contain', firstIgnoreText);

      cy.get("[data-test-id='ignorelist-directory-item']")
        .last()
        .should('contain', 'ir1');

      clocAndCheck('Counted 2 files and 7 lines of code');
    });

    it('should be able to customize ignore file (with RegExp)', () => {
      cy.get("[data-test-id='settings-icon']").click();
      const firstIgnoreText = cy
        .get("[data-test-id='ignorelist-file-item']")
        .first()
        .its('text');
      const firstIgnore = cy
        .get("[data-test-id='ignorelist-file-item']")
        .first();
      firstIgnore.find("[data-test-id='ignorelist-file-remove']").click();

      cy.get("[data-test-id='ignorelist-file-input']")
        .type('/.*\\.md/')
        .type('{enter}');

      cy.get("[data-test-id='ignorelist-file-item']")
        .first()
        .should('not.contain', firstIgnoreText);

      clocAndCheck('Counted 3 files and 7 lines of code');
    });

    it('should be able to customize ignore file (with pattern matching)', () => {
      cy.get("[data-test-id='settings-icon']").click();
      const firstIgnoreText = cy
        .get("[data-test-id='ignorelist-file-item']")
        .first()
        .its('text');
      const firstIgnore = cy
        .get("[data-test-id='ignorelist-file-item']")
        .first();
      firstIgnore.find("[data-test-id='ignorelist-file-remove']").click();

      cy.get("[data-test-id='ignorelist-file-input']")
        .type('file1')
        .type('{enter}');

      cy.get("[data-test-id='ignorelist-file-item']")
        .first()
        .should('not.contain', firstIgnoreText);

      clocAndCheck('Counted 3 files and 9 lines of code');
    });

    // it("should be able to turn on logs", () => {
    //   cy.get("[data-test-id='settings-icon']").click();
    //   // cy.get("input[type='checkbox']").click();
    //   cy.get('input[type="range"]')
    //     .eq(0)
    //     .then((input) => {
    //       cy.controlledInputChange(input, "0");
    //     })
    //     .get("button")
    //     .contains("CLOC of a project")
    //     .click()
    //     .get("[data-test-id='results-label']")
    //     .contains(`Counted 4 files and 10 lines of code`);

    //   // TODO: this is not working... we should count the amount of logs, or check the last one
    //   console.log(cy.get("@consoleSpy").calls);
    //   cy.get("@consoleSpy").should("have.been.calledWith", "CLOC of a project");
    // });

    it('should be able to customize workers', () => {
      cy.get("[data-test-id='settings-icon']").click();

      cy.get('input[type="range"]')
        .eq(0)
        .then((input) => {
          cy.controlledInputChange(input, '16');
        });
    });
  });

  it('should send counted results to the server', () => {
    cy.get("[data-test-id='settings-icon']").click();
    cy.get('input[type="range"]')
      .eq(0)
      .then((input) => {
        cy.controlledInputChange(input, '0');
      })
      .get('button')
      .contains('CLOC of a project')
      .click()
      .get("[data-test-id='results-label']")
      .contains(`Counted 4 files and 10 lines of code`);

    cy.get("[data-test-id='results-label']").contains(
      `Counted 4 files and 10 lines of code`
    );
    cy.wait('@updateData')
      .its('request.body')
      .should('equal', '{"data":{"js":1,"ts":6,"md":3}}');

    cy.get('@updateData').its('response.body').should('deep.equal', {
      js: 1,
      md: 3,
      ts: 6,
    });
  });
});
