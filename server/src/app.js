require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { fail, ok } = require('./utils/http')

const authRoutes = require('./routes/auth')
const activityRoutes = require('./routes/activities')
const registrationRoutes = require('./routes/registrations')
const postRoutes = require('./routes/posts')
const commentRoutes = require('./routes/comments')
const adminRoutes = require('./routes/admin')

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => ok(res, { service: 'marathon-server' }))

app.use('/api/auth', authRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/registrations', registrationRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/admin', adminRoutes)

app.use((req, res) => fail(res, 404, '接口不存在'))

app.use((error, req, res, next) => {
  console.error(error)
  return fail(res, 500, '服务器内部错误')
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
  console.log(`Marathon server listening on port ${port}`)
})

