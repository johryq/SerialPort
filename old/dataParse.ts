import { SendType, ReceiveType } from './setType';

export interface SendDataType {
  isCmd: boolean
  sType?: string
  sValue?: string
  sCmd: string | ''
  sCheckSum?: string
  sCmd2?: any
}

export interface ReceiveDataType {
  rType?: string,
  rCmd: string,
  rValue?: any,
  rBuffer?: Buffer,
  rCheckNum: string
}

enum SetStatus {
  SUCESS,
  ERROR
}

export class DataParse {

  // 发送接收的是温度还是其他
  // 发送数据解析
  sendDataPase(sendData: SendDataType, params?: any) {
    let data: SendDataType | undefined
    // 直接请求的命令 http://localhost/api/2150038c
    data = this.getSendCmd(sendData)
    // http://localhost/api?type=2051&value=50
    // cmd + type
    return data
  }

  // 接收数据解析
  receiveDataParse(receiveData: ReceiveDataType) {
    let cheNum = receiveData.rCmd.substring(receiveData.rCmd.length - 2, receiveData.rCmd.length)
    receiveData.rCheckNum = this.getCheckNumber(receiveData.rType, '', receiveData.rBuffer, false)
    console.log(`\nchcknum: ${cheNum} computedCK:${receiveData.rCheckNum}`);

    // 判断校验和是否正确
    if (cheNum !== receiveData.rCheckNum && receiveData.rType !== SendType.Reset && receiveData.rType !== SendType.HandShake) {
      receiveData.rValue = {
        error: 'check number error'
      }
      return receiveData
    }

    // 已有类型，通过类型判断接收代码
    if (receiveData.rType) {
      let state = ''
      let Temperature = ''
      let Humidity = ''
      let KPa = ''
      let OilTemperature = ''
      switch (receiveData.rType) {
        // 测试
        case SendType.Test:
          // let temp = receiveData.rCmd.substring(15, 19)
          receiveData.rType = ReceiveType.Test

          Temperature = (parseInt(receiveData.rCmd.substring(6, 10), 16) / 10).toString()
          // 二进制补码
          // let bm = parseInt(receiveData.rCmd.substring(6, 10),16).toString(2)
          // // 符号位
          // let fh = bm.substring(0,1)
          // // 
          // let sm = Number(bm.substring(1,bm.length))
          // let val = ~sm + 1 
          // let v2 = fh + val

          Humidity = (parseInt(receiveData.rCmd.substring(10, 14), 16) / 10).toString()
          KPa = (parseInt(receiveData.rCmd.substring(14, 18), 16) / 10).toString()
          receiveData.rValue = {
            Temperature,
            Humidity,
            KPa
          }
          break
        // 温度
        case SendType.Temperature:
          receiveData.rType = ReceiveType.Temperature
          receiveData.rValue = this.getResiveDataState(receiveData.rCmd, 'SetTemperature')
          break
        // 湿度
        case SendType.Humidity:
          receiveData.rType = ReceiveType.Humidity
          receiveData.rValue = this.getResiveDataState(receiveData.rCmd, 'SetHumidity')
          break
        // 气压
        case SendType.KPa:
          receiveData.rType = ReceiveType.KPa
          receiveData.rValue = this.getResiveDataState(receiveData.rCmd, 'SetAtmosherePressure')
          break
        // 版本
        case SendType.Version:
          receiveData.rType = ReceiveType.Version
          receiveData.rValue = {
            'Version': parseInt(receiveData.rCmd.substring(receiveData.rCmd.length - 4, receiveData.rCmd.length - 2), 16) / 10
          }
          break
        case SendType.Reset:
          // 恢复出厂
          receiveData.rType = ReceiveType.Reset
          receiveData.rValue = {
            "Reset": receiveData.rCmd === ReceiveType.Reset ? SetStatus[SetStatus.SUCESS] : SetStatus[SetStatus.ERROR]
          }
          break
        case SendType.GetNumber:
          // 序列号
          receiveData.rType = ReceiveType.GetNumber
          const rBuffer = receiveData.rBuffer as Buffer
          let bufferArray = new ArrayBuffer(rBuffer.length);
          let view = new Uint8Array(bufferArray);
          for (var i = 3; i < rBuffer.length - 1; ++i) {
            view[i - 3] = rBuffer[i];
          }
          let value = ''
          view.forEach((v, index) => {
            value += String.fromCharCode(Number(v.toString(16)))
          })
          receiveData.rValue = {
            'ID': value
          }
          break
        case SendType.OilTemperature:
          // 油温
          receiveData.rType = ReceiveType.OilTemperature
          receiveData.rValue = this.getResiveDataState(receiveData.rCmd, 'SetOilTemperature')
          break
        case SendType.HandShake:
          // 握手
          receiveData.rType = ReceiveType.HandShake
          receiveData.rValue = {
            "HandShake": receiveData.rCmd === ReceiveType.HandShake ? SetStatus[SetStatus.SUCESS] : SetStatus[SetStatus.ERROR]
          }
          break
        case SendType.Test4Y:
          // 4Y机器专有测试
          receiveData.rType = SendType.Test4Y
          // const array = ['0','1','1','F']
          let tp = receiveData.rCmd.substring(6, 10)
          let op = receiveData.rCmd.substring(18, 22)
          Humidity = (parseInt(receiveData.rCmd.substring(10, 14), 16) / 10).toString()
          KPa = (parseInt(receiveData.rCmd.substring(14, 18), 16) / 10).toString()
          
          if (Number(parseInt(tp.substring(0, 1),16).toString(2).substring(0, 1)) === 1) {
            Temperature = this.complementCodeParse(parseInt(tp, 16))
          }
          else {
            Temperature = (parseInt(tp, 16) / 10).toString()
          }
          if (Number(parseInt(op.substring(0, 1),16).toString(2).substring(0, 1)) === 1) {
            OilTemperature = this.complementCodeParse(parseInt(op,16))
          } else {
            OilTemperature = (parseInt(op, 16) / 10).toFixed(1)
          }

          receiveData.rValue = {
            Temperature,
            Humidity,
            KPa,
            OilTemperature
          }
          break
        default:
          receiveData.rType = ReceiveType.Test4Y
          Temperature = (parseInt(receiveData.rCmd.substring(6, 10), 16) / 10).toString()
          Humidity = (parseInt(receiveData.rCmd.substring(10, 14), 16) / 10).toString()
          KPa = (parseInt(receiveData.rCmd.substring(14, 18), 16) / 10).toString()
          OilTemperature = (parseInt(receiveData.rCmd.substring(18, 22), 16) / 10).toString()
          receiveData.rValue = {
            Temperature,
            Humidity,
            KPa,
            OilTemperature
          }
          break
      }
    }
    return receiveData
  }

  getSendCmd(sendData: SendDataType) {
    let sendMsg
    // 直接执行命令
    if (sendData.isCmd) {
      sendMsg = sendData.sCmd.slice(0, 4)
      sendData.sCmd2 = sendData.sCmd
      switch (sendMsg) {
        // 测试
        case '2150':
          sendData.sType = SendType.Test
          sendData.sCmd = SendType.Test + '038c'
          if (sendData.sCmd2 === '') {
            sendData.sCmd2 = sendData.sCmd
          }
          break
        case '2151':
          // 温度
          sendData.sType = SendType.Temperature + '05'
          if (sendData.sCmd2 === '') {
            const wendu = (Number(sendData.sValue) * 100).toString(16)
            let tmpCmd = sendData.sType + wendu
            // sendData.sCmd2 = tmpCmd + this.getCheckNumber(Buffer.from((Uint16Array.from(Number(tmpCmd,16))))
          }
          break
        case '2152':
          // 湿度
          sendData.sType = SendType.Humidity + '05'
          if (sendData.sCmd2 === '') {
            const wendu = (Number(sendData.sValue) * 100).toString(16)
            let tmpCmd = sendData.sType + wendu
            sendData.sCmd2 = tmpCmd //+ this.getCheckNumber(tmpCmd)
          }
          sendData.sCheckSum = this.getCheckNumber(sendData.sCmd2)
          break
        case '2153':
          // 气压
          sendData.sType = SendType.KPa + '05'
          if (sendData.sCmd2 === '') {
            const wendu = (Number(sendData.sValue) * 100).toString(16)
            let tmpCmd = sendData.sType + wendu
            sendData.sCmd2 = tmpCmd + this.getCheckNumber(tmpCmd)
          }
          sendData.sCheckSum = this.getCheckNumber(sendData.sCmd2)
          break
        case '2155':
          // 版本
          sendData.sType = SendType.Version
          sendData.sCmd = SendType.Version + '0387'
          if (sendData.sCmd2 === '') {
            sendData.sCmd2 = sendData.sCmd
          }
          break
        case '2156':
          // 恢复出厂
          sendData.sType = SendType.Reset
          sendData.sCmd = SendType.Reset + '0386'
          if (sendData.sCmd2 === '') {
            sendData.sCmd2 = sendData.sCmd
          }
          break
        case '2158':
          // 序列号
          sendData.sType = SendType.GetNumber
          sendData.sCmd = SendType.GetNumber + '0384'
          if (sendData.sCmd2 === '') {
            sendData.sCmd2 = sendData.sCmd
          }
          break
        case '2161':
          // 油温
          sendData.sType = SendType.OilTemperature + '05'
          if (sendData.sCmd2 === '') {
            const wendu = (Number(sendData.sValue) * 100).toString(16)
            let tmpCmd = sendData.sType + wendu
            sendData.sCmd2 = tmpCmd + this.getCheckNumber(tmpCmd)
          }
          sendData.sCheckSum = this.getCheckNumber(sendData.sCmd2)
          break
        case '2163':
          // 握手
          sendData.sType = SendType.HandShake
          sendData.sCmd = SendType.HandShake + '0379'
          if (sendData.sCmd2 === '') {
            sendData.sCmd2 = sendData.sCmd
          }
          break
        case '2164':
          // 4Y机器专有测试
          sendData.sType = SendType.Test4Y
          sendData.sCmd = SendType.Reset + '0378'
          if (sendData.sCmd2 === '') {
            sendData.sCmd2 = sendData.sCmd
          }
          break
        default:
          sendData.sType = ''
          break
      }
    } else {
      // 获取数值，拼接命令
      let sendType = sendData.sType
      sendMsg = Math.round((parseInt(sendData.sValue as string)) * 10).toString(16)
      if (sendMsg.length === 3) {
        sendMsg = '0' + sendMsg
      } else if (sendMsg.length === 2) {
        sendMsg = '00' + sendMsg
      }
      if (sendType === SendType.Temperature || sendType === SendType.HandShake || sendType === SendType.OilTemperature || sendType === SendType.KPa) {
        sendData.sCmd2 = sendData.sType + '05' + sendMsg
        sendData.sCmd2 += this.getCheckNumber(sendData.sType, sendData.sCmd2)
        console.log(sendData.sCmd2);
      }
    }
    return sendData
  }

  getResiveDataState(cmd: string, rtype: string): object {
    let state = cmd.slice(cmd.length - 4, cmd.length - 2)
    let result = state === '01' ? SetStatus[SetStatus.SUCESS] : SetStatus[SetStatus.ERROR]
    return JSON.parse(`{ "${rtype}" : "${result}" }`)
  }

  getCheckNumber(rtype: string | undefined, sValue?: string, rBuffer?: Buffer, isSend = true): string {
    if (rtype) {
      const reverse = (str: any) => (~parseInt(str, 2) & 0xffff).toString(2).substr(-1 * str.length)
      let sum = 0
      let sum2 = 0
      // 发送校验和
      if (isSend) {
        let did = '0x' + sValue?.substring(0, 2) as string
        let cmd = '0x' + sValue?.substring(2, 4) as string
        let lb = '0x' + sValue?.substring(4, 6) as string
        let df = parseInt(sValue?.substring(sValue.length - 4, sValue.length) as string, 16)
        // 设定数值 位运算取高位
        const dfH = (df >> 8) & 0xff
        // 取低位
        const dfL = df & 0xff
        let array = [Number(did), Number(cmd), Number(lb), dfH, dfL]
        const uA = new Uint8Array(array)
        const tempSum = uA.reduce((a, b) => a + b, 0)

        sum = (~tempSum + 1) & 0xff
        console.log(sum);
        return sum.toString(16)
        // const ab = this.stringToArrayBuffer(sValue as string)
        // console.log(ab);
        // console.log(sum);
        // curl http://localhost:3333/api/set\?type\=2151\&value\=30
        // curl http://localhost:3333/api/set?cmd=2150038c
      } else {
        //接收校验和 buffer
        if (rBuffer) {
          let bufferArray = new ArrayBuffer(rBuffer.length);
          let view = new Uint8Array(bufferArray);
          for (var i = 0; i < rBuffer.length; ++i) {
            view[i] = rBuffer[i];
          }
          for (let index = 0; index < view.length - 1; index++) {
            sum += view[index]
          }
          // 含有LB校验
          if (rtype === SendType.Test || rtype === SendType.Test4Y) {
            sum2 = parseInt(reverse(sum.toString(2)), 2) + 1
            // console.log(`${sum} - ${sum.toString(2)} - ${reverse(sum.toString(2))} - ${parseInt(reverse(sum.toString(2)), 2)}`);
            return sum2.toString(16).substr(-2)
          }
          // 无校验
          else if (rtype === SendType.HandShake || rtype === SendType.Reset) {
            // sum2 = parseInt(reverse((view[0] + view[1]).toString(2)), 2) + 1
          } else {
            console.log(rBuffer.buffer);
            sum2 = (~sum + 1) & 0xff
            return sum2.toString(16)
          }
        }
      }
    }
    return ''
  }

  complementCodeParse(hex: number, isSend = false) {
    const reverse2 = (str: string) => str.replace(/1|0/g, (x) => { return x === "0" ? "1" : "0" })
    // let sourceCode = hex.toString(2)
    // 取低位 并转化为二进制
    let dfL = (hex & 0xff).toString(2)
    // 符号位
    let fh = dfL.substring(0, 1)
    // 数值位
    let sm = dfL.substring(1, dfL.length)
    // 原码
    let val = Number(reverse2(sm)) + 1
    let tempVal = parseInt((val.toString()), 2) / 10
    return fh === '1' ? '-' + tempVal.toFixed(1) : tempVal.toFixed(1)
  }

  stringToArrayBuffer(str: string) {
    let bytes = new Array();
    let len, c;
    len = str.length;
    for (var i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if (c >= 0x010000 && c <= 0x10FFFF) {
        bytes.push(((c >> 18) & 0x07) | 0xF0);
        bytes.push(((c >> 12) & 0x3F) | 0x80);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000800 && c <= 0x00FFFF) {
        bytes.push(((c >> 12) & 0x0F) | 0xE0);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000080 && c <= 0x0007FF) {
        bytes.push(((c >> 6) & 0x1F) | 0xC0);
        bytes.push((c & 0x3F) | 0x80);
      } else {
        bytes.push(c & 0xFF);
      }
    }
    let array = new Int8Array(bytes.length);
    for (let i = 0; i <= bytes.length; i++) {
      array[i] = bytes[i];
    }
    return array.buffer;
  }

}

