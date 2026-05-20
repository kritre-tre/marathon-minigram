# API Reference

Base URL in production:

```text
http://81.70.214.183:3000
```

Use HTTPS and a registered mini program request domain before submitting the WeChat mini program for review.

## Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `PUT /api/auth/password`
- `DELETE /api/auth/me`

Login body:

```json
{
  "email": "runner@example.com",
  "password": "123456",
  "role": "user"
}
```

普通用户登录使用邮箱和密码。后端会先在 `OrdinaryUser` 中通过 `email` 查到 `userID`，再到 `user_database` 中校验密码。

Register body:

```json
{
  "email": "runner@example.com",
  "password": "123456"
}
```

注册时不由前端传 `userID`。后端会读取 `OrdinaryUser.userID` 当前最大数字，自动生成 `max(userID) + 1`，再转成字符串写入 `user_database` 和 `OrdinaryUser`。

Admin login body:

```json
{
  "account": "admin",
  "password": "admin123",
  "role": "admin"
}
```

## Activities

- `GET /api/activities?keyword=&type=&status=`
- `GET /api/activities/:id`
- `GET /api/activities/my`
- `POST /api/activities`
- `PUT /api/activities/:id`
- `DELETE /api/activities/:id`

Create activity body:

```json
{
  "name": "南京马拉松",
  "type": "全程马拉松",
  "address": "南京奥体中心",
  "date": "2026-11-30",
  "deadline": "2026-11-15",
  "count": 30000,
  "detail": "赛事详情",
  "contactPerson": "赛事组委会",
  "contactPhone": "13800000000"
}
```

## Registrations

- `POST /api/registrations`
- `GET /api/registrations/my`
- `GET /api/registrations/activity/:activityId`
- `PUT /api/registrations/:id/audit`
- `DELETE /api/registrations/:id`

## Posts

- `GET /api/posts?keyword=&activityId=`
- `GET /api/posts/:id`
- `GET /api/posts/my`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`

## Comments

- `GET /api/comments/post/:postId`
- `GET /api/comments/my`
- `POST /api/comments`
- `DELETE /api/comments/:id`

## Admin

Admin routes require an admin token.

- `GET /api/admin/stats`
- `GET /api/admin/audit/post`
- `GET /api/admin/audit/comment`
- `GET /api/admin/audit/activity`
- `GET /api/admin/audit/user`
- `PUT /api/admin/audit/:type/:id`
- `PUT /api/admin/users/:id/status`

Audit body:

```json
{
  "action": "approve"
}
```

or:

```json
{
  "action": "reject"
}
```
