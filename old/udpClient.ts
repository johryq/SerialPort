import dgram from 'dgram';
import { Buffer } from 'node:buffer';
import { DataParse,SendDataType,ReceiveDataType } from './dataParse';
// // 返回包含套接字地址信息的对象。
// const address = udpServer.address();

export class UdpClient {
  dataParse = new DataParse()
  receiveData: ReceiveDataType = {rCmd:'',rCheckNum:''}
  server: any
  recvBufferSize:any
  sendBufferSize:any
  serverIP = '192.168.10.211' //'192.168.10.110'
  serverPort = 1314
  // 请求后返回结果
  result?:object
  // 返回结果是否成功
  isGetResult = false
  isError = false
  constructor() {
    // 初始化socket
    this.server = dgram.createSocket('udp4')
    this.server.bind(88123)
    // 不设定接收，发送字节长度
    // this.recvBufferSize = this.server.getRecvBufferSize();
    // this.sendBufferSize = this.server.getSendBufferSize();
    this.server.on('listening', () => {
      console.log('socket 正在监听中')
    })
    // 接收数据
    this.server.on('message',(bmsg:Buffer,rinfo:any)=>{
      const msg = bmsg.toString('hex') 
      this.receiveData.rCmd = msg
      this.receiveData.rBuffer = bmsg
      this.receiveData = this.dataParse.receiveDataParse(this.receiveData)
      this.result = this.receiveData.rValue
      // 返回内容初始化
      this.receiveData.rValue = {}
      console.log(`server got: ${msg} from ${rinfo.address} : ${rinfo.port}`)
      this.isGetResult = true
    })
  }

  sendTest(): void {  
    const msg = Buffer.from('2150038C', 'hex')
    //eval('').toString(16)
    this.server.send(msg, this.serverPort, this.serverIP, (err: any) => {
      if (err) return "";
      console.log('消息已发送')
    })
  }

  sendMsg(cmd: string, reqtype:string, value:string): void {
    let sendData:SendDataType = {
      isCmd: false,
      sCmd: '',
      sCmd2: '',
    }
    console.log(`cmd:${cmd} type:${reqtype} value:${value}`);
    
    // 构建
    if(reqtype){
      sendData.sType = reqtype
      // 有类型和值
      sendData.sValue = value
    }else{
      // 有命令
      sendData.isCmd = true
      sendData.sCmd = cmd
    }
    sendData =  this.dataParse.sendDataPase(sendData) as SendDataType
    if(sendData.sCmd2 === '') {
      this.isError = true
      console.log('请求错误，消息发送失败');
      return
    }
    sendData.sCmd2 = Buffer.from(sendData.sCmd2, 'hex')
    this.receiveData.rType = sendData.sType
    // 无类型自动解析命令类型并执行
    this.server.send(sendData.sCmd2, this.serverPort, this.serverIP, (err: any) => {
      if (err) return;
      console.log('消息已发送')
    })
  }
}