// pages/register/register.js
Page({
  data: {
    username: '',
    password: '',
    confirmPassword: ''
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [field]: e.detail.value
    })
  },

  onRegister() {
    const { username, password, confirmPassword } = this.data

    if (!username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' })
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

    // 模拟注册成功
    wx.showToast({
      title: '注册成功',
      icon: 'success'
    })

    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  },

  onGoLogin() {
    wx.navigateBack()
  }
})
