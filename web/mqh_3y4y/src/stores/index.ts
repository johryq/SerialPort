import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state: () => ({
      Temperature : '-1',
      // 湿度 
      Humidity : '-1',
      KPa : '-1',
      OilTemperature :  '-1',
      showStr: ''
  }),
  
  actions: {
    
  },
})
