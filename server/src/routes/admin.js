const express = require('express')
const { query } = require('../config/db')
const { authenticate, requireAdmin } = require('../middleware/auth')
const { asyncHandler, fail, ok } = require('../utils/http')

const router = express.Router()

router.use(authenticate, requireAdmin)

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
  const { status = 'Pending' } = req.query

  if (type === 'post') {
    const rows = await query(
      `SELECT p.ThemePostID AS id, p.Title AS title, p.Content AS content,
              p.authorID AS author, p.PublishTime AS time, p.AuditState AS status
       FROM ThemePost p
       WHERE p.AuditState = ?
       ORDER BY p.PublishTime DESC`,
      [status]
    )
    return ok(res, rows)
  }

  if (type === 'comment') {
    const rows = await query(
      `SELECT c.CommentID AS id, c.Content AS content, c.authorID AS author,
              p.Title AS postTitle, c.PublishTime AS time, c.AuditState AS status
       FROM Comment c
       LEFT JOIN ThemePost p ON p.ThemePostID = c.ThemePostID
       WHERE c.AuditState = ?
       ORDER BY c.PublishTime DESC`,
      [status]
    )
    return ok(res, rows)
  }

  if (type === 'activity') {
    const rows = await query(
      `SELECT ActivityID AS id, Title AS name, Content AS detail,
              UserID AS submitter, PublishTime AS time, AuditState AS status,
              ActivityType AS type, activityLocation AS address, activityTime AS date,
              \`signup-endtime\` AS deadline, num AS count
       FROM MarathonActivity
       WHERE AuditState = ?
       ORDER BY PublishTime DESC`,
      [status]
    )
    return ok(res, rows)
  }

  if (type === 'user') {
    const rows = await query(
      `SELECT u.UserID AS id, o.username, o.realName AS name, o.phone, o.email,
              o.gender, u.userType
       FROM user_database u
       LEFT JOIN OrdinaryUser o ON o.userID = u.UserID
       ORDER BY u.UserID ASC`
    )
    return ok(res, rows)
  }

  return fail(res, 400, '未知审核类型')
}))

router.put('/audit/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params
  const { action } = req.body
  const auditState = action === 'reject' ? 'Rejected' : 'Approved'

  if (type === 'post') {
    await query('UPDATE ThemePost SET AuditState = ? WHERE ThemePostID = ?', [auditState, id])
    return ok(res, null, '帖子审核已处理')
  }

  if (type === 'comment') {
    await query('UPDATE Comment SET AuditState = ? WHERE CommentID = ?', [auditState, id])
    return ok(res, null, '评论审核已处理')
  }

  if (type === 'activity') {
    const activityState = auditState === 'Approved' ? '招募中' : '待审核'
    await query(
      `UPDATE MarathonActivity
       SET AuditState = ?, ActivityState = ?, AuditTime = NOW()
       WHERE ActivityID = ?`,
      [auditState, activityState, id]
    )
    return ok(res, null, '赛事审核已处理')
  }

  return fail(res, 400, '未知审核类型')
}))

router.put('/users/:id/status', asyncHandler(async (req, res) => {
  const { userType } = req.body
  if (!['ordinary', 'admin', 'disabled'].includes(userType)) {
    return fail(res, 400, '用户状态不合法')
  }

  await query('UPDATE user_database SET userType = ? WHERE UserID = ?', [userType, req.params.id])
  return ok(res, null, '用户状态已更新')
}))

module.exports = router

