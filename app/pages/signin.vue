<script setup lang="ts">
const { user, fetch: refreshSession } = useUserSession()
const email = ref('')
const password = ref('')
const loading = ref(false)
const otpRequested = ref(false)

async function requestOtp() {
  if (!email.value) return
  loading.value = true
  try {
    await $fetch('/api/auth/otp/get', {
      method: 'POST',
      body: { email: email.value }
    })
    otpRequested.value = true
  } catch (e: any) {
    alert(e.data?.statusMessage || 'Failed to request OTP')
  } finally {
    loading.value = false
  }
}

async function verifyOtp() {
  loading.value = true
  try {
    await $fetch('/api/auth/otp/verify', {
      method: 'POST',
      body: { email: email.value, otp: password.value }
    })
    await refreshSession()
    navigateTo('/')
  } catch (e: any) {
    alert(e.data?.statusMessage || 'Invalid OTP')
  } finally {
    loading.value = false
  }
}

async function signInWithPassword() {
  if (!email.value || !password.value) return
  loading.value = true
  try {
    await $fetch('/api/auth/signin', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    await refreshSession()
    navigateTo('/')
  } catch (e: any) {
    alert('Bad credentials')
  } finally {
    loading.value = false
  }
}

function signin() {
  if (!password.value) requestOtp()
  else if (password.value.length === 6) verifyOtp()
  else signInWithPassword()
}
</script>

<template>
  <div>
    <h1>Sign In</h1>

    <form @submit.prevent="signin">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
        :disabled="loading"
      >
      <input
        v-model="password"
        type="password"
        placeholder="Password or Code"
        :disabled="loading"
      >
      <button type="submit" :disabled="loading">
        {{ loading ? 'Signing in...' : password ? 'Sign In' : 'Request OTP' }}
      </button>
      <p
        v-if="otpRequested"
        style="margin-bottom: 1rem;"
      >
        OTP sent to {{ email }}
      </p>
    </form>
  </div>
</template>
