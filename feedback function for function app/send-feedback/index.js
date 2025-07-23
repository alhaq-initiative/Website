const { app } = require('@azure/functions');
const fetch = require('node-fetch');

app.http('send-feedback', {
    methods: ['POST'], // We only need POST for a contact form
    authLevel: 'function',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        // Get the data from the website's form submission
        const { name, email, message } = await request.json();

        // Validate the data
        if (!name || !email || !message) {
            return {
                status: 400,
                body: "Please provide a name, email, and message."
            };
        }

        // Get the Logic App URL from the application settings
        const logicAppUrl = process.env.LOGIC_APP_URL;
        if (!logicAppUrl) {
            return {
                status: 500,
                body: "Logic App URL is not configured."
            };
        }
        
        // Try to send the data to the Logic App
        try {
            await fetch(logicAppUrl, {
                method: 'POST',
                body: JSON.stringify({ name, email, message }),
                headers: { 'Content-Type': 'application/json' }
            });

            return {
                status: 200,
                body: "Feedback submitted successfully."
            };

        } catch (error) {
            context.log.error(error);
            return {
                status: 500,
                body: "There was an error submitting your feedback."
            };
        }
    }
});