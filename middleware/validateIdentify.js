const validator = require('validator');

function validateIdentify(req, res, next) {
  const { email, phoneNumber } = req.body || {};
  const hasEmail = email != null && String(email).trim() !== '';
  const hasPhone = phoneNumber != null && String(phoneNumber).trim() !== '';
  if (!hasEmail && !hasPhone) {
    return res.status(400).json({
      error: 'At least one of email or phoneNumber is required'
    });
  }
  if (hasEmail && !validator.isEmail(String(email).trim())) {
    return res.status(400).json({
      error: 'Invalid email format'
    });
  }
  req.body.email = hasEmail ? String(email).trim() : undefined;
  req.body.phoneNumber = hasPhone ? String(phoneNumber).trim() : undefined;
  next();
}

module.exports = { validateIdentify };
