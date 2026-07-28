<script setup lang="ts">
import type { NamespaceWriteTokenExist } from '~/types/namespace'
import type { CreateTokenResponse } from '~/types/token'


const { apiFetch } = useApi()

const selectedNamespace = useSelectedNamespace()

const loading = ref(false)
const hasToken = ref(false)
const error = ref(false)

const showTokenModal = ref(false)
const createdToken = ref("")


async function checkTokenStatus() {

  if (!selectedNamespace.value) {
    hasToken.value = false
    return
  }


  loading.value = true
  error.value = false


  try {

    const result = await apiFetch<NamespaceWriteTokenExist>(
      `/cfg/${selectedNamespace.value}/token/status`
    )

    hasToken.value = result.exists


  } catch (e) {

    console.error(e)

    error.value = true
    hasToken.value = false

  } finally {

    loading.value = false

  }

}


watch(
  selectedNamespace,
  () => {
    checkTokenStatus()
  },
  {
    immediate: true
  }
)



async function createToken() {

  if (!selectedNamespace.value || hasToken.value) {
    return
  }


  try {

    const result = await apiFetch<CreateTokenResponse>(
      `/cfg/${selectedNamespace.value}/token/create`,
      {
        method: "POST"
      }
    )


    createdToken.value = result.token

    showTokenModal.value = true


  } catch (e) {

    console.error(e)

  }

}



async function deleteToken() {

  if (!selectedNamespace.value) {
    return
  }


  try {

    await apiFetch(
      `/cfg/${selectedNamespace.value}/tokens`,
      {
        method: "DELETE"
      }
    )


    await checkTokenStatus()


  } catch (e) {

    console.error(e)

  }

}



async function copyToken() {

  await navigator.clipboard.writeText(createdToken.value)

}



async function closeTokenModal() {

  showTokenModal.value = false

  createdToken.value = ""

  await checkTokenStatus()

}

</script>


<template>

  <section class="card">

    <h2>APIトークン</h2>


    <p class="description">
      外部プログラムがこのネームスペースへデータを書き込むためのトークンです。<br>
      トークンは発行時にのみ表示されます。
    </p>


    <div class="actions">

      <button
        class="create-button"
        :disabled="!selectedNamespace || hasToken || loading"
        @click="createToken"
      >

        {{ hasToken
          ? "発行済みです"
          : "+ 新しいトークンを発行"
        }}

      </button>

    </div>


  </section>



  <section class="card">


    <h2>
      書き込みトークン状態
    </h2>



    <template v-if="loading">

      <p>
        確認中...
      </p>

    </template>



    <template v-else-if="error">

      <p>
        状態取得に失敗しました。
      </p>

    </template>



    <template v-else-if="!hasToken">

      <p>
        有効なトークンはありません。
      </p>

    </template>



    <template v-else>

      <div class="token-card">


        <div class="info">

          <div class="field">

            <span class="label">
              状態
            </span>

            <span>
              有効
            </span>

          </div>


        </div>



        <button
          class="delete-button"
          @click="deleteToken"
        >
          無効化
        </button>


      </div>


    </template>


  </section>




  <!-- トークン表示モーダル -->

  <div
    v-if="showTokenModal"
    class="modal-background"
  >


    <div class="modal">


      <h2>
        トークンを保存してください
      </h2>


      <p>
        このトークンは今回のみ表示されます。
        必ずコピーして保存してください。
      </p>



      <div class="token-box">

        {{ createdToken }}

      </div>



      <div class="modal-actions">


        <button
          class="copy-button"
          @click="copyToken"
        >
          コピー
        </button>



        <button
          class="confirm-button"
          @click="closeTokenModal"
        >
          保存しました
        </button>


      </div>


    </div>


  </div>


</template>



<style scoped>

.card {

  background: white;

  padding: 24px;

  margin-bottom: 12px;

  box-shadow: 0 2px 8px rgba(0,0,0,.08);

  border-radius: 8px;

}



.card h2 {

  margin: 0 0 24px;

  font-size: 22px;

  border-bottom: 1px solid #ddd;

  padding-bottom: 12px;

}



.description {

  color: #666;

  line-height: 1.6;

}



.actions {

  display: flex;

  justify-content: flex-end;

  margin-top: 24px;

}



.create-button {

  padding: 10px 20px;

  border: none;

  border-radius: 6px;

  background: #4f7cff;

  color: white;

  cursor: pointer;

}



.create-button:disabled {

  background: #aaa;

  cursor: not-allowed;

}



.token-card {

  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 18px;

  border: 1px solid #ddd;

  border-radius: 8px;

}



.field {

  display: flex;

  flex-direction: column;

  gap: 4px;

}



.label {

  color: #777;

  font-size: 13px;

  font-weight: bold;

}



.delete-button {

  padding: 8px 16px;

  border: none;

  border-radius: 6px;

  background: #d9534f;

  color:white;

  cursor:pointer;

}



/* modal */


.modal-background {

  position: fixed;

  inset: 0;

  background: rgba(0,0,0,.4);

  display:flex;

  justify-content:center;

  align-items:center;

}



.modal {

  background:white;

  width:420px;

  padding:24px;

  border-radius:10px;

}



.token-box {

  margin:20px 0;

  padding:12px;

  background:#f5f5f5;

  border:1px solid #ddd;

  border-radius:6px;

  word-break:break-all;

  font-family:monospace;

}



.modal-actions {

  display:flex;

  justify-content:flex-end;

  gap:12px;

}



.copy-button,
.confirm-button {

  padding:10px 18px;

  border:none;

  border-radius:6px;

  cursor:pointer;

}



.copy-button {

  background:#eee;

}



.confirm-button {

  background:#4f7cff;

  color:white;

}


</style>