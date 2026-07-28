<script setup lang="ts">
import type { GrantType } from '~/types/namespace'


const { apiFetch } = useApi()

const selectedNamespace = useSelectedNamespace()


type Member = {
  name: string
  email: string
  grant_type: GrantType
}


const members = ref<Member[]>([])


const newMemberEmail = ref("")
const newMemberPermission = ref<GrantType>("r")


const loading = ref(false)
const error = ref(false)



const permissionLabels: Record<string, string> = {
  r: "閲覧のみ",
  w: "書き込み",
  rw: "閲覧・書き込み",
  admin: "管理者"
}


const canAddMember = computed(() => {

  const validEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(newMemberEmail.value)

  return validEmail &&
    !!newMemberPermission.value

})





async function loadMembers() {

  if (!selectedNamespace.value) {

    members.value = []

    return
  }


  loading.value = true
  error.value = false


  try {

    members.value =
      await apiFetch<Member[]>(
        `/cfg/${selectedNamespace.value}/members`
      )


  } catch(e) {

    console.error(e)

    members.value = []

    error.value = true


  } finally {

    loading.value = false

  }

}




watch(
  selectedNamespace,
  () => {

    loadMembers()

  },
  {
    immediate:true
  }
)





async function addMember() {

  if (
    !selectedNamespace.value ||
    !canAddMember.value
  ) {
    return
  }


  try {

    await apiFetch(
      `/cfg/${selectedNamespace.value}/invite`,
      {
        method:"POST",

        body:{
          email:newMemberEmail.value,
          grant_type:newMemberPermission.value
        }
      }
    )


    newMemberEmail.value = ""
    newMemberPermission.value = "r"


    await loadMembers()


  } catch(e) {

    console.error(e)

  }

}





async function removeMember(email:string) {

  if (!selectedNamespace.value) {

    return

  }


  try {

    await apiFetch(
      `/cfg/${selectedNamespace.value}/disinvite`,
      {
        method:"POST",

        body:{
          email
        }
      }
    )


    await loadMembers()


  } catch(e) {

    console.error(e)

  }

}

</script>



<template>

<section class="card">

<h2>
メンバー追加
</h2>


<p class="description">
この子機へアクセスできるユーザーを追加します。
</p>



<div class="add-form">


<div class="field">

<span class="label">
メールアドレス
</span>


<input
v-model="newMemberEmail"
type="email"
placeholder="example@example.com"
/>

</div>




<div class="field">

<span class="label">
権限
</span>


<select
v-model="newMemberPermission"
>

<option value="r">
閲覧のみ
</option>

<option value="w">
書き込み
</option>

<option value="rw">
閲覧・書き込み
</option>

<option value="admin">
管理者
</option>

</select>

</div>




<button
:disabled="!canAddMember"
:class="{ disabled: !canAddMember }"
@click="addMember"
>

+ メンバーを追加

</button>


</div>

</section>





<section class="card">


<h2>
登録メンバー ({{ members.length }})
</h2>




<template v-if="loading">

<p>
読み込み中...
</p>

</template>



<template v-else-if="error">

<p>
取得に失敗しました。
</p>

</template>




<template v-else>


<div
v-for="member in members"
:key="member.email"
class="member-card"
>


<div class="info">


<div class="field">

<span class="label">
名前
</span>

<span>
{{ member.name }}
</span>

</div>




<div class="field">

<span class="label">
メールアドレス
</span>

<span>
{{ member.email }}
</span>

</div>




<div class="field">

<span class="label">
権限
</span>

<span>
{{ permissionLabels[member.grant_type] }}
</span>

</div>



</div>




<button
class="delete"
@click="removeMember(member.email)"
>

削除

</button>


</div>


</template>


</section>


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

  border-bottom: 1px solid #ddd;

  padding-bottom: 12px;
}


.description {
  color: #666;

  line-height: 1.6;
}



.add-form {

  display: flex;

  align-items: flex-end;

  gap: 20px;

  margin-top: 24px;

}



.field {

  display: flex;

  flex-direction: column;

  gap: 6px;

}



.label {

  color: #777;

  font-size: 13px;

  font-weight: bold;

}



input,
select {

  padding: 10px 12px;

  border-radius: 6px;

  border: 1px solid #ccc;

  font-size: 14px;

}



input {

  width: 260px;

}



button {

  padding: 10px 18px;

  border: none;

  border-radius: 6px;

  background: #4f7cff;

  color: white;

  cursor: pointer;

}



button.disabled,
button:disabled {

  background: #aaa;

  cursor: not-allowed;

}



.member-card {

  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 18px;

  border: 1px solid #ddd;

  border-radius: 8px;

  margin-bottom: 14px;

}



.info {

  display: flex;

  gap: 60px;

}



.delete {

  background: #d9534f;

}


</style>