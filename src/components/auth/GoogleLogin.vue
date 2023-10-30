<template>
  <button class="btn btn-outline-secondary w-100" @click="login"><IconColouredGoogle /> Login Using Google</button>
</template>

<script setup lang="ts">
import { defineEmits } from "vue"
import { googleSdkLoaded } from "vue3-google-login"
import useAuthorisationApi from "@/api/AuthorisationApi"
import IconColouredGoogle from "@/components/icons/IconColouredGoogle.vue";

const { googleLogin } = useAuthorisationApi()
const emit = defineEmits(['loginSuccess'])

function login() {
  googleSdkLoaded((google) => {
    google.accounts.oauth2.initCodeClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'email profile openid',
      callback: (response) => {
        googleLogin(response).then((response) => {
          emit('loginSuccess', response)
        })
      }
    }).requestCode()
  })
}
</script>

<style scoped>
.btn svg {
  width: 30px;
  height: 30px;
}
</style>