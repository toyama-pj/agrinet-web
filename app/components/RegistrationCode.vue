<script setup lang="ts">
import type { FetchError } from "ofetch"
import type { UserBearerToken } from '~/types/auth';
import type { RFCErrorResponse } from "~/types/error";

const props = defineProps<{
  email: string
}>()

const passcode = ref('')

const errorMessage = ref('')

async function sendRegisterCode() {
  errorMessage.value = ''

  if (passcode.value.trim() === '') {
    errorMessage.value = 'パスコードを入力してください'
    return
  }

  if (passcode.value.length !== 6) {
    errorMessage.value = 'パスコードは6桁です'
    return
  }

  if (!/^\d{6}$/.test(passcode.value)) {
    errorMessage.value = 'パスコードは6桁の数字で入力してください'
    return
  }

  try {
    const config = useRuntimeConfig()
    const result = await $fetch<UserBearerToken>(`${config.public.apiBase}/auth/register/callback`, {
      method: 'POST',
      body: {
        email: props.email,
        code: passcode.value
      }
    })

    const authToken = useAuthToken()
    authToken.value = result.token

    await navigateTo('/main')

  } catch (e: unknown) {
    let err = e as FetchError<RFCErrorResponse>
    if (!err.data) {
      errorMessage.value = "通信エラー"
      return
    }

    switch (err.data.type) {
      case "error/auth/invalid_token":
        errorMessage.value = "パスコードが違います"
        break

      case "error/common/invalid_request":
        errorMessage.value = "入力内容が正しくありません"
        break

      case "error/common/internal_server_error":
      case "error/common/database_error":
        errorMessage.value = "サーバーエラー"
        break

      default:
        errorMessage.value = "ログインに失敗しました"
    }
  }
}

const emit = defineEmits<{
  back: []
}>()

</script>

<template>
  <form class="passcode-container" @submit.prevent="sendRegisterCode" novalidate>
    <a id="passcode-text">登録・ログイン</a>
    <div class="passcode-box">
      <label for="passcode">パスコード</label>
      <input
        id="passcode"
        type="text"
        v-model="passcode"
        placeholder="××××××"
      >
      <span v-if="errorMessage" class="error-text">{{ errorMessage }}</span>
    </div>

    <button id="login-button" type="submit">
      登録
    </button>
    <button
      id="back-to-emailbox"
      type="button"
      @click="emit('back')"
      >
      新規登録画面へ戻る
    </button>
  </form>
</template>

<style scoped>

.passcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 300px;
  height: 200px;
  background-color: #fff;
}

.passcode-box {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

.passcode-box label {
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.error-text {
  color: #ff3b30;
  font-size: 0.8rem;
  margin-top: 4px;
  text-align: left;
}

#passcode {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

#login-button {
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#back-to-emailbox {
  border: none;
  color: rgb(96, 96, 255);
}

#passcode-text {
  margin-bottom: 30px
}
</style>