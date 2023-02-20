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

export function MQH_3Y4Y_Receive_DP(bf: Buffer): any {
  // 类型判定
  let bufferArray = new ArrayBuffer(bf.length);
  let view = new Uint8Array(bufferArray);
  for (var i = 0; i < bf.length; ++i) {
    view[i] = bf[i];
  }
  if(view[view.length-1] !== getReceiveChackNumber(view)){
    return {state:0,data:"校验和不一致"}
  }
  let cmdHead = (view[0].toString(16).length === 1 ? '0' + view[0].toString(16) : view[0].toString(16)) + 
  (view[1].toString(16).length === 1 ? '0' + view[1].toString(16) : view[1].toString(16))
  // 命令判定
  switch(cmdHead){
    case MQH_3Y4Y_ResCmd.Test:{
      let Temperature:string = view[3].toString(16) + view[4].toString(16)
      let Humidity:string = view[5].toString(16) + view[6].toString(16)
      let Kpa:string = view[7].toString(16) + view[8].toString(16)
      let tpFH = view[3].toString(2).substring(0,1)
      if(Number(tpFH) === 1){
        Temperature = complementCodeParse(parseInt(Temperature, 16))
      }else{
        Temperature = (parseInt(Temperature, 16) / 10).toString()
      }
      Humidity = (parseInt(Humidity, 16) / 10).toString()
      Kpa = (parseInt(Kpa, 16) / 10).toString()
      return {
        state: 1,
         data:{
          Temperature,
          Humidity,
          Kpa,
        }
      }
      break
    }
    default: {
      return {state: 0,data: '响应解析失败'}
    }
  }
}

export function MQH_3Y4Y_Send_DP(sValue:string): any {
  
}

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
  let sum =0
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