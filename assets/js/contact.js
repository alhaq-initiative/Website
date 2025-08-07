/* Contact Page Specific JavaScript */

// Contact form submission handler
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Update status
    formStatus.textContent = 'Sending...';
    formStatus.style.color = 'gray';
    
    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Logic App URL for form submission
    const logicAppUrl = 'https://prod-10.ukwest.logic.azure.com/workflows/2a3b358e4c614e2aaeb81efadcf9fa42/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=wvDTY-sb321VZ3q7R88UL5zGCYkJMBpU-X_MfNnnEqg';
    
    try {
      const response = await fetch(logicAppUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ name, email, message }),
      });
      
      if (response.ok) {
        formStatus.textContent = 'Feedback submitted successfully.';
        formStatus.style.color = 'green';
        form.reset();
      } else {
        formStatus.textContent = 'Submission failed. Please check your connection and try again.';
        formStatus.style.color = 'red';
      }
    } catch (error) {
      console.error('Error:', error);
      formStatus.textContent = 'An unexpected error occurred. Please try again later.';
      formStatus.style.color = 'red';
    }
  });
});