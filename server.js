const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PAYPAL_CLIENT = 'YOUR_PAYPAL_CLIENT_ID';
const PAYPAL_SECRET = 'YOUR_PAYPAL_SECRET';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Sandbox URL, change to live URL for production

app.post('/send-payment', async (req, res) => {
    const { recipientEmail, amount, currency } = req.body;

    if (!recipientEmail || !amount || !currency) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    try {
        // Get OAuth token
        const authResponse = await axios({
            url: `${PAYPAL_API}/v1/oauth2/token`,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
                username: PAYPAL_CLIENT,
                password: PAYPAL_SECRET
            },
            data: 'grant_type=client_credentials'
        });

        const accessToken = authResponse.data.access_token;

        // Create payment
        const payoutData = {
            sender_batch_header: {
                email_subject: 'You have a payment'
            },
            items: [{
                recipient_type: 'EMAIL',
                amount: {
                    value: amount,
                    currency: currency
                },
                receiver: recipientEmail,
                note: 'Payment note',
                sender_item_id: 'item-1'
            }]
        };

        const paymentResponse = await axios({
            url: `${PAYPAL_API}/v1/payments/payouts`,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            data: payoutData
        });

        res.json(paymentResponse.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});

