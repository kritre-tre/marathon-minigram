// pages/add-post/add-post.js
Page({
  data: {
    form: {
      title: '',
      content: ''
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },

  onSubmit() {
    const { form } = this.data

    if (!form.title) {
      wx.showToast({ title: '请输入帖子标题', icon: 'none' })
      return
    }

    if (!form.content) {
      wx.showToast({ title: '请输入帖子内容', icon: 'none' })
      return
    }

    if (form.content.length < 10) {
      wx.showToast({ title: '帖子内容至少10个字', icon: 'none' })
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
