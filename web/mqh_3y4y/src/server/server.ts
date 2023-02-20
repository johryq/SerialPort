import axios from 'axios';
import { CmdEnum, SendType } from '@/type';

const baseServer = axios.create({
  baseURL: 'http://192.168.10.44:3333/api/set',
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
});


export function getDataApi() {
  return baseServer.get(`?cmd=${CmdEnum.data}`).then(res => res.data)
}

export function getData4YApi() {
  return baseServer.get(`?cmd=${CmdEnum.data_4Y}`).then(res => res.data)
}

export function getVersionApi() {
  return baseServer.get(`?cmd=${CmdEnum.version}`).then(res => res.data)
}

export function getIDApi() {
  return baseServer.get(`?cmd=${CmdEnum.id}`).then(res => res.data)
}

export function setResetApi() {
  return baseServer.get(`?cmd=${CmdEnum.reset}`).then(res => res.data)
}

export function setShakeHandApi() {
  return baseServer.get(`?cmd=${CmdEnum.shakeHand}`).then(res => res.data)
}

export function updataValueApi(upType: string, value: string) {
  let result:any
  console.log(upType);
  
  switch (upType) {
    case SendType.Humidity:
      result = baseServer.get(`?type=${SendType.Humidity}&value=${value}`).then(res => res.data)
      break
    case SendType.Temperature:
      result = baseServer.get(`?type=${SendType.Temperature}&value=${value}`).then(res => res.data)
      break
    case SendType.KPa:
      result = baseServer.get(`?type=${SendType.KPa}&value=${value}`).then(res => res.data)
      break
    case SendType.OilTemperature:
      result = baseServer.get(`?type=${SendType.OilTemperature}&value=${value}`).then(res => res.data)
      break
  }
  return result
}

export function updateDataApi() {
  return baseServer.get('/set')
}