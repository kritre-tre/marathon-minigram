// pages/index/index.js
Page({
  data: {
    banners: [
      {
        id: 1,
        title: '2025南京马拉松',
        subtitle: '金陵古都，活力开跑',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        id: 2,
        title: '上海国际马拉松',
        subtitle: '东方明珠，精彩无限',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        id: 3,
        title: '北京马拉松',
        subtitle: '首都风采，激情奔跑',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        id: 4,
        title: '厦门马拉松',
        subtitle: '最美赛道，海风相伴',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      }
    ],
    activities: [
      {
        id: 1,
        name: '南京马拉松',
        city: '南京市',
        date: '2025-11-30',
        status: '招募中',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        id: 2,
        name: '上海马拉松',
        city: '上海市',
        date: '2025-11-20',
        status: '招募中',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        id: 3,
        name: '北京马拉松',
        city: '北京市',
        date: '2025-10-15',
        status: '已结束',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        id: 4,
        name: '厦门马拉松',
        city: '厦门市',
        date: '2025-12-10',
        status: '招募中',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      }
    ]
  },

  onLoad() {
    // 检查登录状态
    const app = getApp()
    if (!app.globalData.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
  },

  onActivityTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/activity-detail/activity-detail?id=${id}`
    })
  },

  onViewMore() {
    wx.switchTab({
      url: '/pages/activity/activity'
    })
  }
})
