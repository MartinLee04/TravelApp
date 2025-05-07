describe('Flight Search Drawer', () => {
    beforeEach(() => {
      // Visit the page containing the component
      cy.visit('/search');
    });
  
    it('should render the drawer with correct initial state', () => {
      // Verify that the drawer exists
      cy.get('.MuiDrawer-root').should('exist');
    });
  
    it('should render the text fields with appropriate labels', () => {
      cy.contains("FROM > TO")
    });
  
    it('should select departure and return dates', () => {
      // Verify the date pickers exist
      cy.get('[id="departureDate"]').should('exist');
      cy.get('[id="returnDate"]').should('exist');
  
    });
  
    it('should select a preferred cabin', () => {
      // Verify cabin dropdown exists
      cy.get('#cabin').should('exist');
  
      // Select "Business Class"
      cy.get('#cabin').click(); // Open dropdown
    });
  
    it('should handle user interactions and validate inputs', () => {
      // Simulate input changes
      //cy.get('#originCode').type('Ottawa (YOW)');
      cy.get('#destinationCode').type('YYZ');
  
      // Assert the input values
      cy.get('[role="option"]') // Replace with your dropdown options selector
      .contains('Toronto (YYZ)') // Replace with the text of the option you want to click
      .click();
    });
  });
  