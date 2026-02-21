<script setup lang="ts">
const { user, fetch: refreshSession, openInPopup } = useUserSession()
const email = ref('')
const password = ref('')
const loading = ref(false)
const otpRequested = ref(false)

const isPasswordValid = computed(() => {
  return /.{12,}|[0-9]{6}/.test(password.value)
})

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

async function signInWithMicrosoft() {
  openInPopup('/auth/microsoft') // signin but stays on signin page
}

function signin() {
  if (!email.value) return
  setTimeout(() => {
    if (!password.value) requestOtp()
    else if (password.value.length === 6) verifyOtp()
    else signInWithPassword()
  }, 100) // wait for paste event to complete
}
</script>

<template>
  <div>
    <h1>Sign In</h1>
    <form @submit.prevent="signin">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        :disabled="loading"
        autocomplete="username"
      >
      <br>
      <label for="password">Password or code</label>
      <input
        id="password"
        v-model="password"
        type="password"
        :disabled="loading"
        autocomplete="current-password"
        pattern=".{12,}|[0-9]{6}"
        @paste="signin"
      >
      <p v-if="password && !isPasswordValid"">
        The password must be at least 12 characters long or be the code that you received.
      </p>
      <br>
      <button
        type="submit"
        :disabled="loading"
      >
        {{ loading ? 'Signing in...' : password ? 'Sign In' : 'Request Code' }}
      </button>
      <button
        type="button"
        :disabled="loading"
        @click="signInWithMicrosoft"
      >
        Sign in with Microsoft
      </button>
      <a href="/auth/microsoft" class="login-button">
        Login with Microsoft
      </a>
      <p v-if="otpRequested">Code sent to {{ email }}</p>
    </form>
  </div>
</template>
