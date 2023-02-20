export enum SendType {
  // 温度 temperature
  Temperature = '2151',
  // 湿度 humidity
  Humidity = '2152',
  // 气压 kPa
  KPa = '2153',
  // 油温 Oil temperature
  OilTemperature = '2161',
  Test = '2150',
  Version = '2155',
  Reset ='2156',
  GetNumber = '2158',
  HandShake = '2163',
  Test4Y = '2164'
}

export enum CmdEnum {
  data = '2150038c',
  data_4Y = '21640378',
  version = '21550387',
  reset = '21560386',
  id = '21580384',
  shakeHand = '21630379'
}


export interface returnData{
  state: number,
  data: object
}

export interface ShowDataType {
  Humidity:string,
  Temperature:string,
  KPa:string,
  OilTemperature?:string
}