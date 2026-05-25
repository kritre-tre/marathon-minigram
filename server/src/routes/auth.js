const express = require('express')
const bcrypt = require('bcryptjs')
const { query, withTransaction } = require('../config/db')
const { signToken, authenticate } = require('../middleware/auth')
const { asyncHandler, fail, ok } = require('../utils/http')
const { required, pick } = require('../utils/validators')
const { deleteUser } = require('../utils/cascadeDelete')

const router = express.Router()
const PASSWORD_COL_MAX = 20

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
     FROM user_database u
     LEFT JOIN OrdinaryUser o ON o.userID = u.UserID
     WHERE u.UserID = ?
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

function isBcryptHash(value) {
  return /^\$2[aby]\$\d{2}\$/.test(String(value || ''))
}

async function encodePasswordForStorage(plainPassword) {
  const hash = await bcrypt.hash(
    plainPassword,
    Number(process.env.BCRYPT_ROUNDS || 10)
  )
  return hash.length <= PASSWORD_COL_MAX ? hash : plainPassword
}

async function verifyPassword(plainPassword, storedPassword) {
  if (plainPassword === storedPassword) return true
  if (!isBcryptHash(storedPassword)) return false
  return bcrypt.compare(plainPassword, storedPassword)
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
    return fail(res, 400, 'email and password are required')
  }

  const exists = await query(
    'SELECT userID FROM OrdinaryUser WHERE email = ? LIMIT 1',
    [email]
  )
  if (exists.length) {
    return fail(res, 409, 'email already exists')
  }

  const passwordValue = await encodePasswordForStorage(password)

  const userId = await withTransaction(async (connection) => {
    const nextUserId = await getNextOrdinaryUserId(connection)
    const displayName = username || email.split('@')[0]

    await connection.execute(
      'INSERT INTO user_database (UserID, userPassword, userType) VALUES (?, ?, ?)',
      [nextUserId, passwordValue, 'ordinary']
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

  return ok(res, { userId, email }, 'register success')
}))

router.post('/login', asyncHandler(async (req, res) => {
  const { account, email, username, password, role = 'user' } = req.body
  const loginAccount = account || email || username

  if (!required(loginAccount) || !required(password)) {
    return fail(res, 400, role === 'admin' ? 'admin account and password are required' : 'user id and password are required')
  }

  const row = await findLoginUser(loginAccount, role)
  if (!row) {
    return fail(res, 401, role === 'admin' ? 'invalid admin credentials' : 'invalid credentials')
  }

  if (row.userType === 'disabled') {
    return fail(res, 403, 'account disabled')
  }

  const matched = await verifyPassword(password, row.userPassword)
  if (!matched) {
    return fail(res, 401, role === 'admin' ? 'invalid admin credentials' : 'invalid credentials')
  }

  const user = normalizeUser(row)
  const token = signToken(user)
  return ok(res, { token, user }, 'login success')
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
    if (exists.length) return fail(res, 409, 'email already in use')
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

  return ok(res, null, 'profile updated')
}))

router.put('/password', authenticate, asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!required(oldPassword) || !required(newPassword)) {
    return fail(res, 400, 'oldPassword and newPassword are required')
  }

  const rows = await query(
    'SELECT userPassword FROM user_database WHERE UserID = ? LIMIT 1',
    [req.user.userId]
  )
  if (!rows.length) return fail(res, 404, 'user not found')

  const matched = await verifyPassword(oldPassword, rows[0].userPassword)
  if (!matched) {
    return fail(res, 400, 'old password incorrect')
  }

  const passwordValue = await encodePasswordForStorage(newPassword)
  await query(
    'UPDATE user_database SET userPassword = ? WHERE UserID = ?',
    [passwordValue, req.user.userId]
  )
  return ok(res, null, 'password updated')
}))

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body
  if (!required(email) || !required(newPassword)) {
    return fail(res, 400, 'email and newPassword are required')
  }

  const users = await query(
    `SELECT userID
     FROM OrdinaryUser
     WHERE email = ?
     LIMIT 1`,
    [email]
  )
  if (!users.length) return fail(res, 404, 'user not found')

  const passwordValue = await encodePasswordForStorage(newPassword)

  await query(
    'UPDATE user_database SET userPassword = ? WHERE UserID = ?',
    [passwordValue, users[0].userID]
  )
  return ok(res, null, 'password reset success')
}))

router.delete('/me', authenticate, asyncHandler(async (req, res) => {
  await withTransaction(async (connection) => {
    await deleteUser(connection, req.user.userId)
  })
  return ok(res, null, 'account deleted')
}))

module.exports = router
