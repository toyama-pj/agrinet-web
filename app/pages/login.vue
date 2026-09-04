<script setup lang="ts">
const authMode = ref<"login" | "register">("login")
const authMethod = ref<"password" | "code">("password")

const authEmail = ref("")
const authName = ref("")

const {
  busy,
  errors,
  toastMessage,
  otpSent,

  passwordLogin,
  requestLoginCode,
  loginWithCode,
  requestRegisterCode,
  registerWithCode,
} = useAuth()

const isRegister = computed(() => {
  return authMode.value === "register"
})

const usePassword = computed(() => {
  return !isRegister.value && authMethod.value === "password"
})

const passkeyAvailable = computed(() => {
  if (typeof window === "undefined") {
    return false
  }

  return (
    "PublicKeyCredential" in window &&
    "credentials" in navigator
  )
})

function switchAuthMode() {
  authMode.value = isRegister.value
    ? "login"
    : "register"

  authMethod.value = isRegister.value
    ? "password"
    : "code"

  authEmail.value = ""
  authName.value = ""
}

function usePasswordLogin() {
  authMethod.value = "password"
}

function useCodeLogin() {
  authMethod.value = "code"
}

async function submitPasswordLogin(event: Event) {
  const form = event.currentTarget as HTMLFormElement
  const formData = new FormData(form)

  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  authEmail.value = email

  await passwordLogin(email, password)
}

async function submitOTPForm(event: Event) {
  const form = event.currentTarget as HTMLFormElement
  const formData = new FormData(form)

  const email = String(formData.get("email") ?? "").trim()
  const name = String(formData.get("name") ?? "").trim()
  const code = String(formData.get("code") ?? "").trim()

  authEmail.value = email
  authName.value = name

  if (!otpSent.value) {
    if (isRegister.value) {
      await requestRegisterCode(name, email)
    } else {
      await requestLoginCode(email)
    }

    return
  }

  if (isRegister.value) {
    await registerWithCode(email, code)
  } else {
    await loginWithCode(email, code)
  }
}
</script>

<template>
  <section class="auth-shell">
    <div class="auth-card">

      <div class="brand">
        <div
          class="brand-mark"
          aria-hidden="true"
        >
          ◉
        </div>

        <h1>Simple Chirp</h1>
        <p>LoRaWAN センサーダッシュボード</p>
      </div>

      <!-- エラー -->
      <div
        v-if="errors.length > 0"
        class="error-banner"
      >
        <ul>
          <li
            v-for="error in errors"
            :key="error"
          >
            {{ error }}
          </li>
        </ul>
      </div>

      <!-- パスキー -->
      <template
        v-if="!isRegister && passkeyAvailable"
      >
        <button
          id="passkey-login"
          class="button full"
          type="button"
          :disabled="busy"
        >
          パスキーでログイン
        </button>

        <div class="divider">
          または
        </div>
      </template>

      <!-- ログイン方法切り替え -->
      <div
        v-if="!isRegister"
        class="segmented"
        aria-label="ログイン方法"
      >
        <button
          class="button"
          :class="{ active: usePassword }"
          type="button"
          :aria-pressed="usePassword"
          @click="usePasswordLogin"
        >
          パスワード
        </button>

        <button
          class="button"
          :class="{ active: !usePassword }"
          type="button"
          :aria-pressed="!usePassword"
          @click="useCodeLogin"
        >
          メールコード
        </button>
      </div>

      <!-- パスワードログイン -->
      <form
        v-if="usePassword"
        class="form-grid"
        @submit.prevent="submitPasswordLogin"
      >
        <div class="field">
          <label for="email">
            メールアドレス
          </label>

          <input
            id="email"
            v-model="authEmail"
            name="email"
            type="email"
            autocomplete="username"
            maxlength="254"
            required
          >
        </div>

        <div class="field">
          <label for="login-password">
            パスワード
          </label>

          <input
            id="login-password"
            name="password"
            type="password"
            autocomplete="current-password"
            maxlength="128"
            required
          >
        </div>

        <button
          class="button full"
          type="submit"
          :disabled="busy"
        >
          {{ busy ? "ログイン中…" : "ログイン" }}
        </button>
      </form>

      <!-- メールコード -->
      <form
        v-else
        class="form-grid"
        @submit.prevent="submitOTPForm"
      >
        <div
          v-if="isRegister"
          class="field"
        >
          <label for="name">
            お名前
          </label>

          <input
            id="name"
            v-model="authName"
            name="name"
            autocomplete="name"
            maxlength="100"
            required
          >
        </div>

        <div class="field">
          <label for="otp-email">
            メールアドレス
          </label>

          <input
            id="otp-email"
            v-model="authEmail"
            name="email"
            type="email"
            autocomplete="email"
            maxlength="254"
            required
          >
        </div>

        <div
          v-if="otpSent"
          class="field"
        >
          <label for="code">
            6桁の確認コード
          </label>

          <input
            id="code"
            name="code"
            inputmode="numeric"
            autocomplete="one-time-code"
            pattern="[0-9]{6}"
            maxlength="6"
            required
          >

          <small>
            メールに届いたコードを入力してください。
          </small>
        </div>

        <button
          class="button full"
          type="submit"
          :disabled="busy"
        >
          {{
            busy
              ? "処理中…"
              : otpSent
                ? (isRegister
                  ? "アカウントを作成"
                  : "ログイン")
                : "確認コードを送る"
          }}
        </button>
      </form>

      <!-- ログイン / 登録切り替え -->
      <div class="auth-switch">
        {{
          isRegister
            ? "アカウントをお持ちですか？"
            : "初めて利用しますか？"
        }}

        <button
          class="text-button"
          type="button"
          @click="switchAuthMode"
        >
          {{ isRegister ? "ログイン" : "新規登録" }}
        </button>
      </div>

    </div>

    <!-- Toast -->
    <div
      v-if="toastMessage"
      class="toast"
    >
      {{ toastMessage }}
    </div>
  </section>
</template>