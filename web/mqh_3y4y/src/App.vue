<template>
  <div class="container">
    <div class="head">
      环境参数仪MQH-4Y
    </div>
    <div class="content">
      <div class="c-box">
        <div class="title">
          <label for="wd">环境温度</label>
        </div>
        <div class="cc">
          <input id="wd" type="text" v-model="acData.t">
        </div>
      </div>
      <div class="c-box">
        <div class="title">
          <label for="sd">环境湿度</label>
        </div>
        <div class="cc">
          <input id="sd" type="text" v-model="acData.h">
        </div>
      </div>
      <div class="c-box">
        <div class="title">
          <label for="kpa">大气压力</label>
        </div>
        <div class="cc">
          <input id="kpa" type="text" v-model="acData.k">
        </div>
      </div>
      <div class="c-box">
        <div class="title">
          <label for="engine">环境温度</label>
        </div>
        <div class="cc">
          <input id="engine" type="text" v-model="acData.o">
        </div>
      </div>
      <div @click="updataValue">update</div>
    </div>
    <div class="menu">
      <div class="title-box">
        功能
      </div>
      <div class="menu-box">
        <div @click="getValue()">获取数据</div>
        <div @click="shakeHand">握手测试</div>
        <div @click="reset">重置</div>
        <div @click="getID">获取id</div>
        <div @click="getVersion">获取版本号</div>
      </div>
    </div>
    <div class="info-box"> ~ ❯ {{ showStr }} </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/stores/index';
import { storeToRefs } from 'pinia';
import { reactive, ref, onMounted } from 'vue';
import { getDataApi, getVersionApi, getIDApi, setResetApi, setShakeHandApi, updataValueApi, getData4YApi } from '@/server/server'
import { SendType, type ShowDataType } from './type';

const acData = reactive({
  t: '',
  h: '',
  k: '',
  o: ''
})

const store = useStore();
const { Temperature, Humidity, KPa, OilTemperature, showStr } = storeToRefs(store)

const updataValue = () => {
  console.log(acData.t + ' ' + Temperature.value);
  
  if (acData.t !== Temperature.value) {
    updataV2(SendType.Temperature, acData.t)
  }
  if (acData.h !== Humidity.value) {
    updataV2(SendType.Humidity, acData.h)
  }
  if (acData.k !== KPa.value) {
    updataV2(SendType.KPa, acData.k)
  }
  if (acData.o !== OilTemperature.value) {
    updataV2(SendType.OilTemperature, acData.o)
  }
}

const updataV2 = async (upType: string, value: string) => {
  const data = await updataValueApi(upType, value)
  if (data.state === 200) {
    showReqResult("SUCESS")
  }
  else {
    showReqResult('ERROR')
  }
}

const getValue = async (is4Y = true) => {
  const data = is4Y ? await getData4YApi() : await getDataApi()
  console.log(data);

  if (data.state === 200) {
    let sData: ShowDataType = data.data as ShowDataType

    Humidity.value = sData.Humidity
    Temperature.value = sData.Temperature
    KPa.value = sData.KPa
    console.log(KPa.value);

    acData.h = Humidity.value
    acData.k = KPa.value
    acData.t = Temperature.value

    if (sData.OilTemperature) {
      OilTemperature.value = sData.OilTemperature
      acData.o = OilTemperature.value

    }
    showStr.value = 'SUCESS'
  }
}
const shakeHand = async () => {
  const data = await setShakeHandApi()
  showReqResult(data)
}
const reset = async () => {
  const data = await setResetApi()
  showReqResult(data)
}
const getID = async () => {
  const data = await getIDApi()
  showReqResult(data)
}
const getVersion = async () => {
  const data = await getVersionApi()
  showReqResult(data)
}

const showReqResult = (data: any) => {
  console.log(data);
  showStr.value = data.data
}

</script>

<style lang="less" scoped>
.container {
  width: 500px;
  height: 600px;

  .head {
    width: 100%;
    height: 40px;
    line-height: 40px;
    padding-left: 5px;
    background: #0088D1;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
  }

  .content {
    height: 50px;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;

    .c-box {
      widows: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;

      input {
        margin: 10px 0 10px 0;
        width: 80px;
      }
    }
  }

  .menu {

    // display: flex;
    .menu-box {
      >div {
        margin: 10px 0 10px 0;
      }
    }
  }

  .info-box {
    width: 100%;
    height: 30px;
    background: #000;
    color: #fff;
    line-height: 30px;
  }
}
</style>
