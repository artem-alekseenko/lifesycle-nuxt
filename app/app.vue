<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue'

console.log('[App] setup —', import.meta.server ? 'SERVER' : 'CLIENT')

onBeforeMount(() => {
  console.log('[App] onBeforeMount — перед гидрацией приложения (клиент)')
})

onMounted(() => {
  console.log('[App] onMounted — после гидрации приложения (клиент)')
})
</script>


<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
