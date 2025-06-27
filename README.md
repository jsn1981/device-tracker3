# device-tracker1
Resolving the SendGrid 401 Unauthorized Error
The error persists because either:

Your new SendGrid API key isn't properly configured

The email sender isn't verified in SendGrid

The environment variable isn't correctly set in Netlify

Step-by-Step Solution
1. Verify Your SendGrid API Key
Log in to SendGrid

Go to Settings → API Keys

Ensure:

You've created a new key (since the old one was revoked)

The key has "Mail Send" permissions

The key is active (not disabled)

2. Update Netlify Environment Variables
Go to your Netlify site → Site settings → Environment variables

Add or update:

text
Key: SENDGRID_API_KEY
Value: sg.your_NEW_api_key_here (the actual key, not placeholder text)
Redeploy your site after updating

3. Verify Your Sender Email
SendGrid requires sender verification:

In SendGrid, go to Settings → Sender Authentication

Verify your sender email (jyotisankar.nayak@gmail.com):

Either through Single Sender Verification, or

Domain Authentication (recommended for production)

4. Update Your track.js Code
javascript
const axios = require('axios');

exports.handler = async (event) => {
    try {
        // ... (your existing tracking data code)

        // Get API key from environment variables
        const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
        if (!SENDGRID_API_KEY) throw new Error("SendGrid API key missing");

        // Send email
        await axios.post(
            'https://api.sendgrid.com/v3/mail/send',
            {
                personalizations: [{ 
                    to: [{ email: "jyotisankar.nayak@gmail.com" }] 
                }],
                from: { 
                    email: "jyotisankar.nayak@gmail.com", // MUST be verified
                    name: "Device Tracker" 
                },
                subject: "New Visitor Data Logged",
                content: [{
                    type: "text/plain",
                    value: `New tracking data:\n${JSON.stringify(trackingData, null, 2)}`
                }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return { statusCode: 200, body: "Success" };
    } catch (error) {
        console.error("SendGrid Error:", {
            message: error.message,
            response: error.response?.data
        });
        return { statusCode: 200, body: "Tracking succeeded (email failed)" };
    }
};
5. Test Locally Before Deploying
Create a .env file in netlify/functions/:

text
SENDGRID_API_KEY=your_actual_key_here
Test using Netlify CLI:

bash
cd netlify/functions
npm install
netlify dev
Alternative Solutions
If SendGrid continues to fail:

Option A: Use Mailgun Instead
Sign up at Mailgun

Replace the axios call with:

javascript
await axios.post(
    `https://api.mailgun.net/v3/YOUR_DOMAIN/messages`,
    `from=Tracker <tracker@yourdomain.com>&to=jyotisankar.nayak@gmail.com&subject=New Visitor Data&text=${encodeURIComponent(JSON.stringify(trackingData))}`,
    {
        auth: {
            username: "api",
            password: process.env.MAILGUN_API_KEY
        }
    }
);
Option B: Use Nodemailer with Gmail
javascript
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD
        }
    });

    await transporter.sendMail({
        from: '"Tracker" <your-email@gmail.com>',
        to: 'jyotisankar.nayak@gmail.com',
        subject: 'New Visitor Data',
        text: JSON.stringify(trackingData, null, 2)
    });
};
(Requires enabling "Less Secure Apps" in Gmail or using an App Password)

Final Checks
✅ API key is correct and has Mail Send permissions

✅ from email is verified in SendGrid

✅ Environment variable is properly set in Netlify

✅ Tested locally with netlify dev

Let me know if you need help with any specific step!

can we add multiple receptant?
Adding Multiple Recipients to SendGrid Emails
Yes, you can easily send tracking data to multiple recipients. Here are several ways to implement this:

Option 1: Multiple Recipients in Single Email (Recommended)
javascript
await axios.post(
    'https://api.sendgrid.com/v3/mail/send',
    {
        personalizations: [{
            to: [
                { email: "jyotisankar.nayak@gmail.com" },
                { email: "second-email@example.com" },
                { email: "third-email@example.com" }
            ],
            // Optional CC/BCC
            cc: [{ email: "cc-recipient@example.com" }],
            bcc: [{ email: "bcc-recipient@example.com" }]
        }],
        from: { email: "verified-sender@yourdomain.com" },
        subject: "New Visitor Data Logged",
        content: [{
            type: "text/plain",
            value: `New tracking data:\n${JSON.stringify(trackingData, null, 2)}`
        }]
    },
    {
        headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
        }
    }
);
Option 2: Separate Emails to Each Recipient
javascript
const recipients = [
    "jyotisankar.nayak@gmail.com",
    "second@example.com",
    "third@example.com"
];

await Promise.all(recipients.map(email => 
    axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
            personalizations: [{ to: [{ email }] }],
            from: { email: "verified-sender@yourdomain.com" },
            subject: "New Visitor Data Logged",
            content: [{
                type: "text/plain",
                value: `New tracking data:\n${JSON.stringify(trackingData, null, 2)}`
            }]
        },
        {
            headers: {
                'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    )
));
Option 3: Dynamic Recipient List from Environment Variable
Set environment variable in Netlify:

text
Key: EMAIL_RECIPIENTS  
Value: email1@example.com,email2@example.com,email3@example.com
Use in code:

javascript
const recipients = process.env.EMAIL_RECIPIENTS.split(',');

await axios.post(
    'https://api.sendgrid.com/v3/mail/send',
    {
        personalizations: [{
            to: recipients.map(email => ({ email }))
        }],
        from: { email: "verified-sender@yourdomain.com" },
        subject: "New Visitor Data Logged",
        content: [{
            type: "text/plain",
            value: `New tracking data:\n${JSON.stringify(trackingData, null, 2)}`
        }]
    },
    // ... rest of config
);
Important Notes
Sender Verification: All from emails must be verified in SendGrid

Rate Limits: SendGrid allows 100 emails/day on free tier

Batching: For >1000 emails, use SendGrid's batch sending

Would you like me to modify any of these approaches for your specific needs?
