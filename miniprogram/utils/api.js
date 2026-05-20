const BASE_URL = 'http://81.70.214.183:3001'

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
  const name = user.realName || user.name || user.username || user.userId || ''
  return {
    ...user,
    name,
    birthday: formatDate(user.birthDate || user.birthday),
    userType: user.userType === 'admin' ? '管理员' : '普通用户'
  }
}

function normalizeActivity(item, index = 0) {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
  ]
  const address = item.address || item.activityLocation || ''
  const status = item.status || item.ActivityState || '待审核'
  return {
    ...item,
    id: item.id || item.ActivityID,
    name: item.name || item.title || item.Title,
    city: item.city || address,
    address,
    date: formatDate(item.date || item.activityTime),
    deadline: formatDate(item.deadline || item.signupEndTime),
    type: item.type || item.activityType || item.ActivityType,
    count: item.count || item.num || 0,
    intro: item.intro || item.content || item.detail || '',
    detail: item.detail || item.content || item.intro || '',
    status,
    statusClass: status === '招募中' ? 'badge-recruiting' : 'badge-ended',
    canSignUp: status === '招募中',
    gradient: item.gradient || gradients[index % gradients.length]
  }
}

function normalizePost(item) {
  const name = item.authorName || item.userName || item.authorId || item.author || '用户'
  return {
    ...item,
    id: item.id || item.ThemePostID,
    title: item.title || item.Title,
    content: item.content || item.Content,
    userName: name,
    userAvatar: String(name).charAt(0).toUpperCase(),
    time: formatDate(item.publishTime || item.time) || item.time || '',
    likeCount: item.likeCount || 0,
    commentCount: item.commentCount || 0
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
  const displayName = item.name || item.username || item.id || ''
  const normalized = {
    ...item,
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
  }

  return normalized
}

module.exports = {
  BASE_URL,
  request,
  showError,
  formatDate,
  normalizeUser,
  normalizeActivity,
  normalizePost,
  normalizeAuditItem,
  auditStatusText,
  auditStatusClass
}
