# 马拉松参赛助手 微信小程序

这是一个基于"马拉松参赛助手"Android App 开发的微信小程序版本，保持一致的界面和功能。

## 📱 功能介绍

### 主要功能
- **用户认证**：登录、注册
- **首页**：轮播图展示热门马拉松赛事
- **赛事活动**：搜索、查看、发布赛事活动
- **主题帖**：搜索、查看、发布主题帖
- **个人中心**：查看/编辑个人信息、管理已报名活动

### 页面结构
- `pages/splash/` - 启动页
- `pages/login/` - 登录页
- `pages/register/` - 注册页
- `pages/index/` - 首页（轮播图 + 热门赛事）
- `pages/activity/` - 赛事活动列表
- `pages/activity-detail/` - 赛事详情页
- `pages/add-activity/` - 发布赛事活动
- `pages/post/` - 主题帖列表
- `pages/add-post/` - 发布主题帖
- `pages/profile/` - 个人中心
- `pages/edit-profile/` - 编辑个人资料

## 🎨 设计风格

应用采用与 Android App 一致的粉色系设计：
- 主色调：#E8A5A5
- 深色调：#D4908F
- 浅色调：#F5D5D5
- 背景色：#FFF5F5

## 🛠️ 开发环境

### 准备工作
1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 注册微信小程序账号获取 AppID（或使用测试号）

### 导入项目
1. 打开微信开发者工具
2. 选择「导入项目」
3. 项目目录选择 `marathon-WeChat` 文件夹
4. AppID 可以使用测试号或填入你的小程序 AppID
5. 点击「导入」

### 添加 TabBar 图标
由于 SVG 格式不被 tabBar 支持，请准备以下 PNG 图标（建议尺寸 81x81 像素）：
- `miniprogram/images/tab/home.png` - 首页图标
- `miniprogram/images/tab/home-active.png` - 首页选中图标
- `miniprogram/images/tab/activity.png` - 赛事活动图标
- `miniprogram/images/tab/activity-active.png` - 赛事活动选中图标
- `miniprogram/images/tab/post.png` - 主题帖图标
- `miniprogram/images/tab/post-active.png` - 主题帖选中图标
- `miniprogram/images/tab/profile.png` - 个人中心图标
- `miniprogram/images/tab/profile-active.png` - 个人中心选中图标

或者可以移除 app.json 中 tabBar 的 iconPath 和 selectedIconPath 配置，使用纯文字导航。

## 📁 项目结构

```
marathon-WeChat/
├── project.config.json      # 项目配置
├── miniprogram/
│   ├── app.js              # 小程序入口
│   ├── app.json            # 全局配置
│   ├── app.wxss            # 全局样式
│   ├── sitemap.json        # 小程序索引配置
│   ├── images/             # 图片资源
│   │   └── tab/            # TabBar 图标
│   └── pages/              # 页面文件
│       ├── splash/         # 启动页
│       ├── login/          # 登录页
│       ├── register/       # 注册页
│       ├── index/          # 首页
│       ├── activity/       # 赛事活动
│       ├── activity-detail/# 赛事详情
│       ├── add-activity/   # 发布赛事
│       ├── post/           # 主题帖
│       ├── add-post/       # 发布帖子
│       ├── profile/        # 个人中心
│       └── edit-profile/   # 编辑资料
└── README.md               # 说明文档
```

## 📝 注意事项

1. 首次导入需要等待开发者工具编译
2. 确保已安装最新版微信开发者工具
3. TabBar 图标需要替换为 PNG 格式
4. 本项目使用本地存储模拟数据，未接入真实后端

## 🚀 后续开发建议

1. 接入微信登录能力
2. 添加云开发后端
3. 实现真实的数据存储
4. 添加图片上传功能
5. 实现分享功能
6. 添加地图定位功能

## 📄 License

MIT License
