const api = require('../../utils/api')

Page({
  data: {
    tab: 'post',
    tabs: [
      { key: 'post', label: '主题帖审核' },
      { key: 'comment', label: '评论审核' },
      { key: 'activity', label: '赛事审核' },
      { key: 'user', label: '用户管理' }
    ],
    list: [],
    emptyText: {
      post: '暂无主题帖',
      comment: '暂无评论',
      activity: '暂无赛事',
      user: '暂无注册用户'
    }
  },

  onLoad(options) {
    if (options.tab) this.setData({ tab: options.tab })
    this.loadList()
  },

  onShow() {
    this.loadList()
  },

  onSwitchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab }, () => this.loadList())
  },

  async loadList() {
    try {
      const tab = this.data.tab
      const list = await api.request({ url: `/api/admin/audit/${tab}?status=all`, auth: true })
      this.setData({
        list: (list || []).map(item => api.normalizeAuditItem(item, tab))
      })
    } catch (error) {
      api.showError(error)
    }
  },

  onItemTap(e) {
    const { type, id } = e.currentTarget.dataset
    if (type === 'user') return
    wx.navigateTo({ url: `/pages/admin-audit-detail/admin-audit-detail?type=${type}&id=${id}` })
  },

  onUserStatusTap(e) {
    const id = e.currentTarget.dataset.id
    const current = e.currentTarget.dataset.type
    const target = current === 'disabled' ? 'ordinary' : 'disabled'
    const text = target === 'disabled' ? '禁用' : '启用'
    wx.showModal({
      title: `${text}用户`,
      content: `确认${text}该用户吗？`,
      success: async (res) => {
        if (!res.confirm) return
        try {
          await api.request({
            url: `/api/admin/users/${id}/status`,
            method: 'PUT',
            auth: true,
            data: { userType: target }
          })
          wx.showToast({ title: '操作成功', icon: 'success' })
          this.loadList()
        } catch (error) {
          api.showError(error)
        }
      }
    })
  },

  onDeleteTap(e) {
    const { type, id } = e.currentTarget.dataset
    const titleMap = {
      post: '删除主题帖',
      comment: '删除评论',
      activity: '删除赛事',
      user: '删除用户'
    }
    const contentMap = {
      post: '确认删除该主题帖及其下所有评论吗？',
      comment: '确认删除该评论吗？',
      activity: '确认删除该赛事、报名信息、关联主题帖及评论吗？',
      user: '确认删除该用户及其所有赛事、报名、主题帖和评论吗？'
    }

    wx.showModal({
      title: titleMap[type] || '删除',
      content: contentMap[type] || '确认删除吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          const url = type === 'user' ? `/api/admin/user/${id}` : `/api/admin/audit/${type}/${id}`
          await api.request({ url, method: 'DELETE', auth: true })
          wx.showToast({ title: '已删除', icon: 'success' })
          this.loadList()
        } catch (error) {
          api.showError(error)
        }
      }
    })
  }
})
