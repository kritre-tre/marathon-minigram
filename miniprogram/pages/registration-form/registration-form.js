const api = require('../../utils/api')

Page({
  data: {
    activityId: '',
    activityName: '',
    form: {
      realName: '',
      idNumber: '',
      phoneNumber: '',
      emergencyContact: ''
    },
    submitting: false
  },

  onLoad(options) {
    const user = getApp().globalData.userInfo || {}
    this.setData({
      activityId: options.activityId || '',
      activityName: decodeURIComponent(options.activityName || ''),
      form: {
        realName: user.name || user.realName || '',
        idNumber: '',
        phoneNumber: user.phone || '',
        emergencyContact: ''
      }
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  async onSubmit() {
    const { activityId, form, submitting } = this.data
    if (submitting) return

    if (!form.realName.trim()) {
      wx.showToast({ title: '请填写真实姓名', icon: 'none' })
      return
    }
    if (!form.idNumber.trim()) {
      wx.showToast({ title: '请填写身份证号', icon: 'none' })
      return
    }
    if (!form.phoneNumber.trim()) {
      wx.showToast({ title: '请填写联系电话', icon: 'none' })
      return
    }
    if (!form.emergencyContact.trim()) {
      wx.showToast({ title: '请填写紧急联系人及电话', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })
    try {
      await api.request({
        url: '/api/registrations',
        method: 'POST',
        auth: true,
        data: {
          activityId,
          realName: form.realName.trim(),
          idNumber: form.idNumber.trim(),
          phoneNumber: form.phoneNumber.trim(),
          emergencyContact: form.emergencyContact.trim()
        }
      })
      wx.showToast({ title: '报名已提交', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (error) {
      api.showError(error)
    } finally {
      wx.hideLoading()
      this.setData({ submitting: false })
    }
  }
})
