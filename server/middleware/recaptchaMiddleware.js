export async function verifyRecaptcha(req, res, next) {
    const { captchaToken } = req.body;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
    if (!captchaToken) {
      return res.status(400).send({ message: 'CAPTCHA token is missing.' });
    }
  
    const body = new URLSearchParams({
      secret: secretKey,
      response: captchaToken,
    });
  
    try {
      const response = await fetch(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        },
      );
  
      const data = await response.json();
  
      if (data.success) {
        return next();             
      }
      return res.status(400).send({ message: 'Failed CAPTCHA verification.' });
    } catch (err) {
      console.error('reCAPTCHA verification error:', err);
      return res.status(500).send({ message: 'Error verifying CAPTCHA.' });
    }
  }
  