describe('Profile Page Tests', () => {
    beforeEach(() => {
      // Visit the Profile page
      cy.visit('/profile');
    });
  
    it('should display the login form by default', () => {
      cy.contains('LOGIN').should('be.visible');
      cy.get('form').within(() => {
        cy.get('input').should('have.length', 2);
        cy.contains('LOG IN');
      });
    });
  
    it('should toggle to the registration form', () => {
      cy.contains("Don't have an account? Register").click();
      cy.contains('REGISTER').should('be.visible');
      cy.get('form').within(() => {
        cy.get('input').should('have.length', 7);
        cy.contains('REGISTER');
      });
    });
  
    it('should show an alert if required fields are missing during login', () => {
      cy.contains('LOG IN').click();
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Username and password are required');
      });
    });
  
    it('should show an alert if required fields are missing during registration', () => {
      cy.contains("Don't have an account? Register").click();
      cy.contains('REGISTER').click();
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Please fill in all required registration fields.');
      });
    });
  });