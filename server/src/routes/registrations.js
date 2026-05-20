const express = require('express')
const { query } = require('../config/db')
const { authenticate } = require('../middleware/auth')
const { asyncHandler, fail, ok } = require('../utils/http')
const { required } = require('../utils/validators')

const router = express.Router()

function normalizeRegistration(row) {
  return {
    id: row.RegistrationID,
    activityId: row.ActivityID,
    activityTitle: row.Title,
    userId: row.UserID,
    realName: row.RealName,
    idNumber: row.IDNumber,
    phoneNumber: row.PhoneNumber,
    emergencyContact: row.EmergencyContact,
    auditState: row.AuditState,
    registrationStatus: row.RegistrationStatus
  }
}

router.get('/my', authenticate, asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT r.*, a.Title
     FROM Registration_Inf r
     LEFT JOIN MarathonActivity a ON a.ActivityID = r.ActivityID
     WHERE r.UserID = ?
     ORDER BY r.RegistrationID DESC`,
    [req.user.userId]
  )
  return ok(res, rows.map(normalizeRegistration))
}))

router.get('/activity/:activityId', authenticate, asyncHandler(async (req, res) => {
  const activities = await query(
    'SELECT UserID FROM MarathonActivity WHERE ActivityID = ? LIMIT 1',
    [req.params.activityId]
  )
  if (!activities.length) return fail(res, 404, '赛事不存在')
  if (activities[0].UserID !== req.user.userId && req.user.userType !== 'admin') {
    return fail(res, 403, '只能查看自己发布赛事的报名信息')
  }

  const rows = await query(
    `SELECT r.*, a.Title
     FROM Registration_Inf r
     LEFT JOIN MarathonActivity a ON a.ActivityID = r.ActivityID
     WHERE r.ActivityID = ?
     ORDER BY r.RegistrationID DESC`,
    [req.params.activityId]
  )
  return ok(res, rows.map(normalizeRegistration))
}))

router.post('/', authenticate, asyncHandler(async (req, res) => {
  const {
    activityId,
    realName,
    idNumber,
    phoneNumber,
    emergencyContact
  } = req.body

  if (!required(activityId) || !required(realName) || !required(phoneNumber)) {
    return fail(res, 400, '赛事、真实姓名和联系电话不能为空')
  }

  const exists = await query(
    `SELECT RegistrationID FROM Registration_Inf
     WHERE ActivityID = ? AND UserID = ?
     LIMIT 1`,
    [activityId, req.user.userId]
  )
  if (exists.length) {
    return fail(res, 409, '已报名该赛事')
  }

  const result = await query(
    `INSERT INTO Registration_Inf
     (ActivityID, UserID, RealName, IDNumber, PhoneNumber, EmergencyContact,
      AuditState, RegistrationStatus)
     VALUES (?, ?, ?, ?, ?, ?, 'Pending', 'Submitted')`,
    [
      activityId,
      req.user.userId,
      realName,
      idNumber || null,
      phoneNumber,
      emergencyContact || null
    ]
  )

  return ok(res, { id: result.insertId }, '报名信息已提交')
}))

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const rows = await query(
    'SELECT UserID FROM Registration_Inf WHERE RegistrationID = ? LIMIT 1',
    [req.params.id]
  )
  if (!rows.length) return fail(res, 404, '报名信息不存在')
  if (rows[0].UserID !== req.user.userId && req.user.userType !== 'admin') {
    return fail(res, 403, '只能取消自己的报名')
  }

  await query('DELETE FROM Registration_Inf WHERE RegistrationID = ?', [req.params.id])
  return ok(res, null, '报名已取消')
}))

router.put('/:id/audit', authenticate, asyncHandler(async (req, res) => {
  const { auditState, registrationStatus } = req.body
  const rows = await query(
    `SELECT r.RegistrationID, a.UserID AS ownerId
     FROM Registration_Inf r
     JOIN MarathonActivity a ON a.ActivityID = r.ActivityID
     WHERE r.RegistrationID = ?
     LIMIT 1`,
    [req.params.id]
  )
  if (!rows.length) return fail(res, 404, '报名信息不存在')
  if (rows[0].ownerId !== req.user.userId && req.user.userType !== 'admin') {
    return fail(res, 403, '只能审核自己发布赛事的报名信息')
  }

  await query(
    `UPDATE Registration_Inf
     SET AuditState = ?, RegistrationStatus = COALESCE(?, RegistrationStatus)
     WHERE RegistrationID = ?`,
    [auditState || 'Approved', registrationStatus || null, req.params.id]
  )
  return ok(res, null, '报名审核已处理')
}))

module.exports = router

