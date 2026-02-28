const { identify } = require('../services/identifyService');

async function identifyHandler(req, res, next) {
  try {
    const { email, phoneNumber } = req.body;
    const result = await identify(email, phoneNumber);
    res.status(200).json({
      contact: result
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { identifyHandler };
