import config from 'config'
import dgram from 'node:dgram';
import { Buffer } from 'node:buffer';

export class UDPClient {
  serverIP = config.get('UDPServer.ip')
  serverPort = config.get('UDPServer.port')
  clientPort = config.get('UDPServer.client_port')
  server: any
  result: any
  timer: any
  reqCount: number = 0
  constructor() {
    this.server = dgram.createSocket('udp4')
    this.server.bind(this.clientPort)
    this.server.on('listening', () => {
      console.log('socket 正在监听中')
    })
    this.server.on('message', (bmsg: Buffer, rinfo: any) => {
      console.log(`接收到消息： `)//${bmsg}
      this.result = bmsg
    })
    this.server.on('error', (err:any) => {
      console.log(`server error:\n${err.stack}`);
      this.server.close();
    });
  }
  // 发送并通过回调获取返回
  async sendMsg(msg: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let resMsg
      const bMsg = Buffer.from(msg, 'hex')
      this.server.send(bMsg, this.serverPort, this.serverIP, (err: any) => {
        if (err) resolve('')
        this.timer = setInterval(() => {
          if (this.result !== undefined || this.reqCount === 10) {
            resMsg = this.result
            clearInterval(this.timer)
            this.reqCount = 0
            this.result = undefined
            resolve(resMsg)
          }
          this.reqCount += 1
        }, 100)
      })
    })
  }

  sendMsg2(msg: string): any {
    const bMsg = Buffer.from(msg, 'hex')
    this.server.send(bMsg, this.serverPort, this.serverIP, (err: any) => {
      if (err) return ('')
    })
    return 'sucess'
  }

  async receiveMsg(): Promise<any> {
    return new Promise((resolve, reject) => {
      let resMsg
      this.timer = setInterval(() => {
        if (this.result !== undefined || this.reqCount === 10) {
          resMsg = this.result
          clearInterval(this.timer)
          this.reqCount = 0
          this.result = undefined
          resolve(resMsg)
        }
        this.reqCount += 1
      }, 10)
    })
  }


}