const express = require('express')
const bcrypt = require('bcryptjs')
const { query, withTransaction } = require('../config/db')
const { authenticate, requireAdmin } = require('../middleware/auth')
const { asyncHandler, fail, ok } = require('../utils/http')
const { required } = require('../utils/validators')
const { deleteActivity, deleteComment, deletePost, deleteUser } = require('../utils/cascadeDelete')

const router = express.Router()
const PASSWORD_COL_MAX = 20

router.use(authenticate, requireAdmin)

async function encodePasswordForStorage(plainPassword) {
  const hash = await bcrypt.hash(
    plainPassword,
    Number(process.env.BCRYPT_ROUNDS || 10)
  )
  return hash.length <= PASSWORD_COL_MAX ? hash : plainPassword
}

router.get('/stats', asyncHandler(async (req, res) => {
  const [posts, comments, activities, users] = await Promise.all([
    query("SELECT COUNT(*) AS count FROM ThemePost WHERE AuditState = 'Pending'"),
    query("SELECT COUNT(*) AS count FROM Comment WHERE AuditState = 'Pending'"),
    query("SELECT COUNT(*) AS count FROM MarathonActivity WHERE AuditState = 'Pending'"),
    query("SELECT COUNT(*) AS count FROM user_database WHERE userType <> 'disabled'")
  ])

  return ok(res, {
    pendingPosts: posts[0].count,
    pendingComments: comments[0].count,
    pendingActivities: activities[0].count,
    totalUsers: users[0].count
  })
}))

router.get('/audit/:type', asyncHandler(async (req, res) => {
  const { type } = req.params
  const { status } = req.query
  const statusWhere = status && status !== 'all' ? 'WHERE AuditState = ?' : ''
  const statusParams = status && status !== 'all' ? [status] : []

  if (type === 'post') {
    const rows = await query(
      `SELECT p.ThemePostID AS id, p.Title AS title, p.Content AS content,
              p.authorID AS author, p.PublishTime AS time, p.AuditState AS status,
              p.ActivityID AS activityId, a.Title AS activityTitle
       FROM ThemePost p
       LEFT JOIN MarathonActivity a ON a.ActivityID = p.ActivityID
       ${statusWhere.replace('AuditState', 'p.AuditState')}
       ORDER BY p.PublishTime DESC`,
      statusParams
    )
    return ok(res, rows)
  }

  if (type === 'comment') {
    const rows = await query(
      `SELECT c.CommentID AS id, c.Content AS content, c.authorID AS author,
              c.ThemePostID AS postId, p.Title AS postTitle, p.authorID AS postAuthor,
              c.PublishTime AS time, c.AuditState AS status
       FROM Comment c
       LEFT JOIN ThemePost p ON p.ThemePostID = c.ThemePostID
       ${statusWhere.replace('AuditState', 'c.AuditState')}
       ORDER BY c.PublishTime DESC`,
      statusParams
    )
    return ok(res, rows)
  }

  if (type === 'activity') {
    const rows = await query(
      `SELECT ActivityID AS id, Title AS name, Content AS detail,
              UserID AS submitter, PublishTime AS time, AuditState AS status,
              ActivityState AS activityState, ActivityType AS type,
              activityLocation AS address, activityTime AS date,
              \`start-time\` AS startTime, \`end-time\` AS endTime,
              contactPerson, contactPhone, \`signup-endtime\` AS deadline,
              num AS count
       FROM MarathonActivity
       ${statusWhere}
       ORDER BY PublishTime DESC`,
      statusParams
    )
    return ok(res, rows)
  }

  if (type === 'user') {
    const rows = await query(
      `SELECT u.UserID AS id, u.UserID AS userID, u.userPassword, u.userType,
              o.username, o.realName AS name, o.phone, o.email, o.gender
       FROM user_database u
       LEFT JOIN OrdinaryUser o ON o.userID = u.UserID
       ORDER BY u.UserID ASC`
    )
    return ok(res, rows)
  }

  return fail(res, 400, 'unknown audit type')
}))

router.delete('/audit/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params

  if (type === 'post') {
    await withTransaction(async (connection) => {
      await deletePost(connection, id)
    })
    return ok(res, null, 'post deleted')
  }

  if (type === 'comment') {
    await withTransaction(async (connection) => {
      await deleteComment(connection, id)
    })
    return ok(res, null, 'comment deleted')
  }

  if (type === 'activity') {
    await withTransaction(async (connection) => {
      await deleteActivity(connection, id)
    })
    return ok(res, null, 'activity deleted')
  }

  return fail(res, 400, 'unknown audit type')
}))

router.put('/audit/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params
  const { action } = req.body
  const auditState = action === 'reject' ? 'Rejected' : 'Approved'

  if (type === 'post') {
    await query('UPDATE ThemePost SET AuditState = ? WHERE ThemePostID = ?', [auditState, id])
    return ok(res, null, 'post audit updated')
  }

  if (type === 'comment') {
    await query('UPDATE Comment SET AuditState = ? WHERE CommentID = ?', [auditState, id])
    return ok(res, null, 'comment audit updated')
  }

  if (type === 'activity') {
    const activityState = auditState === 'Approved' ? '招募中' : '待审核'
    await query(
      `UPDATE MarathonActivity
       SET AuditState = ?, ActivityState = ?, AuditTime = NOW()
       WHERE ActivityID = ?`,
      [auditState, activityState, id]
    )
    return ok(res, null, 'activity audit updated')
  }

  return fail(res, 400, 'unknown audit type')
}))

router.put('/users/:id/status', asyncHandler(async (req, res) => {
  const { userType } = req.body
  if (!['ordinary', 'admin', 'disabled'].includes(userType)) {
    return fail(res, 400, 'invalid user type')
  }

  await query('UPDATE user_database SET userType = ? WHERE UserID = ?', [userType, req.params.id])
  return ok(res, null, 'user status updated')
}))

router.get('/users', asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1)
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100)
  const offset = (page - 1) * limit
  const keyword = (req.query.keyword || '').trim()

  const where = []
  const params = []
  if (keyword) {
    where.push('(u.UserID LIKE ? OR o.username LIKE ? OR o.phone LIKE ? OR o.email LIKE ?)')
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const totalRows = await query(
    `SELECT COUNT(*) AS total
     FROM user_database u
     LEFT JOIN OrdinaryUser o ON o.userID = u.UserID
     ${whereSql}`,
    params
  )

  const users = await query(
    `SELECT u.UserID AS userID, u.userPassword, u.userType,
            o.username, o.phone, o.email, o.realName, o.gender, o.birthDate,
            o.school, o.education
     FROM user_database u
     LEFT JOIN OrdinaryUser o ON o.userID = u.UserID
     ${whereSql}
     ORDER BY u.UserID ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )

  const total = totalRows[0]?.total || 0
  return res.json({
    success: true,
    message: 'ok',
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1)
    }
  })
}))

router.get('/user/:id', asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT u.UserID AS userID, u.userType, o.username, o.phone, o.email, o.realName,
            o.gender, o.birthDate, o.school, o.education
     FROM user_database u
     LEFT JOIN OrdinaryUser o ON o.userID = u.UserID
     WHERE u.UserID = ?
     LIMIT 1`,
    [req.params.id]
  )
  if (!rows.length) return fail(res, 404, 'user not found')
  return ok(res, rows[0])
}))

router.post('/user', asyncHandler(async (req, res) => {
  const {
    userID,
    username,
    phone,
    email,
    realName,
    gender,
    birthDate,
    school,
    education,
    userType = 'ordinary',
    password
  } = req.body

  if (!required(userID) || !required(email) || !required(password)) {
    return fail(res, 400, 'userID, email and password are required')
  }
  if (!['ordinary', 'admin', 'disabled'].includes(userType)) {
    return fail(res, 400, 'invalid user type')
  }

  const exists = await query(
    `SELECT u.UserID
     FROM user_database u
     LEFT JOIN OrdinaryUser o ON o.userID = u.UserID
     WHERE u.UserID = ? OR o.email = ?
     LIMIT 1`,
    [userID, email]
  )
  if (exists.length) return fail(res, 409, 'user id or email already exists')

  const passwordValue = await encodePasswordForStorage(password)

  await query(
    'INSERT INTO user_database (UserID, userPassword, userType) VALUES (?, ?, ?)',
    [userID, passwordValue, userType]
  )
  await query(
    `INSERT INTO OrdinaryUser
     (userID, username, phone, email, realName, gender, birthDate, school, education)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userID,
      username || userID,
      phone || null,
      email,
      realName || null,
      gender || null,
      birthDate || null,
      school || null,
      education || null
    ]
  )

  return ok(res, { userID }, 'user created')
}))

router.put('/user/:id', asyncHandler(async (req, res) => {
  const {
    username,
    phone,
    email,
    realName,
    gender,
    birthDate,
    school,
    education,
    userType
  } = req.body

  const exists = await query('SELECT UserID FROM user_database WHERE UserID = ? LIMIT 1', [req.params.id])
  if (!exists.length) return fail(res, 404, 'user not found')

  if (email) {
    const emailRows = await query(
      'SELECT userID FROM OrdinaryUser WHERE email = ? AND userID <> ? LIMIT 1',
      [email, req.params.id]
    )
    if (emailRows.length) return fail(res, 409, 'email already in use')
  }

  if (userType !== undefined) {
    if (!['ordinary', 'admin', 'disabled'].includes(userType)) {
      return fail(res, 400, 'invalid user type')
    }
    await query('UPDATE user_database SET userType = ? WHERE UserID = ?', [userType, req.params.id])
  }

  await query(
    `UPDATE OrdinaryUser
     SET username = COALESCE(?, username),
         phone = COALESCE(?, phone),
         email = COALESCE(?, email),
         realName = COALESCE(?, realName),
         gender = COALESCE(?, gender),
         birthDate = COALESCE(?, birthDate),
         school = COALESCE(?, school),
         education = COALESCE(?, education)
     WHERE userID = ?`,
    [
      username ?? null,
      phone ?? null,
      email ?? null,
      realName ?? null,
      gender ?? null,
      birthDate ?? null,
      school ?? null,
      education ?? null,
      req.params.id
    ]
  )

  return ok(res, null, 'user updated')
}))

router.delete('/user/:id', asyncHandler(async (req, res) => {
  const rows = await query('SELECT UserID FROM user_database WHERE UserID = ? LIMIT 1', [req.params.id])
  if (!rows.length) return fail(res, 404, 'user not found')

  await withTransaction(async (connection) => {
    await deleteUser(connection, req.params.id)
  })
  return ok(res, null, 'user deleted')
}))

module.exports = router
