function ok(res, data = null, message = 'ok') {
  return res.json({ success: true, message, data })
}

function fail(res, status, message, details) {
  return res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {})
  })
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

module.exports = {
  ok,
  fail,
  asyncHandler
}

