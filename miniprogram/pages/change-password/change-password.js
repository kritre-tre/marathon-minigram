const api = require('../../utils/api')

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },

  async onSubmit() {
    const { oldPassword, newPassword, confirmPassword } = this.data
    if (!oldPassword || !newPassword || !confirmPassword) {
      wx.showToast({ title: '请填写完整', icon: 'none' })
      return
    }
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次新密码不一致', icon: 'none' })
      return
    }
    try {
      await api.request({
        url: '/api/auth/password',
        method: 'PUT',
        auth: true,
        data: { oldPassword, newPassword }
      })
      wx.showToast({ title: '密码已更新', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (error) {
      api.showError(error)
    }
  }
})
