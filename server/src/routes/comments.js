const express = require('express')
const { query, withTransaction } = require('../config/db')
const { authenticate } = require('../middleware/auth')
const { asyncHandler, fail, ok } = require('../utils/http')
const { required } = require('../utils/validators')
const { deleteComment } = require('../utils/cascadeDelete')

const router = express.Router()

function normalizeComment(row) {
  return {
    id: row.CommentID,
    postId: row.ThemePostID,
    authorId: row.authorID,
    authorName: row.username || row.authorID,
    content: row.Content,
    publishTime: row.PublishTime,
    auditState: row.AuditState
  }
}

router.get('/post/:postId', asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT c.*, o.username
     FROM Comment c
     LEFT JOIN OrdinaryUser o ON o.userID = c.authorID
     WHERE c.ThemePostID = ? AND c.AuditState = 'Approved'
     ORDER BY c.PublishTime ASC, c.CommentID ASC`,
    [req.params.postId]
  )
  return ok(res, rows.map(normalizeComment))
}))

router.get('/my', authenticate, asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT c.*, o.username
     FROM Comment c
     LEFT JOIN OrdinaryUser o ON o.userID = c.authorID
     WHERE c.authorID = ?
     ORDER BY c.PublishTime DESC, c.CommentID DESC`,
    [req.user.userId]
  )
  return ok(res, rows.map(normalizeComment))
}))

router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { postId, content } = req.body
  if (!required(postId) || !required(content)) {
    return fail(res, 400, '帖子和评论内容不能为空')
  }

  const result = await query(
    `INSERT INTO Comment
     (ThemePostID, authorID, Content, PublishTime, AuditState)
     VALUES (?, ?, ?, NOW(), 'Pending')`,
    [postId, req.user.userId, content]
  )
  return ok(res, { id: result.insertId }, '评论已提交审核')
}))

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const rows = await query(
    'SELECT authorID FROM Comment WHERE CommentID = ? LIMIT 1',
    [req.params.id]
  )
  if (!rows.length) return fail(res, 404, '评论不存在')
  if (rows[0].authorID !== req.user.userId && req.user.userType !== 'admin') {
    return fail(res, 403, '只能删除自己的评论')
  }

  await withTransaction(async (connection) => {
    await deleteComment(connection, req.params.id)
  })
  return ok(res, null, '评论已删除')
}))

module.exports = router
