import { IAPMData } from "../type/IDevice";

export enum MQH_3Y4Y_ReqCmd {
  Temperature = '215105',
  // 湿度 humidity
  Humidity = '215205',
  // 气压 kPa
  KPa = '215305',
  // 油温 Oil temperature
  OilTemperature = '216105',

  Test = '2150038c',
  Version = '21550387',
  Reset = '21560386',
  GetNumber = '21580384',
  HandShake = '21630379',
  Test4Y = '21640378'
}

enum MQH_3Y4Y_ResCmd {
  Test = '0650',
  Temperature = '0651',
  Humidity = '0652',
  KPa = '0653',
  Version = '0655',
  Reset = '065603a1',
  GetNumber = '0658',
  OilTemperature = '0661',
  HandShake = '06630394',
  Test4Y = '0664'
}

export function MQH_3Y4Y_Receive_DP(bf: Buffer): boolean | object {
  // 类型判定
  let bufferArray = new ArrayBuffer(bf.length);
  let view = new Uint8Array(bufferArray);
  for (var i = 0; i < bf.length; ++i) {
    view[i] = bf[i];
  }
  if (view[view.length - 1] !== getReceiveChackNumber(view)) {
    return { state: 0, data: "校验和不一致" }
  }
  //
  let cmdHead = (view[0].toString(16).length === 1 ? '0' + view[0].toString(16) : view[0].toString(16)) +
    (view[1].toString(16).length === 1 ? '0' + view[1].toString(16) : view[1].toString(16))
  // 命令判定
  switch (cmdHead) {
    case MQH_3Y4Y_ResCmd.Test: {
      let Temperature: string = view[3].toString(16) + view[4].toString(16)
      let Humidity: string = view[5].toString(16) + view[6].toString(16)
      let Kpa: string = view[7].toString(16) + view[8].toString(16)
      let tpFH = view[3].toString(2).substring(0, 1)
      if (Number(tpFH) === 1) {
        Temperature = complementCodeParse(parseInt(Temperature, 16))
      } else {
        Temperature = (parseInt(Temperature, 16) / 10).toString()
      }
      Humidity = (parseInt(Humidity, 16) / 10).toString()
      Kpa = (parseInt(Kpa, 16) / 10).toString()
      return {
        state: 1,
        data: {
          Temperature,
          Humidity,
          Kpa,
        }
      }
      break
    }
    case MQH_3Y4Y_ResCmd.Temperature: {
      // 06510401a4
      if (sendResult(bf)) {
        return true
      }
      else { return false }
      break
    }
    case MQH_3Y4Y_ResCmd.Humidity:
      // 06520401a3
      if (sendResult(bf)) {
        return true
      }
      else { return false }
      break
    case MQH_3Y4Y_ResCmd.Humidity:
      // 06530401a2
      if (sendResult(bf)) {
        return true
      }
      else { return false }
      break
    default: {
      return { state: 0, data: '响应解析失败' }
    }
  }
}

export function MQH_3Y4Y_Send_DP(data: IAPMData): IAPMData {
  let atmosherePressure = data.atmosherePressure
  let humidity = data.humidity
  let temperature = data.temperature
  const reqCmd = {
    atmosherePressure,
    humidity,
    temperature
  }
  atmosherePressure = (Number(atmosherePressure) * 10).toString(16).length === 3 ? '0' + (Number(atmosherePressure) * 10).toString(16) : (Number(atmosherePressure) * 10).toString(16)
  humidity = (Number(humidity) * 10).toString(16).length === 3 ? '0' + (Number(humidity) * 10).toString(16) : (Number(humidity) * 10).toString(16)
  temperature = (Number(temperature) * 10).toString(16).length === 3 ? '0' + (Number(temperature) * 10).toString(16) : (Number(temperature) * 10).toString(16)

  reqCmd.atmosherePressure = MQH_3Y4Y_ReqCmd.KPa + atmosherePressure
  reqCmd.humidity = MQH_3Y4Y_ReqCmd.Humidity + humidity
  reqCmd.temperature = MQH_3Y4Y_ReqCmd.Temperature + temperature

  reqCmd.atmosherePressure += getSendChackNumber(reqCmd.atmosherePressure)
  reqCmd.humidity += getSendChackNumber(reqCmd.humidity)
  reqCmd.temperature += getSendChackNumber(reqCmd.temperature)
  return reqCmd
}

// 补码转原码
function complementCodeParse(hex: number, isSend = false) {
  const reverse2 = (str: string) => str.replace(/1|0/g, (x) => { return x === "0" ? "1" : "0" })
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


function getReceiveChackNumber(view: Uint8Array) {
  let sum = 0
  let sum2 = 0
  for (let index = 0; index < view.length - 1; index++) {
    sum += view[index]
  }
  sum2 = (~sum + 1) & 0xff
  return sum2
}

function getSendChackNumber(sValue: string) {
  let sum = 0
  let did = '0x' + sValue.substring(0, 2) as string
  let cmd = '0x' + sValue.substring(2, 4) as string
  let lb = '0x' + sValue.substring(4, 6) as string
  let df = parseInt(sValue.substring(sValue.length - 4, sValue.length) as string, 16)
  // 设定数值 位运算取高位
  const dfH = (df >> 8) & 0xff
  // 取低位
  const dfL = df & 0xff
  let array = [Number(did), Number(cmd), Number(lb), dfH, dfL]
  const uA = new Uint8Array(array)
  const tempSum = uA.reduce((a, b) => a + b, 0)
  sum = (~tempSum + 1) & 0xff
  return sum.toString(16)
}

// function bufferToStringHex(bf: Buffer) {
//   const ui8 = new Uint8Array(bf)
//   return String.fromCharCode.apply(null, ui8)
// }

function sendResult(bf: Buffer) {
  const cmd = bf.toString('hex') 
  let state = cmd.slice(cmd.length - 4, cmd.length - 2)
  return  state === '01' ? true : false
}

function stringToBuffer(str: string) {
  var bytes = new Array();
  var len, c;
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
  var array = new Int8Array(bytes.length);
  for (var i = 0; i <= bytes.length; i++) {
    array[i] = bytes[i];
  }
  return array.buffer;
}