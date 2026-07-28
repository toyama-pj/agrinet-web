<script setup lang="ts">

const currentTab = useCurrentTab()

const selectedNamespace = useSelectedNamespace()
const selectedSetting = useSelectedSetting()

const openedMenu = ref<string | null>(null)

const {
  namespacePermission,
  loading,
  loadError,
  loadNamespaces
} = useLoadNamespacePermission()

await loadNamespaces()

const namespaces = useNamespaces(namespacePermission.value)



function openSetting(namespaceId:string) {

  selectedNamespace.value = namespaceId

  selectedSetting.value = "namespace"

  currentTab.value = "settings"

  openedMenu.value = null

}

</script>



<template>

<nav class="side-menu">


<!-- ダッシュボード -->

<ul v-if="currentTab === 'dashboard'">


<li v-if="loading">

読み込み中...

</li>


<li v-else-if="loadError">

取得エラー

</li>


<li
v-else-if="namespaces.length === 0"
>

表示できるものがありません

</li>



<li
  v-for="namespace in namespaces"
  :key="namespace.id"
  :class="{
    selected: selectedNamespace === namespace.id
  }"
>
  <span
    class="title"
    @click="selectedNamespace = namespace.id"
  >
    {{ namespace.displayName }}
  </span>

  <div class="menu-wrapper">
    <button
      class="menu-button"
      @click.stop="
        openedMenu =
          openedMenu === namespace.id
            ? null
            : namespace.id
      "
    >
      ⋮
    </button>

    <div
      v-if="openedMenu === namespace.id"
      class="popup-menu"
    >
      <button @click="openSetting(namespace.id)">
        設定
      </button>
    </div>
  </div>
</li>


</ul>





<!-- 設定 -->

<ul v-else-if="currentTab === 'settings'">


<li
:class="{
 selected:selectedSetting === 'account'
}"
@click="selectedSetting='account'"
>

アカウント

</li>



<li class="parent">

名前空間

</li>



<ul class="sub-menu">

  <li
  :class="{
  selected:selectedSetting==='namespace'
  }"
  @click="
  selectedSetting='namespace'
  "
  >

  ├ 名前空間情報

  </li>

  <li
  :class="{
  selected:selectedSetting==='handset'
  }"
  @click="
  selectedSetting='handset'
  "
  >

  ├ 子機情報

  </li>



  <li
  :class="{
  selected:selectedSetting==='member'
  }"
  @click="
  selectedSetting='member'
  "
  >

  └ メンバー

  </li>


</ul>


</ul>


</nav>


</template>



<style scoped>
.side-menu {
  width: 220px;
  height: 100%;
  background: white;
  padding: 10px;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  position: relative;

  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 8px;
  padding: 10px;

  border: 1px solid #ccc;
  border-radius: 4px;

  transition: .15s;
}

.title {
  flex: 1;
  cursor: pointer;
}

li:hover {
  background:#efefef;
}

.selected {
  background:#d9d9d9;
  border-color:#888;
  font-weight:bold;
}

.parent {
  margin-top:16px;
  background:#f8f8f8;
  font-weight:bold;
  cursor:default;
}

.parent:hover {
  background:#f8f8f8;
}

.sub-menu {
  margin-left:18px;
  margin-bottom:10px;
}

.sub-menu li {
  font-size:14px;
  padding:8px 10px;
}

.menu-wrapper {
  position:relative;
}

.menu-button {
  width:28px;
  height:28px;

  border:none;
  background:transparent;

  cursor:pointer;

  border-radius:4px;
}

.menu-button:hover {
  background:#ddd;
}

.popup-menu {

  position:absolute;

  top:32px;

  right:0;

  width:120px;

  background:white;

  border:1px solid #ddd;

  border-radius:6px;

  box-shadow:0 4px 12px rgba(0,0,0,.15);

  z-index:100;
}

.popup-menu button {

  width:100%;

  padding:10px;

  border:none;

  background:white;

  text-align:left;

  cursor:pointer;

}

.popup-menu button:hover {

  background:#f3f3f3;

}
</style>