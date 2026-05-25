const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    account: '',
    password: '',
    role: 'user'
  },

  onSwitchRole(e) {
    this.setData({ role: e.currentTarget.dataset.role })
  },

  onEmailInput(e) {
    this.setData({ account: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  async onLogin() {
    const { account, password, role } = this.data

    if (!account) {
      wx.showToast({ title: role === 'admin' ? '请输入管理员账号' : '请输入用户ID', icon: 'none' })
      return
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    wx.showLoading({ title: '登录中...' })
    try {
      const data = await api.request({
        url: '/api/auth/login',
        method: 'POST',
        data: {
          account,
          password,
          role
        }
      })
      const user = api.normalizeUser(data.user)
      app.login(user, role === 'admin' || data.user.userType === 'admin', data.token)
      wx.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        wx.reLaunch({
          url: app.globalData.isAdmin ? '/pages/admin-index/admin-index' : '/pages/index/index'
        })
      }, 600)
    } catch (error) {
      api.showError(error)
    } finally {
      wx.hideLoading()
    }
  },

  onForgotPassword() {
    wx.navigateTo({ url: '/pages/forgot-password/forgot-password' })
  },

  onGoRegister() {
    wx.navigateTo({ url: '/pages/register/register' })
  }
})
