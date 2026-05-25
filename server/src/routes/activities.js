const express = require('express')
const { query, withTransaction } = require('../config/db')
const { authenticate } = require('../middleware/auth')
const { asyncHandler, fail, ok } = require('../utils/http')
const { required, toMysqlDateTime } = require('../utils/validators')
const { deleteActivity } = require('../utils/cascadeDelete')

const router = express.Router()

const TYPE_LABEL_MAP = {
  full_marathon: '全程马拉松',
  half_marathon: '半程马拉松',
  mini_marathon: '迷你马拉松',
  relay_marathon: '接力马拉松'
}

function normalizeActivityType(raw) {
  const value = String(raw || '').trim().toLowerCase()
  if (!value) return 'full_marathon'
  if (['full_marathon', 'full', 'fullmarathon', '全程马拉松'].includes(value)) return 'full_marathon'
  if (['half_marathon', 'half', 'halfmarathon', '半程马拉松'].includes(value)) return 'half_marathon'
  if (['mini_marathon', 'mini', 'minimarathon', '迷你马拉松'].includes(value)) return 'mini_marathon'
  if (['relay_marathon', 'relay', 'relaymarathon', '接力马拉松'].includes(value)) return 'relay_marathon'
  return value
}

function activityTypeLabel(type) {
  return TYPE_LABEL_MAP[normalizeActivityType(type)] || '未知类型'
}

function detectMime(buffer) {
  if (!buffer || !buffer.length) return 'application/octet-stream'
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png'
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer.length >= 6) {
    const sig = buffer.subarray(0, 6).toString('ascii')
    if (sig === 'GIF87a' || sig === 'GIF89a') return 'image/gif'
  }
  if (buffer.length >= 12) {
    const riff = buffer.subarray(0, 4).toString('ascii')
    const webp = buffer.subarray(8, 12).toString('ascii')
    if (riff === 'RIFF' && webp === 'WEBP') return 'image/webp'
  }
  return 'application/octet-stream'
}

function toCoverBase64(buffer) {
  if (!buffer || !buffer.length) return ''
  const mime = detectMime(buffer)
  return `data:${mime};base64,${buffer.toString('base64')}`
}

function normalizeActivity(row) {
  const type = normalizeActivityType(row.ActivityType)
  return {
    id: row.ActivityID,
    userId: row.UserID,
    name: row.Title,
    title: row.Title,
    content: row.Content,
    detail: row.Content,
    status: row.ActivityState,
    auditState: row.AuditState,
    publishTime: row.PublishTime,
    auditTime: row.AuditTime,
    type,
    typeText: activityTypeLabel(type),
    city: row.city || null,
    address: row.activityLocation,
    startTime: row.startTime,
    endTime: row.endTime,
    count: row.num,
    date: row.activityTime,
    deadline: row.signupEndTime,
    contactPerson: row.contactPerson,
    contactPhone: row.contactPhone,
    hasCover: false,
    coverBase64: ''
  }
}

async function getOwnerKeys(userId) {
  const rows = await query(
    `SELECT u.UserID, o.username, o.email
     FROM user_database u
     LEFT JOIN OrdinaryUser o ON o.userID = u.UserID
     WHERE u.UserID = ?
     LIMIT 1`,
    [userId]
  )
  const keys = new Set([String(userId)])
  if (rows.length) {
    if (rows[0].UserID) keys.add(String(rows[0].UserID))
    if (rows[0].username) keys.add(String(rows[0].username))
    if (rows[0].email) keys.add(String(rows[0].email))
  }
  return Array.from(keys).filter(Boolean)
}

function isOwner(ownerId, ownerKeys) {
  return ownerKeys.includes(String(ownerId))
}

router.get('/', asyncHandler(async (req, res) => {
  const { keyword, type, status, mine } = req.query
  const filters = [
    "UPPER(AuditState) = 'APPROVED'",
    "ActivityState <> '待审核'",
    "ActivityState <> '已拒绝'"
  ]
  const params = []

  if (keyword) {
    filters.push('(Title LIKE ? OR activityLocation LIKE ? OR Content LIKE ?)')
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
  }
  if (type) {
    filters.push('LOWER(ActivityType) = ?')
    params.push(normalizeActivityType(type))
  }
  if (status) {
    filters.push('ActivityState = ?')
    params.push(status)
  }
  if (mine && req.headers.authorization) {
    return fail(res, 400, '请使用 /api/activities/my 查询我的赛事')
  }

  const where = `WHERE ${filters.join(' AND ')}`
  const rows = await query(
    `SELECT ActivityID, UserID, Title, Content, ActivityState, AuditState,
            PublishTime, AuditTime, ActivityType, activityLocation,
            \`start-time\` AS startTime, \`end-time\` AS endTime, num,
            activityTime, contactPerson, contactPhone,
            \`signup-endtime\` AS signupEndTime
     FROM MarathonActivity
     ${where}
     ORDER BY PublishTime DESC, ActivityID DESC`,
    params
  )

  return ok(res, rows.map(normalizeActivity))
}))

router.get('/my', authenticate, asyncHandler(async (req, res) => {
  const ownerKeys = await getOwnerKeys(req.user.userId)
  const placeholders = ownerKeys.map(() => '?').join(', ')
  const rows = await query(
    `SELECT ActivityID, UserID, Title, Content, ActivityState, AuditState,
            PublishTime, AuditTime, ActivityType, activityLocation,
            \`start-time\` AS startTime, \`end-time\` AS endTime, num,
            activityTime, contactPerson, contactPhone,
            \`signup-endtime\` AS signupEndTime
     FROM MarathonActivity
     WHERE UserID IN (${placeholders})
     ORDER BY PublishTime DESC, ActivityID DESC`,
    ownerKeys
  )
  return ok(res, rows.map(normalizeActivity))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT ActivityID, UserID, Title, Content, ActivityState, AuditState,
            PublishTime, AuditTime, ActivityType, activityLocation,
            \`start-time\` AS startTime, \`end-time\` AS endTime, num,
            activityTime, contactPerson, contactPhone,
            \`signup-endtime\` AS signupEndTime
     FROM MarathonActivity
     WHERE ActivityID = ? AND AuditState = 'Approved'
     LIMIT 1`,
    [req.params.id]
  )
  if (!rows.length) return fail(res, 404, '赛事不存在')
  return ok(res, normalizeActivity(rows[0]))
}))

router.post('/', authenticate, asyncHandler(async (req, res) => {
  const {
    title, name, content, detail, type, activityType, address, activityLocation,
    startTime, endTime, count, num, activityTime, date, signupEndTime, deadline,
    contactPerson, contactPhone
  } = req.body

  const finalTitle = title || name
  const finalType = normalizeActivityType(activityType || type)
  const finalLocation = activityLocation || address
  const finalCount = num ?? count
  const finalActivityTime = toMysqlDateTime(activityTime || date)
  const finalSignupEndTime = signupEndTime || deadline || null

  if (!required(finalTitle) || !required(finalType) || !required(finalLocation) || !required(finalActivityTime)) {
    return fail(res, 400, '赛事名称、类型、地点和活动时间不能为空')
  }

  const result = await query(
    `INSERT INTO MarathonActivity
     (UserID, Title, Content, ActivityState, AuditState, PublishTime, ActivityType,
      activityLocation, \`start-time\`, \`end-time\`, num, activityTime,
      contactPerson, contactPhone, \`signup-endtime\`)
     VALUES (?, ?, ?, '待审核', 'Pending', NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.userId, finalTitle, content || detail || null, finalType, finalLocation,
      startTime || null, endTime || null, Number(finalCount || 0), finalActivityTime,
      contactPerson || null, contactPhone || null, finalSignupEndTime
    ]
  )

  return ok(res, { id: result.insertId }, '赛事已提交审核')
}))

router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const ownerKeys = await getOwnerKeys(req.user.userId)
  const rows = await query('SELECT UserID FROM MarathonActivity WHERE ActivityID = ? LIMIT 1', [req.params.id])
  if (!rows.length) return fail(res, 404, '赛事不存在')
  if (!isOwner(rows[0].UserID, ownerKeys) && req.user.userType !== 'admin') {
    return fail(res, 403, '只能修改自己发布的赛事')
  }

  const {
    title, name, content, detail, activityState, type, activityType, address, activityLocation,
    startTime, endTime, count, num, activityTime, date, signupEndTime, deadline,
    contactPerson, contactPhone
  } = req.body
  const finalTypeRaw = activityType || type
  const finalType = required(finalTypeRaw) ? normalizeActivityType(finalTypeRaw) : null

  await query(
    `UPDATE MarathonActivity
     SET Title = COALESCE(?, Title),
         Content = COALESCE(?, Content),
         ActivityState = COALESCE(?, ActivityState),
         AuditState = 'Pending',
         ActivityType = COALESCE(?, ActivityType),
         activityLocation = COALESCE(?, activityLocation),
         \`start-time\` = COALESCE(?, \`start-time\`),
         \`end-time\` = COALESCE(?, \`end-time\`),
         num = COALESCE(?, num),
         activityTime = COALESCE(?, activityTime),
         contactPerson = COALESCE(?, contactPerson),
         contactPhone = COALESCE(?, contactPhone),
         \`signup-endtime\` = COALESCE(?, \`signup-endtime\`)
     WHERE ActivityID = ?`,
    [
      title || name || null,
      content || detail || null,
      activityState || null,
      finalType,
      activityLocation || address || null,
      startTime || null,
      endTime || null,
      num ?? count ?? null,
      toMysqlDateTime(activityTime || date) || null,
      contactPerson || null,
      contactPhone || null,
      signupEndTime || deadline || null,
      req.params.id
    ]
  )
  return ok(res, null, '赛事已更新并重新提交审核')
}))

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const ownerKeys = await getOwnerKeys(req.user.userId)
  const rows = await query('SELECT UserID FROM MarathonActivity WHERE ActivityID = ? LIMIT 1', [req.params.id])
  if (!rows.length) return fail(res, 404, '赛事不存在')
  if (!isOwner(rows[0].UserID, ownerKeys) && req.user.userType !== 'admin') {
    return fail(res, 403, '只能删除自己发布的赛事')
  }
  await withTransaction(async (connection) => {
    await deleteActivity(connection, req.params.id)
  })
  return ok(res, null, '赛事已删除')
}))

module.exports = router
