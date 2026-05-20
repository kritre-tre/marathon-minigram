const api = require('../../utils/api')

Page({
  data: {
    type: '',
    item: null,
    loading: true
  },

  onLoad(options) {
    const { type, id } = options
    this.setData({ type })
    this.loadItem(type, Number(id))
  },

  async loadItem(type, id) {
    this.setData({ loading: true })
    try {
      const list = await api.request({ url: `/api/admin/audit/${type}`, auth: true })
      const item = (list || []).find(i => Number(i.id) === Number(id))
      this.setData({
        item: item ? api.normalizeAuditItem(item, type) : null,
        loading: false
      })
    } catch (error) {
      this.setData({ loading: false })
      api.showError(error)
    }
  },

  onApprove() {
    this.audit('approve')
  },

  onReject() {
    this.audit('reject')
  },

  audit(action) {
    const { type, item } = this.data
    if (!item) return

    wx.showModal({
      title: action === 'approve' ? '确认通过' : '确认拒绝',
      content: action === 'approve' ? '确认审核通过此内容？' : '确认拒绝此内容？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.request({
            url: `/api/admin/audit/${type}/${item.id}`,
            method: 'PUT',
            auth: true,
            data: { action }
          })
          wx.showToast({ title: '审核已处理', icon: 'success' })
          const status = action === 'approve' ? 'Approved' : 'Rejected'
          this.setData({
            item: {
              ...item,
              status,
              statusText: api.auditStatusText(status),
              statusClass: api.auditStatusClass(status)
            }
          })
        } catch (error) {
          api.showError(error)
        }
      }
    })
  }
})
