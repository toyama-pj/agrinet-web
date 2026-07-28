<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: false
})

const step = ref<'email' | 'code' | 'register' | 'registercode'>('email')

const email = ref('');

function onNext(mail: string) {
  email.value = mail
  step.value = 'code'
}

function onRegister() {
  step.value = 'register'
}

function onRegisterCode(mail: string) {
  email.value = mail
  step.value = 'registercode'
}
</script>

<template>
  <div class="login">
    <EmailBox
      v-if="step === 'email'"
      @next="onNext"
      @register="onRegister"
    />

    <OneTimeLoginCodeBox
      :email="email"
      v-else-if="step === 'code'"
      @back="step = 'email'"
    />

    <Registration
      v-else-if="step === 'register'"
      @back="step = 'email'"
      @registercode="onRegisterCode"
    />

    <RegistrationCode
      :email="email"
      v-else-if="step === 'registercode'"
      @back="step = 'register'"
    />
  </div>
</template>

<style scoped>

.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  font-size: 1.2rem;
  background-color: rgb(222, 222, 222);
}

</style>