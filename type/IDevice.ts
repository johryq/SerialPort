export interface IDeviceReturn {
  state:number
  data: object
}

interface IDevice {
  id: string
  name: string
  classify: string
  launch?:() => IDeviceReturn
  stop?: () => IDeviceReturn
  restart?: () => IDeviceReturn
  reset?: () => IDeviceReturn
}

export interface IAmbientParameterMeter extends IDevice {
  getDevInfo: () => Promise<any>
  getRealTimeData: () => Promise<any>
  getRealTimeStatus: () => Promise<any>
  calibration: () => Promise<any>
}

