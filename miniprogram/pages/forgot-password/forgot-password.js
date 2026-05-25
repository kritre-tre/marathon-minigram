const api = require('../../utils/api')

Page({
  data: {
    email: '',
    newPassword: '',
    confirmPassword: ''
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },

  async onSubmit() {
    const { email, newPassword, confirmPassword } = this.data
    if (!email || !newPassword || !confirmPassword) {
      wx.showToast({ title: '请填写完整', icon: 'none' })
      return
    }
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }
    try {
      await api.request({
        url: '/api/auth/reset-password',
        method: 'POST',
        data: { email, newPassword }
      })
      wx.showToast({ title: '重置成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (error) {
      api.showError(error)
    }
  }
})
