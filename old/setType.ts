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

export enum ReceiveType {
  Test = '0650',
  Temperature = '0651',
  Humidity = '0652',
  KPa = '0653',
  Version = '0655',
  Reset  = '065603a1',
  GetNumber = '0658',
  OilTemperature = '0661',
  HandShake = '06630394',
  Test4Y = '0664'
}