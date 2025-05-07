describe('About Page', () => {
    beforeEach(() => {
      // Visit the About page (replace `/about` with the actual route)
      cy.visit('/recommend');
    });

    it('should navigate to login if not logged in', () => {
      cy.contains("LOGIN")
    });

});