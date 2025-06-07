import { Router } from 'express';
import stripe from 'stripe';
import { query } from '../utils/db.js';

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
const router = Router();

router.post('/', async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Stripe webhook signature error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.client_reference_id;

        const premiumExpiryDate = new Date();
        premiumExpiryDate.setFullYear(premiumExpiryDate.getFullYear() + 1);

        try {
            const updateUserSql = 'UPDATE users SET premium_status = TRUE, premium_expiry_date = $1 WHERE id = $2';
            await query(updateUserSql, [premiumExpiryDate, userId]);
            console.log(`User ${userId} has been granted premium access.`);
        } catch (error) {
            console.error('Failed to update user to premium:', error);
            return res.status(500).send({ message: 'Failed to update user premium status.' });
        }
    }

    res.status(200).send();
});

export default router;