const express = require('express')
const { query } = require('../config/db')
const { authenticate } = require('../middleware/auth')
const { asyncHandler, fail, ok } = require('../utils/http')
const { required, toMysqlDateTime } = require('../utils/validators')

const router = express.Router()

function normalizeActivity(row) {
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
    type: row.ActivityType,
    city: row.city || null,
    address: row.activityLocation,
    startTime: row.startTime,
    endTime: row.endTime,
    count: row.num,
    date: row.activityTime,
    deadline: row.signupEndTime,
    contactPerson: row.contactPerson,
    contactPhone: row.contactPhone
  }
}

router.get('/', asyncHandler(async (req, res) => {
  const { keyword, type, status, auditState = 'Approved', mine } = req.query
  const filters = []
  const params = []

  if (keyword) {
    filters.push('(Title LIKE ? OR activityLocation LIKE ? OR Content LIKE ?)')
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
  }
  if (type) {
    filters.push('ActivityType = ?')
    params.push(type)
  }
  if (status) {
    filters.push('ActivityState = ?')
    params.push(status)
  }
  if (auditState) {
    filters.push('AuditState = ?')
    params.push(auditState)
  }
  if (mine && req.headers.authorization) {
    return fail(res, 400, '查询我的赛事请使用 /api/activities/my')
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
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
  const rows = await query(
    `SELECT ActivityID, UserID, Title, Content, ActivityState, AuditState,
            PublishTime, AuditTime, ActivityType, activityLocation,
            \`start-time\` AS startTime, \`end-time\` AS endTime, num,
            activityTime, contactPerson, contactPhone,
            \`signup-endtime\` AS signupEndTime
     FROM MarathonActivity
     WHERE UserID = ?
     ORDER BY PublishTime DESC, ActivityID DESC`,
    [req.user.userId]
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
     WHERE ActivityID = ?
     LIMIT 1`,
    [req.params.id]
  )
  if (!rows.length) return fail(res, 404, '赛事不存在')
  return ok(res, normalizeActivity(rows[0]))
}))

router.post('/', authenticate, asyncHandler(async (req, res) => {
  const {
    title,
    name,
    content,
    detail,
    type,
    activityType,
    address,
    activityLocation,
    startTime,
    endTime,
    count,
    num,
    activityTime,
    date,
    signupEndTime,
    deadline,
    contactPerson,
    contactPhone
  } = req.body

  const finalTitle = title || name
  const finalType = activityType || type
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
      req.user.userId,
      finalTitle,
      content || detail || null,
      finalType,
      finalLocation,
      startTime || null,
      endTime || null,
      Number(finalCount || 0),
      finalActivityTime,
      contactPerson || null,
      contactPhone || null,
      finalSignupEndTime
    ]
  )

  return ok(res, { id: result.insertId }, '赛事已提交审核')
}))

router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const rows = await query(
    'SELECT UserID FROM MarathonActivity WHERE ActivityID = ? LIMIT 1',
    [req.params.id]
  )
  if (!rows.length) return fail(res, 404, '赛事不存在')
  if (rows[0].UserID !== req.user.userId && req.user.userType !== 'admin') {
    return fail(res, 403, '只能修改自己发布的赛事')
  }

  const {
    title,
    name,
    content,
    detail,
    activityState,
    type,
    activityType,
    address,
    activityLocation,
    startTime,
    endTime,
    count,
    num,
    activityTime,
    date,
    signupEndTime,
    deadline,
    contactPerson,
    contactPhone
  } = req.body

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
      activityType || type || null,
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
  const rows = await query(
    'SELECT UserID FROM MarathonActivity WHERE ActivityID = ? LIMIT 1',
    [req.params.id]
  )
  if (!rows.length) return fail(res, 404, '赛事不存在')
  if (rows[0].UserID !== req.user.userId && req.user.userType !== 'admin') {
    return fail(res, 403, '只能删除自己发布的赛事')
  }

  await query('DELETE FROM MarathonActivity WHERE ActivityID = ?', [req.params.id])
  return ok(res, null, '赛事已删除')
}))

module.exports = router

