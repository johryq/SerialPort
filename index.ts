import express, { Express, Request, Response, json } from 'express'
import {router} from './router/index2'

const app: Express = express()

// 跨域
app.use('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})
app.use(express.urlencoded({ extended:true })); 
// 测试
app.get('/', async (req: Request, res: Response) => {
  res.send('server is runing')
})

// 路由
app.use('/api/', router)


app.listen(3333, () => {
  console.log('run server in http://localhost:3333')
})