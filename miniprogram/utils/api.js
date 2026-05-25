const BASE_URL = 'http://81.70.214.183:3001'

const TYPE_TEXT_MAP = {
  full_marathon: '全程马拉松',
  half_marathon: '半程马拉松',
  mini_marathon: '迷你马拉松',
  relay_marathon: '接力马拉松'
}

function normalizeType(value) {
  const v = String(value || '').trim().toLowerCase()
  if (!v) return ''
  if (['full_marathon', 'full', 'fullmarathon', '全程马拉松'].includes(v)) return 'full_marathon'
  if (['half_marathon', 'half', 'halfmarathon', '半程马拉松'].includes(v)) return 'half_marathon'
  if (['mini_marathon', 'mini', 'minimarathon', '迷你马拉松'].includes(v)) return 'mini_marathon'
  if (['relay_marathon', 'relay', 'relaymarathon', '接力马拉松'].includes(v)) return 'relay_marathon'
  return v
}

function typeToText(value) {
  return TYPE_TEXT_MAP[normalizeType(value)] || value || ''
}

function activityStatusText(status) {
  const map = {
    Recruiting: '招募中',
    recruiting: '招募中',
    Open: '招募中',
    open: '招募中',
    Pending: '待审核',
    pending: '待审核',
    Ended: '已结束',
    ended: '已结束',
    Closed: '报名结束',
    closed: '报名结束',
    Rejected: '已拒绝',
    rejected: '已拒绝'
  }
  return map[status] || status || '待审核'
}

function getToken() {
  return wx.getStorageSync('token') || ''
}

function request(options) {
  const { url, method = 'GET', data = {}, auth = false } = options
  const header = {
    'content-type': 'application/json',
    ...(options.header || {})
  }

  const token = getToken()
  if (auth && token) {
    header.Authorization = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header,
      success(res) {
        const body = res.data || {}
        if (res.statusCode >= 200 && res.statusCode < 300 && body.success !== false) {
          resolve(body.data)
          return
        }
        if (res.statusCode === 401) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('isAdmin')
        }
        reject(new Error(body.message || '请求失败'))
      },
      fail() {
        reject(new Error('无法连接服务器'))
      }
    })
  })
}

function showError(error) {
  wx.showToast({
    title: error.message || '操作失败',
    icon: 'none'
  })
}

function formatDate(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return ''
}

function normalizeUser(user) {
  if (!user) return null
  const userId = user.userId || user.userID || user.id || user.UserID || ''
  const username = user.username || userId
  const name = user.realName || user.name || username || userId || ''
  return {
    ...user,
    id: userId,
    userId,
    username,
    name,
    birthday: formatDate(user.birthDate || user.birthday),
    userTypeText: user.userType === 'admin' ? '管理员' : user.userType === 'disabled' ? '已禁用' : '普通用户'
  }
}

function normalizeActivity(item, index = 0) {
  const defaultGradient = 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)'
  const address = item.address || item.activityLocation || ''
  const status = activityStatusText(item.status || item.ActivityState)
  const type = normalizeType(item.type || item.activityType || item.ActivityType)
  const typeText = item.typeText || typeToText(type)
  return {
    ...item,
    id: item.id || item.ActivityID,
    userId: item.userId || item.UserID,
    name: item.name || item.title || item.Title,
    city: item.city || String(address).split(' ')[0] || address,
    address,
    date: formatDate(item.date || item.activityTime),
    deadline: formatDate(item.deadline || item.signupEndTime),
    type,
    typeText,
    count: item.count || item.num || 0,
    intro: item.intro || item.content || item.detail || '',
    detail: item.detail || item.content || item.intro || '',
    status,
    auditStateText: auditStatusText(item.auditState || item.AuditState),
    statusClass: status === '招募中' ? 'badge-recruiting' : 'badge-ended',
    canSignUp: status === '招募中',
    gradient: defaultGradient,
    hasCover: false,
    coverBase64: '',
    coverSrc: ''
  }
}

function normalizePost(item) {
  const name = item.authorName || item.userName || item.authorId || item.author || '用户'
  return {
    ...item,
    id: item.id || item.ThemePostID,
    title: item.title || item.Title,
    content: item.content || item.Content,
    activityId: item.activityTitle ? (item.activityId || item.ActivityID || '') : '',
    activityTitle: item.activityTitle || item.activityName || '',
    activityTypeText: typeToText(item.activityType || item.ActivityType),
    activityStatusText: activityStatusText(item.activityState || item.ActivityState),
    activityDate: formatDate(item.activityTime),
    activityLocation: item.activityLocation || '',
    authorId: item.authorId || item.authorID || item.author,
    userName: name,
    userAvatar: String(name).charAt(0).toUpperCase(),
    time: formatDate(item.publishTime || item.time) || item.time || '',
    likeCount: item.likeCount || 0,
    commentCount: item.commentCount || 0
  }
}

function normalizeComment(item) {
  const name = item.authorName || item.authorId || item.authorID || '用户'
  return {
    ...item,
    id: item.id || item.CommentID,
    postId: item.postId || item.ThemePostID,
    content: item.content || item.Content,
    authorId: item.authorId || item.authorID,
    authorName: name,
    time: formatDate(item.publishTime || item.time) || item.time || ''
  }
}

function normalizeRegistration(item) {
  return {
    ...item,
    id: item.id || item.RegistrationID,
    activityId: item.activityId || item.ActivityID,
    activityTitle: item.activityTitle || item.Title || '',
    userId: item.userId || item.UserID,
    realName: item.realName || item.RealName || '',
    phoneNumber: item.phoneNumber || item.PhoneNumber || '',
    emergencyContact: item.emergencyContact || item.EmergencyContact || '',
    auditState: item.auditState || item.AuditState || 'Pending',
    registrationStatus: item.registrationStatus || item.RegistrationStatus || 'Submitted'
  }
}

function auditStatusText(status) {
  const map = {
    Pending: '待审核',
    Approved: '已通过',
    Rejected: '已拒绝',
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return map[status] || status || '待审核'
}

function auditStatusClass(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'approved') return 'status-approved approved'
  if (value === 'rejected') return 'status-rejected rejected'
  return 'status-pending pending'
}

function normalizeAuditItem(item, type) {
  const displayName = item.name || item.username || item.userID || item.userId || item.id || ''
  const normalized = {
    ...item,
    id: item.id || item.userID || item.userId,
    userID: item.userID || item.userId || item.id || '',
    username: item.username || item.userID || item.userId || item.id || '',
    name: displayName,
    avatar: String(displayName).charAt(0).toUpperCase(),
    statusText: auditStatusText(item.status),
    statusClass: auditStatusClass(item.status),
    time: formatDate(item.time) || item.time || ''
  }

  if (type === 'activity') {
    normalized.name = item.name || item.title
    normalized.intro = item.intro || item.content || item.detail || ''
    normalized.detail = item.detail || item.content || ''
    normalized.city = item.city || item.address || ''
    normalized.date = formatDate(item.date)
    normalized.deadline = formatDate(item.deadline)
    normalized.type = normalizeType(item.type)
    normalized.typeText = typeToText(item.type)
    normalized.activityStateText = activityStatusText(item.activityState)
  }

  if (type === 'post') {
    normalized.activityTitle = item.activityTitle || ''
  }

  if (type === 'comment') {
    normalized.postTitle = item.postTitle || ''
    normalized.postAuthor = item.postAuthor || ''
  }

  return normalized
}

module.exports = {
  BASE_URL,
  request,
  showError,
  formatDate,
  normalizeType,
  typeToText,
  activityStatusText,
  normalizeUser,
  normalizeActivity,
  normalizePost,
  normalizeComment,
  normalizeRegistration,
  normalizeAuditItem,
  auditStatusText,
  auditStatusClass
}
