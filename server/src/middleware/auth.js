const jwt = require('jsonwebtoken')
const { fail } = require('../utils/http')

function signToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      userType: user.userType
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return fail(res, 401, '请先登录')
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    return next()
  } catch (error) {
    return fail(res, 401, '登录状态已失效')
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.userType !== 'admin') {
    return fail(res, 403, '需要管理员权限')
  }
  return next()
}

module.exports = {
  signToken,
  authenticate,
  requireAdmin
}

