async function deleteComment(connection, commentId) {
  await connection.execute('DELETE FROM Comment WHERE CommentID = ?', [commentId])
}

async function deletePost(connection, postId) {
  await connection.execute('DELETE FROM Comment WHERE ThemePostID = ?', [postId])
  await connection.execute('DELETE FROM ThemePost WHERE ThemePostID = ?', [postId])
}

async function deleteActivity(connection, activityId) {
  await connection.execute(
    `DELETE c FROM Comment c
     JOIN ThemePost p ON p.ThemePostID = c.ThemePostID
     WHERE p.ActivityID = ?`,
    [activityId]
  )
  await connection.execute('DELETE FROM Registration_Inf WHERE ActivityID = ?', [activityId])
  await connection.execute('DELETE FROM ThemePost WHERE ActivityID = ?', [activityId])
  await connection.execute('DELETE FROM MarathonActivity WHERE ActivityID = ?', [activityId])
}

async function getUserKeys(connection, userId) {
  const [rows] = await connection.execute(
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

async function deleteUser(connection, userId) {
  const userKeys = await getUserKeys(connection, userId)
  const placeholders = userKeys.map(() => '?').join(', ')

  await connection.execute(
    `DELETE c FROM Comment c
     JOIN ThemePost p ON p.ThemePostID = c.ThemePostID
     WHERE p.authorID IN (${placeholders})`,
    userKeys
  )
  await connection.execute(
    `DELETE c FROM Comment c
     JOIN ThemePost p ON p.ThemePostID = c.ThemePostID
     JOIN MarathonActivity a ON a.ActivityID = p.ActivityID
     WHERE a.UserID IN (${placeholders})`,
    userKeys
  )
  await connection.execute(`DELETE FROM Comment WHERE authorID IN (${placeholders})`, userKeys)
  await connection.execute(
    `DELETE r FROM Registration_Inf r
     JOIN MarathonActivity a ON a.ActivityID = r.ActivityID
     WHERE a.UserID IN (${placeholders})`,
    userKeys
  )
  await connection.execute(`DELETE FROM Registration_Inf WHERE UserID IN (${placeholders})`, userKeys)
  await connection.execute(`DELETE FROM ThemePost WHERE authorID IN (${placeholders})`, userKeys)
  await connection.execute(
    `DELETE p FROM ThemePost p
     JOIN MarathonActivity a ON a.ActivityID = p.ActivityID
     WHERE a.UserID IN (${placeholders})`,
    userKeys
  )
  await connection.execute(`DELETE FROM MarathonActivity WHERE UserID IN (${placeholders})`, userKeys)
  await connection.execute('DELETE FROM OrdinaryUser WHERE userID = ?', [userId])
  await connection.execute('DELETE FROM user_database WHERE UserID = ?', [userId])
}

module.exports = {
  deleteActivity,
  deleteComment,
  deletePost,
  deleteUser
}
