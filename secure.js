const { User } = require('./modules/users/users.controllers');

const Secure = async (is_admin, req) => {
  if (!is_admin) return true;

  const token = req.query.access_token || req.headers.access_token;
  if (!token) throw Error('No access token was sent');

  try {
    const decoded = await User.validateToken(req.app.db, token);
    return (decoded.is_admin == is_admin)
  } catch (e) {
    return false;
  }
};

module.exports = Secure;