// pages/edit-profile/edit-profile.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    genderOptions: ['男', '女'],
    educationOptions: ['高中及以下', '大专', '本科', '硕士', '博士']
  },

  onLoad() {
    const userInfo = { ...app.globalData.userInfo } || {}
    this.setData({ userInfo })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`userInfo.${field}`]: e.detail.value
    })
  },

  onGenderChange(e) {
    const index = e.detail.value
    this.setData({
      'userInfo.gender': this.data.genderOptions[index]
    })
  },

  onBirthdayChange(e) {
    this.setData({
      'userInfo.birthday': e.detail.value
    })
  },

  onEducationChange(e) {
    const index = e.detail.value
    this.setData({
      'userInfo.education': this.data.educationOptions[index]
    })
  },

  onSave() {
    const { userInfo } = this.data

    if (!userInfo.username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' })
      return
    }

    // 保存到全局
    app.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)

    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })

    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  }
})
