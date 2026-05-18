// pages/login/login.js
const app = getApp()

Page({
  data: {
    username: '',
    password: '',
    role: 'user' // 'user' or 'admin'
  },

  onSwitchRole(e) {
    const role = e.currentTarget.dataset.role
    this.setData({ role })
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  onLogin() {
    const { username, password, role } = this.data

    if (!username) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      })
      return
    }

    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    if (role === 'admin') {
      this.adminLogin(username, password)
    } else {
      this.userLogin(username, password)
    }
  },

  userLogin(username, password) {
    // 模拟登录
    const userInfo = {
      username: username,
      name: username.charAt(0).toUpperCase(),
      userType: '普通用户',
      phone: '138****8888',
      email: 'example@email.com',
      education: '本科',
      birthday: '1995-01-01',
      school: '南京大学',
      gender: '男'
    }

    app.login(userInfo, false)

    wx.showToast({
      title: '登录成功',
      icon: 'success'
    })

    setTimeout(() => {
      wx.reLaunch({ url: '/pages/index/index' })
    }, 1500)
  },

  adminLogin(username, password) {
    // 临时移除管理员密码校验，随便输都能进
    // if (username !== 'admin' || password !== 'admin123') {
    //   wx.showToast({ title: '管理员账号或密码错误', icon: 'none' })
    //   return
    // }
    const adminInfo = {
      username: username || 'admin',
      name: '管理员',
      userType: '管理员',
      phone: '130****0001',
      email: 'admin@marathon.com'
    }
    app.login(adminInfo, true)
    wx.showToast({ title: '管理员登录成功', icon: 'success' })
    setTimeout(() => {
      wx.reLaunch({ url: '/pages/admin-index/admin-index' })
    }, 1500)
  },

  onForgotPassword() {
    wx.showToast({
      title: '请联系管理员重置密码',
      icon: 'none'
    })
  },

  onGoRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  }
})
