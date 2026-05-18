// pages/admin-audit-detail/admin-audit-detail.js
const adminData = require('../../utils/adminData')

Page({
  data: {
    type: '',
    item: null,
    loading: true
  },

  onLoad(options) {
    const { type, id } = options
    this.setData({ type })
    this.loadItem(type, parseInt(id))
  },

  loadItem(type, id) {
    let list = []
    if (type === 'post') list = adminData.pendingPosts
    else if (type === 'comment') list = adminData.pendingComments
    else if (type === 'activity') list = adminData.pendingActivities

    const item = list.find(i => i.id === id)
    this.setData({ item, loading: false })
  },

  onApprove() {
    const { type, item } = this.data
    if (!item) return

    wx.showModal({
      title: '确认通过',
      content: '确认审核通过此项内容？',
      success: (res) => {
        if (res.confirm) {
          const result = adminData.approveItem(type, item.id)
          if (result) {
            wx.showToast({ title: '已审核通过', icon: 'success' })
            this.setData({ item: { ...this.data.item, status: 'approved' } })
          }
        }
      }
    })
  },

  onReject() {
    const { type, item } = this.data
    if (!item) return

    wx.showModal({
      title: '确认拒绝',
      content: '确认拒绝此项内容？',
      success: (res) => {
        if (res.confirm) {
          const result = adminData.rejectItem(type, item.id)
          if (result) {
            wx.showToast({ title: '已拒绝', icon: 'success' })
            this.setData({ item: { ...this.data.item, status: 'rejected' } })
          }
        }
      }
    })
  },

  getStatusText(status) {
    const map = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
    return map[status] || status
  },

  getStatusClass(status) {
    const map = { pending: 'status-pending', approved: 'status-approved', rejected: 'status-rejected' }
    return map[status] || ''
  }
})
