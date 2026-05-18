// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: {}
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = app.globalData.userInfo || {}
    this.setData({ userInfo })
  },

  onMenuTap(e) {
    const type = e.currentTarget.dataset.type
    
    switch (type) {
      case 'editProfile':
        wx.navigateTo({
          url: '/pages/edit-profile/edit-profile'
        })
        break
      case 'myActivities':
        wx.showToast({ title: '已报名活动', icon: 'none' })
        break
      case 'publishedActivities':
        wx.showToast({ title: '已发布赛事活动', icon: 'none' })
        break
      case 'myPosts':
        wx.showToast({ title: '我的主题帖', icon: 'none' })
        break
      case 'favorites':
        wx.showToast({ title: '收藏赛事', icon: 'none' })
        break
      case 'audit':
        wx.showToast({ title: '审核报名信息', icon: 'none' })
        break
      case 'changePhone':
        wx.showToast({ title: '修改手机号', icon: 'none' })
        break
      case 'changeEmail':
        wx.showToast({ title: '修改电子邮箱', icon: 'none' })
        break
      case 'changePassword':
        wx.showToast({ title: '修改密码', icon: 'none' })
        break
      case 'deleteAccount':
        this.onDeleteAccount()
        break
      default:
        wx.showToast({ title: '功能开发中', icon: 'none' })
    }
  },

  onDeleteAccount() {
    wx.showModal({
      title: '注销账户',
      content: '确定要注销账户吗？此操作不可恢复。',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          app.logout()
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout()
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
})
