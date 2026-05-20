const api = require('../../utils/api')

Page({
  data: {
    email: '',
    password: '',
    confirmPassword: ''
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  async onRegister() {
    const { email, password, confirmPassword } = this.data

    if (!email) {
      wx.showToast({ title: '请输入邮箱', icon: 'none' })
      return
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return
    }
    if (password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }

    wx.showLoading({ title: '注册中...' })
    try {
      await api.request({
        url: '/api/auth/register',
        method: 'POST',
        data: {
          email,
          password
        }
      })
      wx.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (error) {
      api.showError(error)
    } finally {
      wx.hideLoading()
    }
  },

  onGoLogin() {
    wx.navigateBack()
  }
})
