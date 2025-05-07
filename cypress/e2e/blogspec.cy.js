describe('Blog Posts Page', () => {
    beforeEach(() => {
      // Navigate to the blog posts page (replace with actual route)
      cy.visit('/blog'); 
    });
  
    it('should render the main heading correctly', () => {
      cy.contains('BLOG POSTS');
    });

    it('should render the Blog Post page correctly', () => {
      cy.get('h4').contains('BLOG POSTS'); // Check main heading
      cy.get('button').contains('Submit Post'); // Verify Submit button
    });

    it('should display validation errors on invalid submission', () => {
      // Attempt to submit without filling out the form
      cy.get('button').contains('Submit Post').click();
    
      // Check for error messages
      cy.get('p').contains('Blog title is required').should('be.visible'); // Example error
      cy.get('p').contains('Blog content is required').should('be.visible');
    });
});