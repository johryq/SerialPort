import express,{ Router, Request, Response, } from 'express'
import { UdpClient } from './udpClient'

export const router: Router = express.Router()
let timer: any
const udpClient = new UdpClient()

function finallySendMsg(data: any, state = 200) {
  return {
    state,
    data
  }
}

router.get('/test', async (req: Request, res: Response) => {
  //发送请求
  udpClient.sendTest()
  let count = 0
  timer = setInterval(() => {
    count+=1
    // 返回数据
    if (udpClient.isGetResult) {
      // 请求失败或者无法解析
      if(count ===10){
        udpClient.isGetResult = false
        res.json(finallySendMsg({ data: udpClient.result,state:500 }))
        clearInterval(timer)
      }
      udpClient.isGetResult = false
      // dataParse(udpClient.result)
      // 返回数据
      res.json(finallySendMsg({ data: udpClient.result }))
      clearInterval(timer)
    }
  }, 100)
})

// /set?cmd=命令
// /set?type=类型，数值
router.get('/set', (req: Request, res: Response) => {
  const reqCmd: any = req.query.cmd
  const reqType: any = req.query.type
  const reqValue:any = req.query.value
  let count = 0

  // 发送请求
  udpClient.sendMsg(reqCmd, reqType, reqValue)
  // 接收应答
  timer = setInterval(() => {
    count+=1
    if (udpClient.isGetResult) {
      // 10次获取不到返回，直接返回错误
      udpClient.isGetResult = false
      res.json(finallySendMsg(udpClient.result))
      udpClient.result = {}
      clearInterval(timer)
      count = 0
      return
    }
    // 接收命令错误
    if( udpClient.isError || count === 10){
      udpClient.isError = false
      res.json(finallySendMsg({ data: udpClient.result,state:500 }))
        udpClient.result = {}
        clearInterval(timer)
        count = 0
        return
    }
  }, 100)
})

router.get('/:name/:cmd', (req: Request, res: Response) => {
  const deviceTypeNumber = req.params
})