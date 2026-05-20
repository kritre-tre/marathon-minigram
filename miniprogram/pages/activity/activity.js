const api = require('../../utils/api')

Page({
  data: {
    searchText: '',
    typeIndex: 0,
    statusIndex: 0,
    cityIndex: 0,
    typeOptions: ['全部类型', '全程马拉松', '半程马拉松', '迷你马拉松', '接力马拉松'],
    statusOptions: ['全部状态', '招募中', '报名结束', '已结束', '待审核'],
    cityOptions: ['全部城市'],
    activities: [],
    filteredActivities: []
  },

  onLoad() {
    this.loadActivities()
  },

  onShow() {
    this.loadActivities()
  },

  async loadActivities() {
    try {
      const list = await api.request({ url: '/api/activities' })
      const activities = (list || []).map(api.normalizeActivity)
      const cities = Array.from(new Set(activities.map(item => item.city).filter(Boolean)))
      this.setData({
        activities,
        cityOptions: ['全部城市', ...cities]
      })
      this.filterActivities()
    } catch (error) {
      api.showError(error)
    }
  },

  onSearchInput(e) {
    this.setData({ searchText: e.detail.value })
  },

  onSearch() {
    this.filterActivities()
  },

  onTypeChange(e) {
    this.setData({ typeIndex: Number(e.detail.value) })
    this.filterActivities()
  },

  onStatusChange(e) {
    this.setData({ statusIndex: Number(e.detail.value) })
    this.filterActivities()
  },

  onCityChange(e) {
    this.setData({ cityIndex: Number(e.detail.value) })
    this.filterActivities()
  },

  filterActivities() {
    const { activities, searchText, typeIndex, statusIndex, cityIndex, typeOptions, statusOptions, cityOptions } = this.data
    let filtered = activities

    if (searchText) {
      filtered = filtered.filter(item =>
        item.name.includes(searchText) ||
        item.city.includes(searchText) ||
        item.address.includes(searchText)
      )
    }
    if (typeIndex > 0) {
      filtered = filtered.filter(item => item.type === typeOptions[typeIndex])
    }
    if (statusIndex > 0) {
      filtered = filtered.filter(item => item.status === statusOptions[statusIndex])
    }
    if (cityIndex > 0) {
      filtered = filtered.filter(item => item.city === cityOptions[cityIndex])
    }

    this.setData({ filteredActivities: filtered })
  },

  onActivityTap(e) {
    wx.navigateTo({ url: `/pages/activity-detail/activity-detail?id=${e.currentTarget.dataset.id}` })
  },

  onAddActivity() {
    wx.navigateTo({ url: '/pages/add-activity/add-activity' })
  }
})
