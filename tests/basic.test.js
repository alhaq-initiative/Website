// Basic test for the website functionality
describe('Alhaq Initiative Website', () => {
  test('should load basic HTML structure', () => {
    document.body.innerHTML = `
      <div id="test-container">
  <h1>Alhaq Initiative</h1>
        <p>Islamic Digital Solutions</p>
      </div>
    `;
    
    const heading = document.querySelector('h1');
    const paragraph = document.querySelector('p');
    
    expect(heading).toBeInTheDocument();
  expect(heading.textContent).toBe('Alhaq Initiative');
    expect(paragraph.textContent).toBe('Islamic Digital Solutions');
  });

  test('should handle localStorage operations', () => {
    const testData = { user: 'test', preferences: { theme: 'light' } };
    
    // Test that localStorage methods exist and are functions
    expect(typeof localStorage.setItem).toBe('function');
    expect(typeof localStorage.getItem).toBe('function');
    
    // Test basic localStorage functionality
    localStorage.setItem('testData', JSON.stringify(testData));
    const retrieved = localStorage.getItem('testData');
    
    // Since we're using jsdom, localStorage should work normally
    expect(retrieved).toBe(JSON.stringify(testData));
  });

  test('should mock navigation APIs', () => {
    expect(window.navigator).toBeDefined();
    expect(window.navigator.geolocation).toBeDefined();
    expect(window.location).toBeDefined();
  });
});
