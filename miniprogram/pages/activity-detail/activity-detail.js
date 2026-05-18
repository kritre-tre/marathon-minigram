// pages/activity-detail/activity-detail.js
Page({
  data: {
    activity: {}
  },

  onLoad(options) {
    const id = parseInt(options.id) || 1
    this.loadActivity(id)
  },

  loadActivity(id) {
    // 模拟数据
    const activities = {
      1: {
        id: 1,
        name: '南京马拉松',
        city: '南京市',
        address: '南京奥林匹克体育中心',
        date: '2025-11-30',
        deadline: '2025-11-15',
        type: '全程马拉松',
        count: 30000,
        status: '招募中',
        intro: '南京马拉松是中国田径协会金牌赛事，赛道途经南京著名景点，让您在奔跑中感受金陵古都的魅力。',
        detail: '赛事起点：南京奥林匹克体育中心\n赛事终点：玄武湖公园\n\n赛事路线：途经中山陵、明孝陵、紫金山等著名景点\n\n报名费用：全程马拉松200元\n\n注意事项：\n1. 参赛者需年满18周岁\n2. 需提供有效健康证明\n3. 建议购买赛事保险',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      2: {
        id: 2,
        name: '上海马拉松',
        city: '上海市',
        address: '外滩',
        date: '2025-11-20',
        deadline: '2025-11-05',
        type: '全程马拉松',
        count: 38000,
        status: '招募中',
        intro: '上海国际马拉松赛是中国最具影响力的马拉松赛事之一，赛道穿越上海城市地标。',
        detail: '赛事起点：外滩金牛广场\n赛事终点：上海体育场\n\n赛事路线：途经东方明珠、陆家嘴金融中心、南京路等\n\n报名费用：全程马拉松300元',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      3: {
        id: 3,
        name: '北京马拉松',
        city: '北京市',
        address: '天安门广场',
        date: '2025-10-15',
        deadline: '2025-09-30',
        type: '全程马拉松',
        count: 30000,
        status: '已结束',
        intro: '北京马拉松始创于1981年，是中国最早的国际马拉松赛事。',
        detail: '赛事起点：天安门广场\n赛事终点：国家体育场（鸟巢）\n\n赛事路线：长安街、奥林匹克公园等',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      4: {
        id: 4,
        name: '厦门马拉松',
        city: '厦门市',
        address: '厦门国际会展中心',
        date: '2025-12-10',
        deadline: '2025-11-25',
        type: '全程马拉松',
        count: 35000,
        status: '招募中',
        intro: '厦门马拉松被誉为"中国最美马拉松"，赛道沿着环岛路，海风相伴。',
        detail: '赛事起点：厦门国际会展中心\n赛事终点：厦门会展中心\n\n赛事路线：环岛路全程海景赛道',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      }
    }

    const activity = activities[id] || activities[1]
    this.setData({ activity })
  },

  onSignUp() {
    wx.showModal({
      title: '确认报名',
      content: `确定要报名参加"${this.data.activity.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '报名成功',
            icon: 'success'
          })
        }
      }
    })
  }
})
