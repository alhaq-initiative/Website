describe('Alhaq website smoke', () => {
  it('loads home and critical assets', () => {
    cy.visit('/');
    // At least one stylesheet is loaded (components.css/home.css/etc.)
    cy.get('link[rel="stylesheet"]').should('have.length.at.least', 1);
    // Global site script present
    cy.get('script[src*="assets/js/site.js"]').should('exist');
  cy.contains('Alhaq Initiative');
  });

  it('navigates to About/Services/Library/Donate/Quran', () => {
    const pages = ['about.html', 'services.html', 'library.html', 'donate.html', 'quran.html'];
    pages.forEach(p => {
      cy.visit(`/${p}`);
      cy.get('link[rel="stylesheet"]').should('have.length.at.least', 1);
      cy.get('script[src*="assets/js/site.js"]').should('exist');
    });
  });

  it('language switch reflects RTL and resets on English', () => {
    cy.visit('/services.html');
    // open floating language switcher menu
    cy.get('#global-lang-btn').click();
    cy.get('#global-lang-menu').contains('العربية').click();
    cy.get('html').should('have.attr', 'dir', 'rtl');

    // back to English, expect reload and dir=ltr
    cy.get('#global-lang-btn').click();
    cy.get('#global-lang-menu').contains('English').click();
    cy.get('html').should('have.attr', 'dir', 'ltr');
  });
});
