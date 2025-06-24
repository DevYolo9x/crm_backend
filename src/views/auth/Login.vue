<template>
  <div>
    <TitleGuestComponent title="Đăng nhập quản trị CRM"></TitleGuestComponent>
    <form @submit="login" class="mt-8 space-y-6 px-5 py-8 bg-white rounded-lg">
      <Alert v-if="Object.keys(errors).length" class="flex-col items-stretch text-sm mb-3">
        <div v-if="typeof errors === 'object'">
          <div v-for="(field, i) of Object.keys(errors)" :key="i">
            <div v-for="(error, ind) of errors[field] || []" :key="ind">* {{ error }}</div>
          </div>
        </div>
        <div v-else>* {{ errors }}</div>
      </Alert>
      <div class="shadow-sm">
        <div class="mb-2">
          <label for="account" class="sr-only">Tên tài khoản</label>
          <input v-model="user.account" id="account" name="account" type="text" autocomplete="" class="form-control" placeholder="Tên tài khoản" />
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input v-model="user.password" id="password" name="password" type="password" autocomplete="current-password" class="form-control" placeholder="Mật khẩu" />
        </div>
      </div>
      <div class="text-sm text-right">
        <a href="#" class="font-medium text-slate-500 underline">Quên mật khẩu?</a>
      </div>
      <div>
        <button type="submit" class="btn btn-primary">
          <span class="absolute left-0 inset-y-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
          </span>
          Đăng nhập
        </button>
      </div>
    </form>
  </div>
</template>
<script setup>
import TitleGuestComponent from '../../components/auth/TitleGuestComponent.vue'
import store from '../../store'
import { useRouter } from 'vue-router'
import { computed, reactive } from '@vue/runtime-core'
import { ref } from 'vue'
import Alert from '../../components/Alert.vue'
const route = useRouter()

const user = reactive({
  account: '',
  password: '',
})
const errors = ref({})

function login(e) {
  e.preventDefault()
  store.dispatch('auth/login', user).then((response) => {
    if (response.status) {
      route.push({ name: 'Dashboard' })
    } else {
      errors.value = response.error
    }
  })
}
</script>
