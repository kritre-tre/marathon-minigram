const express = require('express')
const { query } = require('../config/db')
const { authenticate } = require('../middleware/auth')
const { asyncHandler, fail, ok } = require('../utils/http')
const { required } = require('../utils/validators')

const router = express.Router()

function normalizePost(row) {
  return {
    id: row.ThemePostID,
    activityId: row.ActivityID,
    authorId: row.authorID,
    authorName: row.username || row.authorID,
    title: row.Title,
    content: row.Content,
    publishTime: row.PublishTime,
    auditState: row.AuditState,
    commentCount: row.commentCount || 0
  }
}

router.get('/', asyncHandler(async (req, res) => {
  const { keyword, activityId, auditState = 'Approved' } = req.query
  const filters = []
  const params = []

  if (keyword) {
    filters.push('(p.Title LIKE ? OR p.Content LIKE ?)')
    params.push(`%${keyword}%`, `%${keyword}%`)
  }
  if (activityId) {
    filters.push('p.ActivityID = ?')
    params.push(activityId)
  }
  if (auditState) {
    filters.push('p.AuditState = ?')
    params.push(auditState)
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
  const rows = await query(
    `SELECT p.*, o.username, COUNT(c.CommentID) AS commentCount
     FROM ThemePost p
     LEFT JOIN OrdinaryUser o ON o.userID = p.authorID
     LEFT JOIN Comment c ON c.ThemePostID = p.ThemePostID AND c.AuditState = 'Approved'
     ${where}
     GROUP BY p.ThemePostID
     ORDER BY p.PublishTime DESC, p.ThemePostID DESC`,
    params
  )
  return ok(res, rows.map(normalizePost))
}))

router.get('/my', authenticate, asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT p.*, o.username, COUNT(c.CommentID) AS commentCount
     FROM ThemePost p
     LEFT JOIN OrdinaryUser o ON o.userID = p.authorID
     LEFT JOIN Comment c ON c.ThemePostID = p.ThemePostID
     WHERE p.authorID = ?
     GROUP BY p.ThemePostID
     ORDER BY p.PublishTime DESC, p.ThemePostID DESC`,
    [req.user.userId]
  )
  return ok(res, rows.map(normalizePost))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT p.*, o.username, COUNT(c.CommentID) AS commentCount
     FROM ThemePost p
     LEFT JOIN OrdinaryUser o ON o.userID = p.authorID
     LEFT JOIN Comment c ON c.ThemePostID = p.ThemePostID AND c.AuditState = 'Approved'
     WHERE p.ThemePostID = ?
     GROUP BY p.ThemePostID
     LIMIT 1`,
    [req.params.id]
  )
  if (!rows.length) return fail(res, 404, '帖子不存在')
  return ok(res, normalizePost(rows[0]))
}))

router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { activityId, title, content } = req.body
  if (!required(title) || !required(content)) {
    return fail(res, 400, '帖子标题和内容不能为空')
  }

  const result = await query(
    `INSERT INTO ThemePost
     (ActivityID, authorID, Title, Content, PublishTime, AuditState)
     VALUES (?, ?, ?, ?, NOW(), 'Pending')`,
    [activityId || null, req.user.userId, title, content]
  )
  return ok(res, { id: result.insertId }, '帖子已提交审核')
}))

router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const rows = await query(
    'SELECT authorID FROM ThemePost WHERE ThemePostID = ? LIMIT 1',
    [req.params.id]
  )
  if (!rows.length) return fail(res, 404, '帖子不存在')
  if (rows[0].authorID !== req.user.userId && req.user.userType !== 'admin') {
    return fail(res, 403, '只能修改自己的帖子')
  }

  await query(
    `UPDATE ThemePost
     SET Title = COALESCE(?, Title),
         Content = COALESCE(?, Content),
         AuditState = 'Pending'
     WHERE ThemePostID = ?`,
    [req.body.title || null, req.body.content || null, req.params.id]
  )
  return ok(res, null, '帖子已更新并重新提交审核')
}))

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const rows = await query(
    'SELECT authorID FROM ThemePost WHERE ThemePostID = ? LIMIT 1',
    [req.params.id]
  )
  if (!rows.length) return fail(res, 404, '帖子不存在')
  if (rows[0].authorID !== req.user.userId && req.user.userType !== 'admin') {
    return fail(res, 403, '只能删除自己的帖子')
  }

  await query('DELETE FROM ThemePost WHERE ThemePostID = ?', [req.params.id])
  return ok(res, null, '帖子已删除')
}))

module.exports = router

