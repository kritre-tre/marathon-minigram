const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    userInfo: {},
    genderOptions: ['男', '女'],
    educationOptions: ['高中及以下', '大专', '本科', '硕士', '博士']
  },

  onLoad() {
    this.setData({ userInfo: { ...app.globalData.userInfo } })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`userInfo.${field}`]: e.detail.value })
  },

  onGenderChange(e) {
    this.setData({ 'userInfo.gender': this.data.genderOptions[e.detail.value] })
  },

  onBirthdayChange(e) {
    this.setData({ 'userInfo.birthday': e.detail.value })
  },

  onEducationChange(e) {
    this.setData({ 'userInfo.education': this.data.educationOptions[e.detail.value] })
  },

  async onSave() {
    const { userInfo } = this.data
    if (!userInfo.username) return wx.showToast({ title: '请输入用户名', icon: 'none' })

    wx.showLoading({ title: '保存中...' })
    try {
      await api.request({
        url: '/api/auth/me',
        method: 'PUT',
        auth: true,
        data: {
          username: userInfo.username,
          realName: userInfo.name,
          gender: userInfo.gender,
          birthDate: userInfo.birthday,
          education: userInfo.education,
          school: userInfo.school
        }
      })
      const freshUser = api.normalizeUser(await api.request({ url: '/api/auth/me', auth: true }))
      app.globalData.userInfo = freshUser
      wx.setStorageSync('userInfo', freshUser)
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (error) {
      api.showError(error)
    } finally {
      wx.hideLoading()
    }
  }
})
