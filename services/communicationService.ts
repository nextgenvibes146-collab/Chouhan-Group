
// This service mimics the behavior of backend APIs like SendGrid (Email), Twilio (SMS), or Exotel (Cloud Telephony).

interface ServiceResponse {
    success: boolean;
    message: string;
    timestamp: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const communicationService = {
    /**
     * Simulates sending an email via an SMTP provider (e.g., SendGrid, AWS SES)
     */
    sendEmail: async (to: string, subject: string, body: string): Promise<ServiceResponse> => {
        console.log(`[Mock API] Sending Email to ${to}...`);
        await delay(1500); // Simulate network latency
        
        // Simulate random success/failure (95% success rate)
        const isSuccess = Math.random() > 0.05;

        if (isSuccess) {
            return {
                success: true,
                message: 'Email sent successfully via Secure Relay.',
                timestamp: new Date().toISOString()
            };
        } else {
            throw new Error('SMTP Error: Connection timed out.');
        }
    },

    /**
     * Simulates sending an SMS via a gateway (e.g., Twilio, Msg91)
     */
    sendSMS: async (to: string, message: string): Promise<ServiceResponse> => {
        console.log(`[Mock API] Sending SMS to ${to}...`);
        await delay(1000);

        return {
            success: true,
            message: 'Message queued for delivery.',
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Simulates initiating a Click-to-Call request
     */
    initiateCall: async (customerNumber: string, agentNumber: string): Promise<ServiceResponse> => {
        console.log(`[Mock API] Bridging call between ${agentNumber} and ${customerNumber}...`);
        await delay(800);

        return {
            success: true,
            message: 'Call bridged successfully. Ringing...',
            timestamp: new Date().toISOString()
        };
    }
};
