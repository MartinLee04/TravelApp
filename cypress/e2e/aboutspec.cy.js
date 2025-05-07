describe('About Page', () => {
    beforeEach(() => {
      // Visit the About page (replace `/about` with the actual route)
      cy.visit('/about');
    });
  
    it('should render the About page heading correctly', () => {
      // Check if the heading exists with correct text
      cy.get('h4').contains('ABOUT US').should('be.visible');
    });
  
    it('should render team member names in a list', () => {
      // Verify all team member names
      cy.contains('Joseph Zhang').should('be.visible');
      cy.contains('Fabian Bayona').should('be.visible');
      cy.contains('Seth Philp').should('be.visible');
      cy.contains('Sean Shin').should('be.visible');
      cy.contains('Martin Lee').should('be.visible');
    });
  
    it('should render introductory text correctly', () => {
      // Verify the introductory paragraph
      cy.contains(
        'We are a group of students that can find the best recommendations for your travel plans.'
      ).should('be.visible');
    });
  
  
    it('should navigate to the filter page', () => {
      // Simulate locgin action
      cy.get('button').contains('Filter').click(); 
    });
  
  
    it('should render the Paper component with correct styles', () => {
      // Verify the Paper component styles
      cy.get('.MuiPaper-root').should('exist');
    });
  });
  