<script setup lang="ts">
import type { User } from '#auth-utils'

definePageMeta({
  middleware: ['authenticated'],
})

const { user, clear: clearSession } = useUserSession()
const { data: fileList, refresh } = await useFetch('/api/files')
const { data: publicUsers } = await useFetch<User[]>('/api/public-users')
const uploading = ref(false)
const path = ref('realtime')

async function signout () {
  await clearSession()
  await navigateTo('/signin')
}

async function uploadFile(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  uploading.value = true
  const formData = new FormData()
  formData.append('file', file!)
  formData.append('path', path.value)

  try {
    await $fetch('/api/files/upload', {
      method: 'POST',
      body: formData
    })
    await refresh()
    input.value = '' 
  } catch (e: any) {
    alert(e.data?.statusMessage || 'Upload failed')
  } finally {
    uploading.value = false
  }
}

async function deleteFile(id: number) {
  if (!confirm('Are you sure you want to delete this file?')) return

  try {
    await $fetch(`/api/files/${id}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (e: any) {
    alert(e.data?.statusMessage || 'Delete failed')
  }
}

let eventSource: EventSource | null = null

function setPublicUser() {
  return $fetch('/api/public-users', {
    method: 'POST'
  })
}
onMounted(() => {
  eventSource = new EventSource('/api/files/listen?path=realtime')
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'change') {
      refresh()
    }
  }
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
  }
  setPublicUser()
})
</script>

<template>
  <div style="padding: 2rem; font-family: sans-serif;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h1>Welcome {{ user?.name }}</h1>
      <button @click="signout">Sign Out</button>
    </div>

    <div style="margin-bottom: 2rem; border: 1px dashed #ccc; padding: 2rem;">
      <h3>Upload File</h3>
      <input type="text" v-model="path">
      <input type="file" @change="uploadFile" :disabled="uploading" />
      <span v-if="uploading">Uploading...</span>
    </div>

    <h2>Your Files</h2>
    <ul v-if="fileList && fileList.length">
      <li v-for="file in fileList" :key="file.id" style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 1rem;">
        <a :href="file.path" target="_blank">{{ file.filename }}</a> 
        <span style="color: #666; font-size: 0.9em;">
          ({{ Math.round(file.size / 1024) }} KB) - 
          {{ new Date(file.uploadedAt).toLocaleString() }}
        </span>
        <button @click="deleteFile(file.id)" style="color: red; cursor: pointer;">Delete</button>
      </li>
    </ul>
    <p v-else>No files uploaded yet.</p>

    <h2>Your Public Users</h2>
    <div
      v-for="user in publicUsers"
      :key="user.id"
    >
      <p>{{ user.name }} - {{ user.email }}</p>
    </div>
  </div>
</template>
