# Local Development

小程序本地测试时，不连接云服务器 `81.70.214.183`，而是连接本机后端：

```text
http://10.100.231.114:3001
```

## 启动本地后端

```bash
cd server
npm install
copy .env.local.example .env
npm start
```

如果 MySQL 不在本机，请修改 `.env` 里的 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`、`DB_NAME`。

## 微信开发者工具设置

开发阶段需要关闭：

```text
详情 -> 本地设置 -> 不校验合法域名、web-view、TLS 版本以及 HTTPS 证书
```

## 切回云服务器

编辑 `miniprogram/utils/api.js`：

```js
// const BASE_URL = 'http://81.70.214.183:3001'
const BASE_URL = 'http://10.100.231.114:3001'
```

把本地地址注释掉，恢复云服务器地址即可。
