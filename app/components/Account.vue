<script setup lang="ts">
import type { User } from '~/types/auth'


const loading = ref(false)
const saving = ref(false)
const me = useUserInfo()
const authToken = useAuthToken()
const { apiFetch } = useApi()

// 初期取得
async function loadProfile() {

  loading.value = true

  try {

    me.value = await apiFetch<User>("/cfg/me")

  } catch(e) {

    console.error(e)

  } finally {

    loading.value = false

  }
}

// 名前変更
async function saveProfile(){

  saving.value = true

  try {

    await apiFetch(
      "/cfg/me",
      {
        method:"PATCH",

        body:{
          name: me.value.Name
        }
      }
    )


    // 更新成功後再取得 現状不要と判断
    //await loadProfile()


  } catch(e){

    console.error(e)

  } finally {

    saving.value=false

  }

}



// ログアウト
async function logout(){

  authToken.value=null

  await navigateTo("/login")

}
</script>

<template>
  <template v-if="loading">
    <section class="card">
      読み込み中...
    </section>
  </template>

  <template v-else>

    <section class="card">

      <h2>プロフィール</h2>

      <div class="form-group">

        <label>ニックネーム</label>

        <input
          v-model="me.Name"
          type="text"
        >

      </div>

      <div class="form-group">

        <label>メールアドレス</label>

        <input
          :value="me.Email"
          readonly
          type="email"
        >

      </div>

      <div class="actions">

        <button
          :disabled="saving"
          @click="saveProfile"
        >
          {{ saving ? "保存中..." : "変更を保存" }}
        </button>

      </div>

    </section>

    <section class="card">

      <h2>セッション</h2>

      <p>
        現在ログイン中です。
      </p>

      <div class="actions">

        <button
          class="logout"
          @click="logout"
        >
          ログアウト
        </button>

      </div>

    </section>

  </template>
</template>

<style scoped>
.card {
  background: white;
  padding: 24px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
}

h2 {
  margin: 0 0 24px;
  font-size: 22px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

label {
  margin-bottom: 8px;
  font-weight: bold;
}

input {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
}

input:read-only {
  background: #f0f0f0;
  color: #666;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #4f7cff;
  color: white;
  cursor: pointer;
  font-size: 15px;
}

button:disabled {
  opacity: .6;
  cursor: default;
}

.logout {
  background: #d9534f;
}
</style>