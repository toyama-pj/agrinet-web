<script setup lang="ts">
import type { KeyValueResponsePayload } from "~/types/data"

const selectedNamespace = useSelectedNamespace()

const selectedRange = ref("1h")

const sensorData = ref<KeyValueResponsePayload | null>(null)

const loading = ref(false)
const loadError = ref(false)

function rangeToSeconds(range:string){

  switch(range){

    case "1h":
      return 60 * 60

    case "6h":
      return 6 * 60 * 60

    case "24h":
      return 24 * 60 * 60

    case "7d":
      return 7 * 24 * 60 * 60

    default:
      return 60 * 60

  }

}



async function loadSensorData(){

  if(!selectedNamespace.value){

    sensorData.value = null
    loading.value = false

    return

  }


  loading.value = true
  loadError.value = false


  try{

    /*
    const afterAt =
      Math.floor(Date.now()/1000)
      -
      rangeToSeconds(selectedRange.value)


    const result =
      await getSensorData(
        selectedNamespace.value,
        {
          afterAt,
          order:"ASC"
        }
      )


    sensorData.value = result*/

    // APIの代わりにダミーデータ
    sensorData.value = {
      data: [
        {
          key: "temperature",
          values: [
            { time: 1721800000, value: "24.5" },
            { time: 1721803600, value: "25.0" },
            { time: 1721807200, value: "25.7" },
            { time: 1721810800, value: "26.1" },
            { time: 1721814400, value: "26.8" },
            { time: 1721818000, value: "27.0" }
          ]
        },
        {
          key: "humidity",
          values: [
            { time: 1721800000, value: "71" },
            { time: 1721803600, value: "69" },
            { time: 1721807200, value: "67" },
            { time: 1721810800, value: "65" },
            { time: 1721814400, value: "63" },
            { time: 1721818000, value: "64" }
          ]
        },
        {
          key: "soil_moisture",
          values: [
            { time: 1721800000, value: "52" },
            { time: 1721803600, value: "51" },
            { time: 1721807200, value: "50" },
            { time: 1721810800, value: "49" },
            { time: 1721814400, value: "48" },
            { time: 1721818000, value: "47" }
          ]
        }
      ]
    }


  }catch(e){

    console.error(e)

    sensorData.value = null
    loadError.value = true


  }finally{

    loading.value = false

  }

}



// 初回取得
onMounted(()=>{

  loadSensorData()

})



// 子機変更・期間変更
watch(
  [
    selectedNamespace,
    selectedRange
  ],
  ()=>{
    if(import.meta.client){
      loadSensorData()
    }
  }
)



let timer:ReturnType<typeof setInterval>



onMounted(()=>{

  timer = setInterval(()=>{

    loadSensorData()

  },30000)

})



onUnmounted(()=>{

  clearInterval(timer)

})

</script>


<template>

<div class="dashboard">


  <p v-if="loadError">
    データ取得に失敗しました
  </p>


  <CurrentDataCard
    :data="sensorData"
    :loading="loading"
  />


  <GraphCard
    :data="sensorData"
    :loading="loading"
    v-model:range="selectedRange"
  />


</div>


</template>


<style scoped>

.dashboard {

  display:flex;

  flex-direction:column;

  height:100%;

  gap:12px;

  padding:12px;


  min-height:0;

}



.dashboard > * {

  min-height:0;

}



.dashboard > :first-child {

  flex:0 0 auto;

}



.dashboard > :not(:first-child) {

  flex:1;

}

</style>