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
      post: '暂无待审核主题帖',
      comment: '暂无待审核评论',
      activity: '暂无待审核赛事',
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
      const list = await api.request({ url: `/api/admin/audit/${tab}`, auth: true })
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
  }
})
