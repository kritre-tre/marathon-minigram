/**
 * 模拟数据模块
 * 用于提供演示数据
 */

// 轮播图数据
const banners = [
  {
    id: 1,
    title: '2025南京马拉松',
    subtitle: '金陵古都，活力开跑',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 2,
    title: '上海国际马拉松',
    subtitle: '东方明珠，精彩无限',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    title: '北京马拉松',
    subtitle: '首都风采，激情奔跑',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 4,
    title: '厦门马拉松',
    subtitle: '最美赛道，海风相伴',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
]

// 活动数据
const activities = [
  {
    id: 1,
    name: '南京马拉松',
    city: '南京',
    address: '南京奥林匹克体育中心',
    date: '2025-11-30',
    deadline: '2025-11-15',
    type: '全程马拉松',
    count: 30000,
    status: '招募中',
    intro: '南京马拉松是中国田径协会金牌赛事，赛道途经南京著名景点，让您在奔跑中感受金陵古都的魅力。',
    detail: '赛事起点：南京奥林匹克体育中心\n赛事终点：玄武湖公园\n\n赛事路线：途经中山陵、明孝陵、紫金山等著名景点\n\n报名费用：全程马拉松200元',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 2,
    name: '上海马拉松',
    city: '上海',
    address: '外滩金牛广场',
    date: '2025-11-20',
    deadline: '2025-11-05',
    type: '全程马拉松',
    count: 38000,
    status: '招募中',
    intro: '上海国际马拉松赛是中国最具影响力的马拉松赛事之一，赛道穿越上海城市地标。',
    detail: '赛事起点：外滩金牛广场\n赛事终点：上海体育场\n\n赛事路线：途经东方明珠、陆家嘴金融中心、南京路等',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    name: '北京马拉松',
    city: '北京',
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
  {
    id: 4,
    name: '厦门马拉松',
    city: '厦门',
    address: '厦门国际会展中心',
    date: '2025-12-10',
    deadline: '2025-11-25',
    type: '全程马拉松',
    count: 35000,
    status: '招募中',
    intro: '厦门马拉松被誉为"中国最美马拉松"，赛道沿着环岛路，海风相伴。',
    detail: '赛事起点：厦门国际会展中心\n赛事终点：厦门会展中心\n\n赛事路线：环岛路全程海景赛道',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 5,
    name: '杭州半程马拉松',
    city: '杭州',
    address: '黄龙体育中心',
    date: '2025-11-15',
    deadline: '2025-11-01',
    type: '半程马拉松',
    count: 20000,
    status: '招募中',
    intro: '杭州半程马拉松途经西湖风景区，是一场人文与自然完美融合的赛事。',
    detail: '赛事起点：黄龙体育中心\n赛事路线：途经西湖、断桥、雷峰塔等景点',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    id: 6,
    name: '广州迷你马拉松',
    city: '广州',
    address: '天河体育中心',
    date: '2025-12-05',
    deadline: '2025-11-20',
    type: '迷你马拉松',
    count: 10000,
    status: '招募中',
    intro: '广州迷你马拉松适合跑步入门者，感受马拉松的魅力。',
    detail: '赛事起点：天河体育中心\n赛事距离：5公里\n\n适合人群：跑步初学者、家庭亲子',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
  }
]

// 主题帖数据
const posts = [
  {
    id: 1,
    title: '分享我的首马经历',
    content: '今天完成了我人生中的第一个马拉松，真的太激动了！从去年开始准备，每天坚持训练，终于在今天完成了这个目标。全程42.195公里，用时4小时15分钟，虽然不是很快，但对我来说已经是最好的成绩了。',
    userName: '黄启佳',
    userAvatar: '黄',
    time: '2小时前',
    likeCount: 128,
    commentCount: 32
  },
  {
    id: 2,
    title: '马拉松训练计划分享',
    content: '分享一下我的12周马拉松备战计划，希望对准备参赛的小伙伴有帮助。第一周：以恢复跑为主，每天5公里慢跑...',
    userName: '跑步达人',
    userAvatar: '跑',
    time: '5小时前',
    likeCount: 256,
    commentCount: 45
  },
  {
    id: 3,
    title: '南京马拉松赛道风景太美了',
    content: '刚跑完南京马拉松，不得不说赛道真的太美了！从玄武湖出发，经过中山陵、明孝陵，一路上都是金陵古都的美景...',
    userName: '风景跑者',
    userAvatar: '风',
    time: '1天前',
    likeCount: 189,
    commentCount: 28
  },
  {
    id: 4,
    title: '如何选择合适的跑鞋',
    content: '作为一个跑了十年马拉松的老跑者，今天来和大家聊聊如何选择合适的跑鞋。首先要了解自己的足型...',
    userName: '装备专家',
    userAvatar: '装',
    time: '2天前',
    likeCount: 312,
    commentCount: 67
  }
]

// 筛选选项
const filterOptions = {
  types: ['全部类型', '全程马拉松', '半程马拉松', '迷你马拉松', '接力马拉松'],
  statuses: ['全部状态', '招募中', '已结束'],
  cities: ['全部城市', '北京', '上海', '南京', '杭州', '厦门', '广州', '深圳']
}

module.exports = {
  banners,
  activities,
  posts,
  filterOptions
}
