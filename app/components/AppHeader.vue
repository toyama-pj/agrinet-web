<script setup lang="ts">
const currentTab = useCurrentTab()

const authToken = useAuthToken()

const tabs: {id: DashboardTab, label: string}[] = [
  {
    id: "dashboard",
    label: "ダッシュボード"
  },
  {
    id: "settings",
    label: "設定"
  }
]

async function logout() {
  try {
    //
  } catch {}
  authToken.value = null

  await navigateTo("/login")
}
</script>

<template>
  <div class="header-container">
    <div class="header-left">
      Agrinet
    </div>

    <div class="header-center">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="header-right">
      <button id="logout-button" @click="logout">
        ログアウト
      </button>
    </div>
  </div>
</template>

<style scoped>
.header-container{
    display:flex;
    height:40px;
    background:white;
    border-bottom:1px solid #ccc;
}

.header-left{
    width:120px;
    background:#2c9b42;
    color:white;

    display:flex;
    justify-content:center;
    align-items:center;

    font-weight:bold;
}

.header-center{
    flex:1;
    display:flex;
}

.tab{
    flex:1;

    border:none;
    border-left:1px solid #ddd;
    border-right:1px solid #ddd;

    background:transparent;

    cursor:pointer;
    transition:.2s;
}

.tab:hover{
    background:#efefef;
}

.tab.active{
    background:#dcdcdc;
    font-weight:bold;
}

.header-right{
    width:120px;
    display:flex;
}

#logout-button{
    width:100%;
    border:none;
    background:transparent;
    cursor:pointer;
}

#logout-button:hover{
    background:#efefef;
}
</style>
