import  { MQH_3Y4Y_Receive_DP }  from './MQH_3Y4Y_DP';
// import { UdpClient } from '../udpClient';
import {IAmbientParameterMeter, IDeviceReturn} from '../type/IDevice'
import { UDPClient } from '../common/UDPClient'
import { deviceClassify, unitType } from '../type/DeviceTypeEnum';


export class MQH_3Y4Y implements IAmbientParameterMeter {
  // 设备序列号
  id = '0';
  // 设备分类
  classify = deviceClassify.AmbientParameterMeter;
  // 设备名称-设备型号代码
  name =  unitType.MQH_3Y4Y;
  // cmdName: MQH_3Y4Y_CmdName
  udpClient: UDPClient
  timer: any
  reqCount:number = 0
  constructor(){
    this.udpClient = new UDPClient()
  }
  // 运行
  launch(){
    return this.setResultData2()
  };
  // 停止
  // stop: () => IDeviceReturn;
  // 重启
  // restart: () => IDeviceReturn;
  // 重置
  // reset: () => IDeviceReturn;
  // 获取设备信息
  async getDevInfo(){
      // const reqResult = this.udpClient.sendMsg2(MQH_3Y4Y_ReqCmd.Test)   
      const reqResult = await this.udpClient.sendMsg(MQH_3Y4Y_ReqCmd.Test)   

      if(reqResult ==='' || reqResult === undefined){
        return({state:0,data:'获取数据请求失败'})
      }else {
        const data = MQH_3Y4Y_Receive_DP(reqResult)
        return({state:0,data})
      }
    // console.log(p);
    
  };
  // 获取设备实时信息
  async getRealTimeData(){
    const reqResult = await this.udpClient.sendMsg(MQH_3Y4Y_ReqCmd.Test)      
    if(reqResult ==='' || reqResult === undefined){
      return({state:0,data:'获取数据请求失败'})
    }else {
      const data = MQH_3Y4Y_Receive_DP(reqResult)
      return({state:0,data})
    }
  };

  // 获取设备实时状态
  getRealTimeStatus(){
    return this.setResultData()
  };
  // 校准
  calibration(){
    return this.setResultData()
  };

  setResultData(){
    return new Promise( (resolve,reject) => {
      resolve('22')
    })
  }
  setResultData2(){
    return{
      state: 0,
      data: {}
    }
  }
  getUDPClientResult(): Promise<any>{
    return new Promise( (resolve,reject)  => {
      let resMsg
      this.timer = setInterval(() => {
        if (this.udpClient.result !== undefined || this.reqCount === 10) {
          resMsg = this.udpClient.result
          clearInterval(this.timer)
          this.reqCount = 0
          this.udpClient.result = undefined
          resolve(resMsg)
        }
        this.reqCount += 1
      }, 100)
    })
  
  }
}

export enum MQH_3Y4Y_CmdName {
  getDevInfo = 'getdevinfo',
  getRealTimeData = 'getrealtimedata',
  getRealTimeStatus = 'getrealtimestatus',
  calibration = 'calibration'
}

enum MQH_3Y4Y_ReqCmd {
  Temperature = '215105',
  // 湿度 humidity
  Humidity = '215205',
  // 气压 kPa
  KPa = '215305',
  // 油温 Oil temperature
  OilTemperature = '216105',

  Test = '2150038c',
  Version = '21550387',
  Reset ='21560386',
  GetNumber = '21580384',
  HandShake = '21630379',
  Test4Y = '21640378'
}

