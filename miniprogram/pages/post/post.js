// pages/post/post.js
Page({
  data: {
    searchText: '',
    posts: [
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
    ],
    filteredPosts: []
  },

  onLoad() {
    this.filterPosts()
  },

  onSearchInput(e) {
    this.setData({
      searchText: e.detail.value
    })
  },

  onSearch() {
    this.filterPosts()
  },

  filterPosts() {
    const { posts, searchText } = this.data
    
    let filtered = posts

    if (searchText) {
      filtered = filtered.filter(item => 
        item.title.includes(searchText) || item.content.includes(searchText)
      )
    }

    this.setData({
      filteredPosts: filtered
    })
  },

  onPostTap(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '帖子详情页开发中',
      icon: 'none'
    })
  },

  onLike(e) {
    const id = e.currentTarget.dataset.id
    const posts = this.data.posts.map(item => {
      if (item.id === id) {
        return { ...item, likeCount: item.likeCount + 1 }
      }
      return item
    })
    this.setData({ posts })
    this.filterPosts()
    wx.showToast({
      title: '点赞成功',
      icon: 'success'
    })
  },

  onComment(e) {
    wx.showToast({
      title: '评论功能开发中',
      icon: 'none'
    })
  },

  onShare(e) {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    })
  },

  onAddPost() {
    wx.navigateTo({
      url: '/pages/add-post/add-post'
    })
  }
})
