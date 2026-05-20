const express = require('express')
const bcrypt = require('bcryptjs')
const { query, withTransaction } = require('../config/db')
const { signToken, authenticate } = require('../middleware/auth')
const { asyncHandler, fail, ok } = require('../utils/http')
const { required, pick } = require('../utils/validators')

const router = express.Router()

function normalizeUser(row) {
  if (!row) return null
  return {
    userId: row.UserID || row.userID || row.adminID,
    username: row.username || row.email || row.UserID || row.adminID,
    userType: row.userType || 'ordinary',
    phone: row.phone || null,
    email: row.email || null,
    realName: row.realName || row.name || null,
    gender: row.gender || null,
    birthDate: row.birthDate || null,
    school: row.school || null,
    education: row.education || null
  }
}

async function findLoginUser(account, role) {
  if (role === 'admin') {
    const rows = await query(
      `SELECT adminID AS UserID, adminPassword AS userPassword, 'admin' AS userType
       FROM Administrator
       WHERE adminID = ?
       LIMIT 1`,
      [account]
    )
    return rows[0]
  }

  const rows = await query(
    `SELECT u.UserID, u.userPassword, u.userType, o.username, o.phone, o.email,
            o.realName, o.gender, o.birthDate, o.school, o.education
     FROM OrdinaryUser o
     JOIN user_database u ON u.UserID = o.userID
     WHERE o.email = ?
     LIMIT 1`,
    [account]
  )
  return rows[0]
}

async function getNextOrdinaryUserId(connection) {
  const [rows] = await connection.execute(
    `SELECT COALESCE(MAX(CAST(userID AS UNSIGNED)), 0) + 1 AS nextUserId
     FROM OrdinaryUser`
  )
  return String(rows[0].nextUserId)
}

router.post('/register', asyncHandler(async (req, res) => {
  const {
    email,
    password,
    phone,
    username,
    realName,
    gender,
    birthDate,
    school,
    education
  } = req.body

  if (!required(email) || !required(password)) {
    return fail(res, 400, '邮箱和密码不能为空')
  }

  const exists = await query(
    'SELECT userID FROM OrdinaryUser WHERE email = ? LIMIT 1',
    [email]
  )
  if (exists.length) {
    return fail(res, 409, '邮箱已注册')
  }

  const passwordHash = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_ROUNDS || 10)
  )

  const userId = await withTransaction(async (connection) => {
    const nextUserId = await getNextOrdinaryUserId(connection)
    const displayName = username || email.split('@')[0]

    await connection.execute(
      'INSERT INTO user_database (UserID, userPassword, userType) VALUES (?, ?, ?)',
      [nextUserId, passwordHash, 'ordinary']
    )
    await connection.execute(
      `INSERT INTO OrdinaryUser
       (userID, username, phone, email, realName, gender, birthDate, school, education)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextUserId,
        displayName,
        phone || null,
        email,
        realName || null,
        gender || null,
        birthDate || null,
        school || null,
        education || null
      ]
    )

    return nextUserId
  })

  return ok(res, { userId, email }, '注册成功')
}))

router.post('/login', asyncHandler(async (req, res) => {
  const { account, email, username, password, role = 'user' } = req.body
  const loginAccount = account || email || username

  if (!required(loginAccount) || !required(password)) {
    return fail(res, 400, role === 'admin' ? '账号和密码不能为空' : '邮箱和密码不能为空')
  }

  const row = await findLoginUser(loginAccount, role)
  if (!row) {
    return fail(res, 401, role === 'admin' ? '账号或密码错误' : '邮箱或密码错误')
  }

  if (row.userType === 'disabled') {
    return fail(res, 403, '账号已被禁用')
  }

  const matched = await bcrypt.compare(password, row.userPassword)
  const legacyMatched = password === row.userPassword
  if (!matched && !legacyMatched) {
    return fail(res, 401, role === 'admin' ? '账号或密码错误' : '邮箱或密码错误')
  }

  const user = normalizeUser(row)
  const token = signToken(user)
  return ok(res, { token, user }, '登录成功')
}))

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT u.UserID, u.userType, o.username, o.phone, o.email, o.realName,
            o.gender, o.birthDate, o.school, o.education
     FROM user_database u
     LEFT JOIN OrdinaryUser o ON o.userID = u.UserID
     WHERE u.UserID = ?
     LIMIT 1`,
    [req.user.userId]
  )
  return ok(res, normalizeUser(rows[0]))
}))

router.put('/me', authenticate, asyncHandler(async (req, res) => {
  const data = pick(req.body, [
    'username',
    'phone',
    'email',
    'realName',
    'gender',
    'birthDate',
    'school',
    'education'
  ])

  if (data.email) {
    const exists = await query(
      'SELECT userID FROM OrdinaryUser WHERE email = ? AND userID <> ? LIMIT 1',
      [data.email, req.user.userId]
    )
    if (exists.length) return fail(res, 409, '邮箱已被使用')
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
      data.username ?? null,
      data.phone ?? null,
      data.email ?? null,
      data.realName ?? null,
      data.gender ?? null,
      data.birthDate ?? null,
      data.school ?? null,
      data.education ?? null,
      req.user.userId
    ]
  )

  return ok(res, null, '保存成功')
}))

router.put('/password', authenticate, asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!required(oldPassword) || !required(newPassword)) {
    return fail(res, 400, '原密码和新密码不能为空')
  }

  const rows = await query(
    'SELECT userPassword FROM user_database WHERE UserID = ? LIMIT 1',
    [req.user.userId]
  )
  if (!rows.length) return fail(res, 404, '用户不存在')

  const matched = await bcrypt.compare(oldPassword, rows[0].userPassword)
  const legacyMatched = oldPassword === rows[0].userPassword
  if (!matched && !legacyMatched) {
    return fail(res, 400, '原密码错误')
  }

  const passwordHash = await bcrypt.hash(
    newPassword,
    Number(process.env.BCRYPT_ROUNDS || 10)
  )
  await query(
    'UPDATE user_database SET userPassword = ? WHERE UserID = ?',
    [passwordHash, req.user.userId]
  )
  return ok(res, null, '密码已修改')
}))

router.delete('/me', authenticate, asyncHandler(async (req, res) => {
  await query(
    "UPDATE user_database SET userType = 'disabled' WHERE UserID = ?",
    [req.user.userId]
  )
  return ok(res, null, '账号已注销')
}))

module.exports = router
