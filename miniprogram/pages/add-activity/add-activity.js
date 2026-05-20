const api = require('../../utils/api')

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
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onDateChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onTypeChange(e) {
    this.setData({ 'form.type': this.data.typeOptions[e.detail.value] })
  },

  async onSubmit() {
    const { form } = this.data

    if (!form.name) return wx.showToast({ title: '请输入赛事名称', icon: 'none' })
    if (!form.city) return wx.showToast({ title: '请输入举办城市', icon: 'none' })
    if (!form.address) return wx.showToast({ title: '请输入详细地址', icon: 'none' })
    if (!form.date) return wx.showToast({ title: '请选择活动日期', icon: 'none' })
    if (!form.deadline) return wx.showToast({ title: '请选择报名截止日期', icon: 'none' })
    if (!form.type) return wx.showToast({ title: '请选择赛事类型', icon: 'none' })
    if (!form.count) return wx.showToast({ title: '请输入招募人数', icon: 'none' })
    if (!form.intro) return wx.showToast({ title: '请输入赛事简介', icon: 'none' })

    wx.showLoading({ title: '发布中...' })
    try {
      await api.request({
        url: '/api/activities',
        method: 'POST',
        auth: true,
        data: {
          name: form.name,
          type: form.type,
          address: `${form.city} ${form.address}`,
          date: form.date,
          deadline: form.deadline,
          count: Number(form.count),
          detail: `${form.intro}\n\n${form.detail || ''}`.trim()
        }
      })
      wx.showToast({ title: '已提交审核', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 800)
    } catch (error) {
      api.showError(error)
    } finally {
      wx.hideLoading()
    }
  }
})
