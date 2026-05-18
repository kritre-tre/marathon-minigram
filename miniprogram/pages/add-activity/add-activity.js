// pages/add-activity/add-activity.js
Page({
  data: {
    form: {
      name: '',
      city: '',
      address: '',
      date: '',
      deadline: '',
      type: '',
      count: '',
      intro: '',
      detail: ''
    },
    typeOptions: ['全程马拉松', '半程马拉松', '迷你马拉松', '接力马拉松']
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },

  onDateChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },

  onTypeChange(e) {
    const index = e.detail.value
    this.setData({
      'form.type': this.data.typeOptions[index]
    })
  },

  onSubmit() {
    const { form } = this.data

    // 验证必填项
    if (!form.name) {
      wx.showToast({ title: '请输入赛事名称', icon: 'none' })
      return
    }
    if (!form.city) {
      wx.showToast({ title: '请输入举办城市', icon: 'none' })
      return
    }
    if (!form.address) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' })
      return
    }
    if (!form.date) {
      wx.showToast({ title: '请选择活动日期', icon: 'none' })
      return
    }
    if (!form.deadline) {
      wx.showToast({ title: '请选择报名截止日期', icon: 'none' })
      return
    }
    if (!form.type) {
      wx.showToast({ title: '请选择赛事类型', icon: 'none' })
      return
    }
    if (!form.count) {
      wx.showToast({ title: '请输入招募人数', icon: 'none' })
      return
    }
    if (!form.intro) {
      wx.showToast({ title: '请输入赛事简介', icon: 'none' })
      return
    }

    // 模拟提交
    wx.showLoading({ title: '发布中...' })

    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 1000)
  }
})
