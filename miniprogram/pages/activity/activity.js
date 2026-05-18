// pages/activity/activity.js
Page({
  data: {
    searchText: '',
    typeIndex: 0,
    statusIndex: 0,
    cityIndex: 0,
    typeOptions: ['全部类型', '全程马拉松', '半程马拉松', '迷你马拉松', '接力马拉松'],
    statusOptions: ['全部状态', '招募中', '已结束'],
    cityOptions: ['全部城市', '北京', '上海', '南京', '杭州', '厦门', '广州', '深圳'],
    activities: [
      {
        id: 1,
        name: '南京马拉松',
        city: '南京',
        date: '2025-11-30',
        status: '招募中',
        type: '全程马拉松',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        id: 2,
        name: '上海马拉松',
        city: '上海',
        date: '2025-11-20',
        status: '招募中',
        type: '全程马拉松',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        id: 3,
        name: '北京马拉松',
        city: '北京',
        date: '2025-10-15',
        status: '已结束',
        type: '全程马拉松',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        id: 4,
        name: '厦门马拉松',
        city: '厦门',
        date: '2025-12-10',
        status: '招募中',
        type: '全程马拉松',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      },
      {
        id: 5,
        name: '杭州半程马拉松',
        city: '杭州',
        date: '2025-11-15',
        status: '招募中',
        type: '半程马拉松',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      },
      {
        id: 6,
        name: '广州迷你马拉松',
        city: '广州',
        date: '2025-12-05',
        status: '招募中',
        type: '迷你马拉松',
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
      }
    ],
    filteredActivities: []
  },

  onLoad() {
    this.filterActivities()
  },

  onSearchInput(e) {
    this.setData({
      searchText: e.detail.value
    })
  },

  onSearch() {
    this.filterActivities()
  },

  onTypeChange(e) {
    this.setData({
      typeIndex: e.detail.value
    })
    this.filterActivities()
  },

  onStatusChange(e) {
    this.setData({
      statusIndex: e.detail.value
    })
    this.filterActivities()
  },

  onCityChange(e) {
    this.setData({
      cityIndex: e.detail.value
    })
    this.filterActivities()
  },

  filterActivities() {
    const { activities, searchText, typeIndex, statusIndex, cityIndex, typeOptions, statusOptions, cityOptions } = this.data
    
    let filtered = activities

    // 搜索过滤
    if (searchText) {
      filtered = filtered.filter(item => 
        item.name.includes(searchText) || item.city.includes(searchText)
      )
    }

    // 类型过滤
    if (typeIndex > 0) {
      filtered = filtered.filter(item => item.type === typeOptions[typeIndex])
    }

    // 状态过滤
    if (statusIndex > 0) {
      filtered = filtered.filter(item => item.status === statusOptions[statusIndex])
    }

    // 城市过滤
    if (cityIndex > 0) {
      filtered = filtered.filter(item => item.city === cityOptions[cityIndex])
    }

    this.setData({
      filteredActivities: filtered
    })
  },

  onActivityTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/activity-detail/activity-detail?id=${id}`
    })
  },

  onAddActivity() {
    wx.navigateTo({
      url: '/pages/add-activity/add-activity'
    })
  }
})
