<script setup lang="ts">
const router = useRouter()

const {
  email,
  passwordConfigured,
  passkeys,
  passkeySupported,
  busy,
  errors,
  toastMessage,
  loadSettings,
  loadPasskeyConfig,
  updatePassword,
  registerPasskey,
  deletePasskey,
} = useSettings()

const currentPassword = ref("")
const newPassword = ref("")
const confirmPassword = ref("")

const passkeyName = ref("この端末")

async function handleBack() {
  await router.push("/dashboard")
}

async function handleUpdatePassword() {
  const success = await updatePassword(
    currentPassword.value,
    newPassword.value,
    confirmPassword.value,
  )

  if (success) {
    currentPassword.value = ""
    newPassword.value = ""
    confirmPassword.value = ""
  }
}

async function handleRegisterPasskey() {
  const success = await registerPasskey(
    passkeyName.value.trim() || "この端末",
  )

  if (success) {
    passkeyName.value = "この端末"
  }
}

async function handleDeletePasskey(id: string) {
  const confirmed = window.confirm(
    "このパスキーを削除しますか？",
  )

  if (!confirmed) {
    return
  }

  await deletePasskey(id)
}

function formatAgo(value: string): string {
  const seconds = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(value).getTime()) / 1000,
    ),
  )

  if (seconds < 10) return "数秒前"
  if (seconds < 60) return `${seconds} 秒前`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 時間前`

  return `${Math.floor(seconds / 86400)} 日前`
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

onMounted(async () => {
  await Promise.all([
    loadSettings(),
    loadPasskeyConfig(),
  ])
})
</script>

<template>
  <div class="settings-page">
    <header class="header">
      <div class="header-main">
        <button
          class="button secondary small"
          type="button"
          @click="handleBack"
        >
          ← 戻る
        </button>

        <h1>アカウント設定</h1>
      </div>
    </header>

    <div
      v-if="errors.length"
      class="error-banner"
    >
      <p
        v-for="(error, index) in errors"
        :key="index"
      >
        {{ error }}
      </p>
    </div>

    <section class="settings-section">
      <h2>パスワード</h2>

      <p class="section-description">
        {{ email }}
        {{ passwordConfigured
          ? " のパスワードを変更します。"
          : " にログイン用パスワードを設定します。"
        }}
      </p>

      <form
        class="form-grid"
        @submit.prevent="handleUpdatePassword"
      >
        <div
          v-if="passwordConfigured"
          class="field"
        >
          <label for="current-password">
            現在のパスワード
          </label>

          <input
            id="current-password"
            v-model="currentPassword"
            type="password"
            autocomplete="current-password"
            maxlength="128"
            required
          />
        </div>

        <div class="field">
          <label for="new-password">
            新しいパスワード
          </label>

          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            minlength="12"
            maxlength="128"
            required
          />

          <small>
            12〜128文字。メールコードとパスキーは引き続き利用できます。
          </small>
        </div>

        <div class="field">
          <label for="confirm-password">
            新しいパスワード（確認）
          </label>

          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            minlength="12"
            maxlength="128"
            required
          />
        </div>

        <button
          class="button full"
          type="submit"
          :disabled="busy"
        >
          {{
            busy
              ? "保存中…"
              : passwordConfigured
                ? "パスワードを変更"
                : "パスワードを設定"
          }}
        </button>
      </form>
    </section>

    <section class="settings-section">
      <h2>パスキー</h2>

      <div class="info-box">
        <span class="status-dot"></span>
        端末の生体認証・PINを使います。
        秘密鍵がサーバーへ送信されることはありません。
      </div>

      <div class="passkey-list">
        <div
          v-if="passkeys.length === 0"
          class="empty-state"
        >
          <p>登録済みパスキーはありません。</p>
        </div>

        <div
          v-for="passkey in passkeys"
          :key="passkey.id"
          class="passkey-row"
        >
          <div>
            <strong>
              {{ passkey.name }}
            </strong>

            <small>
              登録:
              {{ formatDate(passkey.created_at) }}

              <template
                v-if="passkey.last_used_at"
              >
                /
                最終利用:
                {{ formatAgo(passkey.last_used_at) }}
              </template>
            </small>
          </div>

          <button
            class="button danger small"
            type="button"
            :disabled="busy"
            @click="handleDeletePasskey(passkey.id)"
          >
            削除
          </button>
        </div>
      </div>

      <form
        v-if="passkeySupported"
        class="form-grid"
        @submit.prevent="handleRegisterPasskey"
      >
        <div class="field">
          <label for="passkey-name">
            新しいパスキーの名前
          </label>

          <input
            id="passkey-name"
            v-model="passkeyName"
            maxlength="100"
            required
          />
        </div>

        <button
          class="button full"
          type="submit"
          :disabled="busy"
        >
          {{ busy ? "登録中…" : "パスキーを追加" }}
        </button>
      </form>

      <p
        v-else
        class="unavailable"
      >
        このブラウザまたはサーバー設定ではパスキーを追加できません。
      </p>
    </section>

    <div
      v-if="toastMessage"
      class="toast"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script lang="ts">
function formatAgo(value: string): string {
  const seconds = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(value).getTime()) / 1000,
    ),
  )

  if (seconds < 10) return "数秒前"
  if (seconds < 60) return `${seconds} 秒前`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 時間前`

  return `${Math.floor(seconds / 86400)} 日前`
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}
</script>