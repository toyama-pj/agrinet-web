<template>
  <div class="body">
    <aside class="side">
      <SideMenu />
    </aside>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.side {
  flex-shrink: 0;
  height: 100%;
}

.content {
  flex: 1;
  overflow-y: auto;
}
</style>