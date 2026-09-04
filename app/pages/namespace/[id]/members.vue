<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const userInfo = useUserInfo()

const {
  namespaceMembers,
  busy,
  errors,
  toastMessage,
  refreshNamespaceMembers,
  inviteNamespaceMember,
  removeNamespaceMember,
  getGrantLabel,
} = useMembers()

const namespaceId = computed(() => {
  return String(route.params.id)
})

const currentUserId = computed(() => {
  return userInfo.value?.ID
})

const email = ref("")
const grantType = ref("rw")

async function handleBack() {
  await router.push(
    `/namespace/${namespaceId.value}`,
  )
}

async function handleInvite() {
  await inviteNamespaceMember(
    namespaceId.value,
    email.value.trim(),
    grantType.value,
  )

  if (errors.value.length === 0) {
    email.value = ""
    grantType.value = "rw"
  }
}

async function handleRemove(
  member: typeof namespaceMembers.value[number],
) {
  const confirmed = window.confirm(
    `${member.email} をNamespaceから削除しますか？`,
  )

  if (!confirmed) {
    return
  }

  await removeNamespaceMember(
    namespaceId.value,
    member,
  )
}

onMounted(async () => {
  await refreshNamespaceMembers(
    namespaceId.value,
  )
})
</script>

<template>
  <div class="members-page">
    <header class="header">
      <div class="header-main">
        <button
          class="button secondary small"
          type="button"
          @click="handleBack"
        >
          ← 戻る
        </button>

        <h1>Namespace ユーザー</h1>
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

    <div class="info-box">
      登録済みユーザーのメールアドレスを指定して招待します。
      同じユーザーを再送信すると権限を更新できます。
    </div>

    <section class="settings-section">
      <h2>招待・権限更新</h2>

      <form
        class="form-grid"
        @submit.prevent="handleInvite"
      >
        <div class="field">
          <label for="invite-email">
            メールアドレス
          </label>

          <input
            id="invite-email"
            v-model="email"
            type="email"
            autocomplete="email"
            maxlength="254"
            required
          />
        </div>

        <div class="field">
          <label for="grant-type">
            権限
          </label>

          <select
            id="grant-type"
            v-model="grantType"
            required
          >
            <option value="r">
              閲覧のみ
            </option>

            <option value="rw">
              閲覧・送信
            </option>

            <option value="w">
              送信のみ
            </option>

            <option value="admin">
              管理者
            </option>
          </select>
        </div>

        <button
          class="button full"
          type="submit"
          :disabled="busy"
        >
          {{ busy ? "更新中…" : "招待する" }}
        </button>
      </form>
    </section>

    <section class="settings-section">
      <h2>現在のユーザー</h2>

      <div class="member-list">
        <div
          v-if="namespaceMembers.length === 0"
          class="empty-state"
        >
          <p>ユーザーがいません。</p>
        </div>

        <div
          v-for="member in namespaceMembers"
          :key="member.user_id"
          class="member-row"
        >
          <div class="member-main">
            <strong>
              {{ member.name }}
            </strong>

            <small>
              {{ member.email }}
            </small>
          </div>

          <span
            class="grant-badge"
            :class="{
              admin: member.grant_type === 'admin',
            }"
          >
            {{ getGrantLabel(member.grant_type) }}
          </span>

          <span
            v-if="member.user_id === currentUserId"
            class="self-label"
          >
            自分
          </span>

          <button
            v-else
            class="button danger small"
            type="button"
            :disabled="busy"
            @click="handleRemove(member)"
          >
            削除
          </button>
        </div>
      </div>
    </section>

    <div
      v-if="toastMessage"
      class="toast"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>