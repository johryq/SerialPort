// import config from 'config'
import express, { Router, Request, Response, } from 'express'
import { deviceClassify, unitType } from '../type/DeviceTypeEnum'
import { MQH_3Y4Y, MQH_3Y4Y_CmdName } from '../devices/MQH_3Y4Y'
import config from 'config';

export const router: Router = express.Router()
const deviceName = config.get('uniType')
let device: any

// 获取数据
router.get('/:deviceName/:cmd',async (req: Request, res: Response) => {
  const reqDeviceName = req.params.deviceName.toLowerCase()
  const cmd = req.params.cmd.toLowerCase()
  if (!deviceName) {
    res.json({ result: 0, data: '配置设备类型错误' })
    return
  }
  // 配置设备类型是否正确
  switch (reqDeviceName) {
    case deviceClassify.AmbientParameterMeter:
      if(!device)  device = new MQH_3Y4Y()
      // 请求命令匹配
      switch (cmd) {
        case MQH_3Y4Y_CmdName.getDevInfo: {
          res.json(await device.getDevInfo())
          break
        }
        case MQH_3Y4Y_CmdName.getRealTimeData: {
          res.json(await device.getRealTimeData())
          break
        }
        case MQH_3Y4Y_CmdName.getRealTimeStatus: {
          res.json(await device.getRealTimeStatus())
          break
        }
        default: {
          res.json({ result: 0, data: '命令错误' })//Without this command
          break
        }
      }
    default:
      res.json({ result: 0, data: '未知设备类型错误' })
      return
  }
})

// 标定数据
router.post('/:deviceName/:cmd',async (req: Request, res: Response) => {
  const reqDeviceName = req.params.deviceName.toLowerCase()
  const cmd = req.params.cmd.toLowerCase()
  const reqData = req.body
  
  if (!deviceName) {
    res.json({ result: 0, data: '配置设备类型错误' })
    return
  }
  // 配置设备类型是否正确
  switch (reqDeviceName) {
    case deviceClassify.AmbientParameterMeter:
      if(!device)  device = new MQH_3Y4Y()
      // 请求命令匹配
      switch (cmd) {
        case MQH_3Y4Y_CmdName.calibration: {
          res.json(await device.calibration(reqData))
          break
        }
        default: {
          res.json({ result: 0, data: '命令错误' })//Without this command
          return
        }
      }
      break
    default:
      res.json({ result: 0, data: '未知设备类型错误' })
      return
  }

})