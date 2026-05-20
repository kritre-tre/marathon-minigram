// 管理员底部导航组件
Component({
  properties: {
    current: {
      type: String,
      value: 'dashboard'
    }
  },

  data: {
    tabs: [
      { key: 'dashboard', label: '首页', icon: '📊', path: '/pages/admin-index/admin-index' },
      { key: 'audit', label: '审核管理', icon: '📋', path: '/pages/admin-audit/admin-audit?tab=post' },
      { key: 'profile', label: '我的', icon: '👤', path: '/pages/admin-profile/admin-profile' }
    ]
  },

  methods: {
    onTap(e) {
      const tab = e.currentTarget.dataset.tab
      const tabData = this.data.tabs.find(t => t.key === tab)
      if (!tab || tab === this.properties.current || !tabData) return

      wx.reLaunch({ url: tabData.path })
    }
  }
})
