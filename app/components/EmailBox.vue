<script setup lang="ts">
import type { FetchError } from "ofetch"
import type { RFCErrorResponse } from '~/types/error';

const emit = defineEmits<{
  next: [email: string]
  register: []
}>()

const email = ref('')
const errorMessage = ref('')
const config = useRuntimeConfig()

async function sendLoginMail() {
  errorMessage.value = ''

  if (email.value.trim() === '') {
    errorMessage.value = 'メールアドレスを入力してください'
    return
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(email.value)) {
    errorMessage.value = 'メールアドレスの形式が正しくありません'
    return
  }

  try {
    await $fetch(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      body: {
        email: email.value
      }
    })

    emit('next', email.value)

  } catch (e: unknown) {
    const err = e as FetchError<RFCErrorResponse>

    if (!err.data) {
      errorMessage.value = "通信エラーが発生しました"
      return
    }

    switch (err.data.type) {
      case "error/common/invalid_request":
        errorMessage.value = "入力内容が正しくありません"
        break

      case "error/common/internal_server_error":
        errorMessage.value = "サーバーエラーが発生しました"
        break

      default:
        errorMessage.value = "予期しないエラーが発生しました"
    }
  }
}
</script>


<template>
  <form 
    class="email-container" 
    @submit.prevent="sendLoginMail"
    novalidate
  >

    <a id="email-text">
      ログイン
    </a>

    <div class="email-box">

      <label for="email">
        メールアドレス
      </label>

      <input
        id="email"
        type="email"
        v-model="email"
        placeholder="example@example.com"
      >

      <span 
        v-if="errorMessage" 
        class="error-text"
      >
        {{ errorMessage }}
      </span>

    </div>


    <button 
      id="login-button"
      type="submit"
    >
      メールを送信
    </button>


    <button
      type="button"
      class="register-button"
      @click="emit('register')"
    >
      新規登録はこちら
    </button>

  </form>
</template>


<style scoped>

.email-container {
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:20px;
  border:1px solid #ccc;
  border-radius:5px;
  width:300px;
  background:#fff;
}


.email-box {
  display:flex;
  flex-direction:column;
  width:100%;
}


.email-box label {
  font-size:0.9rem;
  margin-bottom:4px;
}


#email {
  width:100%;
  padding:8px;
  border:1px solid #ccc;
  border-radius:4px;
  box-sizing:border-box;
}


.error-text {
  color:#ff3b30;
  font-size:0.8rem;
  margin-top:4px;
}


#login-button {
  width:100%;
  padding:10px;
  margin-top:12px;
  background:#4CAF50;
  color:white;
  border:none;
  border-radius:4px;
  cursor:pointer;
}


.register-button {
  margin-top:15px;
  border:none;
  background:none;
  color:#007aff;
  cursor:pointer;
}


#email-text {
  margin-bottom:30px;
}

</style>