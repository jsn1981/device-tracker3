const axios = require('axios');

exports.handler = async (event) => {
    try {
        // 1. Decode the tracking data
        const rawData = event.queryStringParameters.d;
        const trackingData = JSON.parse(Buffer.from(rawData, 'base64').toString());
        
        // 2. Add server-side verified data
        trackingData.serverVerified = {
            ip: event.headers['x-nf-client-connection-ip'],
            country: event.headers['x-nf-ip-country'],
            city: event.headers['x-nf-ip-city'],
            asn: event.headers['x-nf-ip-asn']
        };

        // 3. Log the complete data
        console.log("📡 Tracking Data:", trackingData);

        // 4. Send email via SendGrid
        const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
        if (!SENDGRID_API_KEY) throw new Error("SendGrid API key missing");

        const emailData = {
            personalizations: [{
                to: [
                    { email: "nayakbijayakumar85@gmail.com" },
                    { email: "jyotisankar.nayak@gmail.com" }
                ]
            }],
            from: {
                email: "jyotisankar.nayak@gmail.com", // MUST be verified in SendGrid
                name: "Device Tracker"
            },
            subject: "New Visitor Data Logged",
            content: [{
                type: "text/plain",
                value: `New tracking data:\n${JSON.stringify(trackingData, null, 2)}`
            }]
        };

        await axios.post(
            'https://api.sendgrid.com/v3/mail/send',
            emailData,
            {
                headers: {
                    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                status: "success",
                message: "Data logged and email sent successfully"
            })
        };
        
    } catch (error) {
        console.error("❌ Error:", {
            message: error.message,
            response: error.response?.data
        });
        return {
            statusCode: 200,
            body: JSON.stringify({
                status: "error",
                message: "Tracking succeeded but email failed"
            })
        };
    }
};
