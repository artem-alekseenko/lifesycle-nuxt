<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue'


console.log('[index] setup —', import.meta.server ? 'SERVER' : 'CLIENT')


// На сервере: выполнится и положит данные в payload
// На клиенте при первом заходе: возьмёт из payload (без второго запроса)
const { data: settings } = await useFetch('/api/site/settings')


onBeforeMount(() => {
  console.log('[index] onBeforeMount — компонент перед гидрацией')
})


onMounted(() => {
  console.log('[index] onMounted — компонент после гидрации')
})
</script>


<template>
  <div class="stack">
    <h1>{{ settings?.title }}</h1>
    <p><NuxtLink to="/delayed">Go to /delayed</NuxtLink></p>
    <p><NuxtLink to="/spa/demo">Go to SPA island (/spa/demo)</NuxtLink></p>
  </div>
</template>


<style scoped>
.stack { display: grid; gap: .75rem; }
</style>