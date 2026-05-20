/**
 * 管理后台模拟数据模块
 */

// 待审核主题帖
const pendingPosts = [
  {
    id: 101,
    title: '推荐一款超轻跑鞋',
    content: '最近入手了Nike Vaporfly，真的又轻又弹，5分配速轻松达成，强烈推荐给追求速度的跑友！',
    author: '跑步小白',
    time: '2025-05-06 14:30',
    status: 'pending'
  },
  {
    id: 102,
    title: '马拉松补给策略分享',
    content: '跑了5个全马，总结了一套补给方案：赛前3天开始碳水加载，赛中每5公里补充能量胶...',
    author: '老跑者',
    time: '2025-05-06 10:15',
    status: 'pending'
  },
  {
    id: 103,
    title: '周末约跑玄武湖',
    content: '周六早上6点玄武湖门口集合，一起拉个LSD，配速6分左右，距离15-20公里，欢迎参加！',
    author: '南京跑团',
    time: '2025-05-05 20:00',
    status: 'pending'
  },
  {
    id: 104,
    title: '跑后拉伸动作大全',
    content: '整理了10个跑后必做的拉伸动作，每个动作保持30秒，可以有效减少肌肉酸痛...',
    author: '康复教练',
    time: '2025-05-05 16:45',
    status: 'approved'
  }
]

// 待审核评论
const pendingComments = [
  {
    id: 201,
    content: '写得很好，收藏了！',
    author: '跑步爱好者',
    postTitle: '分享我的首马经历',
    time: '2025-05-06 16:00',
    status: 'pending'
  },
  {
    id: 202,
    content: '请问这个配速对于新手来说会不会太快了？建议循序渐进。',
    author: '新手跑者',
    postTitle: '马拉松训练计划分享',
    time: '2025-05-06 15:30',
    status: 'pending'
  },
  {
    id: 203,
    content: '广告帖，请管理员处理，这个链接看起来有问题。',
    author: '热心用户',
    postTitle: '分享我的首马经历',
    time: '2025-05-06 14:00',
    status: 'pending'
  },
  {
    id: 204,
    content: '请问南京马拉松的报名费是多少？',
    author: '想跑马拉松',
    postTitle: '南京马拉松赛道风景太美了',
    time: '2025-05-05 22:10',
    status: 'pending'
  }
]

// 待审核赛事
const pendingActivities = [
  {
    id: 301,
    name: '合肥马拉松',
    city: '合肥',
    address: '合肥体育中心',
    date: '2026-01-15',
    deadline: '2025-12-31',
    type: '全程马拉松',
    count: 15000,
    status: 'pending',
    intro: '合肥首届全程马拉松，赛道环绕巢湖，感受大湖名城的独特魅力。',
    detail: '赛事起点：合肥体育中心\n赛事终点：巢湖之滨\n\n赛事路线：途经合肥滨湖新区、巢湖沿岸\n\n报名费用：全程马拉松180元',
    submitter: '合肥体育局'
  },
  {
    id: 302,
    name: '武汉马拉松',
    city: '武汉',
    address: '武汉江滩',
    date: '2026-03-20',
    deadline: '2026-03-01',
    type: '全程马拉松',
    count: 20000,
    status: 'pending',
    intro: '武汉马拉松，一城两江三镇四桥五湖，最美赛道等你来跑。',
    detail: '赛事起点：武汉江滩\n赛事终点：东湖风景区\n\n赛事路线：途经长江大桥、黄鹤楼、东湖绿道\n\n报名费用：全程马拉松220元',
    submitter: '武汉赛事组委会'
  },
  {
    id: 303,
    name: '深圳湾半程马拉松',
    city: '深圳',
    address: '深圳湾公园',
    date: '2026-02-14',
    deadline: '2026-02-01',
    type: '半程马拉松',
    count: 12000,
    status: 'pending',
    intro: '深圳湾公园沿海赛道，风景优美，适合刷新个人最好成绩。',
    detail: '赛事起点：深圳湾公园日出剧场\n赛事终点：深圳湾大桥\n\n赛事路线：深圳湾公园沿海步道\n\n报名费用：半程马拉松150元',
    submitter: '深圳跑协'
  }
]

// 注册用户列表
const registeredUsers = [
  { id: 1, username: 'zhangsan', name: '张三', phone: '138****1234', email: 'zhangsan@test.com', gender: '男', registerTime: '2025-04-01' },
  { id: 2, username: 'lisi', name: '李四', phone: '139****5678', email: 'lisi@test.com', gender: '女', registerTime: '2025-04-03' },
  { id: 3, username: 'wangwu', name: '王五', phone: '137****9012', email: 'wangwu@test.com', gender: '男', registerTime: '2025-04-10' },
  { id: 4, username: 'zhaoliu', name: '赵六', phone: '136****3456', email: 'zhaoliu@test.com', gender: '女', registerTime: '2025-04-15' },
  { id: 5, username: 'sunqi', name: '孙七', phone: '135****7890', email: 'sunqi@test.com', gender: '男', registerTime: '2025-04-20' },
  { id: 6, username: 'admin', name: '管理员', phone: '130****0001', email: 'admin@marathon.com', gender: '男', registerTime: '2025-01-01' }
]

// 审核操作记录
let auditLogs = [
  { id: 1, type: 'post', targetId: 104, action: 'approve', operator: '管理员', time: '2025-05-06 18:00' }
]

function getStats() {
  return {
    pendingPosts: pendingPosts.filter(p => p.status === 'pending').length,
    pendingComments: pendingComments.filter(c => c.status === 'pending').length,
    pendingActivities: pendingActivities.filter(a => a.status === 'pending').length,
    totalUsers: registeredUsers.length
  }
}

function approveItem(type, id) {
  let item = null
  if (type === 'post') {
    item = pendingPosts.find(p => p.id === id)
    if (item) item.status = 'approved'
  } else if (type === 'comment') {
    item = pendingComments.find(c => c.id === id)
    if (item) item.status = 'approved'
  } else if (type === 'activity') {
    item = pendingActivities.find(a => a.id === id)
    if (item) item.status = 'approved'
  }
  if (item) {
    auditLogs.push({
      id: auditLogs.length + 1,
      type,
      targetId: id,
      action: 'approve',
      operator: '管理员',
      time: new Date().toLocaleString('zh-CN')
    })
  }
  return item
}

function rejectItem(type, id) {
  let item = null
  if (type === 'post') {
    item = pendingPosts.find(p => p.id === id)
    if (item) item.status = 'rejected'
  } else if (type === 'comment') {
    item = pendingComments.find(c => c.id === id)
    if (item) item.status = 'rejected'
  } else if (type === 'activity') {
    item = pendingActivities.find(a => a.id === id)
    if (item) item.status = 'rejected'
  }
  if (item) {
    auditLogs.push({
      id: auditLogs.length + 1,
      type,
      targetId: id,
      action: 'reject',
      operator: '管理员',
      time: new Date().toLocaleString('zh-CN')
    })
  }
  return item
}

module.exports = {
  pendingPosts,
  pendingComments,
  pendingActivities,
  registeredUsers,
  auditLogs,
  getStats,
  approveItem,
  rejectItem
}
