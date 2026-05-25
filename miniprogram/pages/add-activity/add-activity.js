const api = require('../../utils/api')

const TYPE_OPTIONS = [
  { label: '全程马拉松', value: 'full_marathon' },
  { label: '半程马拉松', value: 'half_marathon' },
  { label: '迷你马拉松', value: 'mini_marathon' },
  { label: '接力马拉松', value: 'relay_marathon' }
]

Page({
  data: {
    activityId: '',
    typeIndex: 0,
    form: {
      name: '',
      city: '',
      address: '',
      date: '',
      deadline: '',
      type: TYPE_OPTIONS[0].value,
      count: '',
      intro: '',
      detail: ''
    },
    typeOptions: TYPE_OPTIONS
  },

  onLoad(options) {
    const id = options.id || ''
    this.setData({ activityId: id })
    if (id) this.loadActivity(id)
  },

  async loadActivity(id) {
    try {
      const raw = await api.request({ url: `/api/activities/${id}`, auth: true })
      const item = api.normalizeActivity(raw)
      const address = item.address || ''
      const typeIndex = TYPE_OPTIONS.findIndex(t => t.value === item.type)
      this.setData({
        typeIndex: typeIndex >= 0 ? typeIndex : 0,
        form: {
          name: item.name || '',
          city: '',
          address,
          date: item.date || '',
          deadline: item.deadline || '',
          type: item.type || TYPE_OPTIONS[0].value,
          count: String(item.count || ''),
          intro: item.intro || '',
          detail: item.detail || ''
        }
      })
      wx.setNavigationBarTitle({ title: '编辑赛事活动' })
    } catch (error) {
      api.showError(error)
    }
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
    const typeIndex = Number(e.detail.value)
    this.setData({
      typeIndex,
      'form.type': this.data.typeOptions[typeIndex].value
    })
  },

  async onSubmit() {
    const { form, activityId } = this.data

    if (!form.name) return wx.showToast({ title: '请输入赛事名称', icon: 'none' })
    if (!form.address) return wx.showToast({ title: '请输入详细地址', icon: 'none' })
    if (!form.date) return wx.showToast({ title: '请选择活动日期', icon: 'none' })
    if (!form.deadline) return wx.showToast({ title: '请选择报名截止日期', icon: 'none' })
    if (!form.type) return wx.showToast({ title: '请选择赛事类型', icon: 'none' })
    if (!form.count) return wx.showToast({ title: '请输入招募人数', icon: 'none' })
    if (!form.intro) return wx.showToast({ title: '请输入赛事简介', icon: 'none' })

    wx.showLoading({ title: activityId ? '保存中...' : '发布中...' })
    try {
      const payload = {
        name: form.name,
        type: form.type,
        address: `${form.city} ${form.address}`.trim(),
        date: form.date,
        deadline: form.deadline,
        count: Number(form.count),
        detail: `${form.intro}\n\n${form.detail || ''}`.trim()
      }
      if (activityId) {
        await api.request({
          url: `/api/activities/${activityId}`,
          method: 'PUT',
          auth: true,
          data: payload
        })
      } else {
        await api.request({
          url: '/api/activities',
          method: 'POST',
          auth: true,
          data: payload
        })
      }
      wx.showToast({ title: activityId ? '已更新并提交审核' : '已提交审核', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 800)
    } catch (error) {
      api.showError(error)
    } finally {
      wx.hideLoading()
    }
  }
})
