import axios from 'axios';

export async function verifyRecaptcha(req, res, next) {
    const { captchaToken } = req.body;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!captchaToken) {
        return res.status(400).send({ message: 'CAPTCHA token is missing.' });
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

    try {
        const { data } = await axios.post(verificationUrl);
        if (data.success) {
            return next(); // CAPTCHA was successful, proceed to the next handler
        } else {
            return res.status(400).send({ message: 'Failed CAPTCHA verification.' });
        }
    } catch (error) {
        console.error("reCAPTCHA verification error:", error);
        return res.status(500).send({ message: 'Error verifying CAPTCHA.' });
    }
}