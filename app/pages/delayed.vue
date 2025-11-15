<script setup lang="ts">
import { onMounted } from 'vue'


console.log('[delayed] setup —', import.meta.server ? 'SERVER' : 'CLIENT')


// Не грузим на сервере: запуск фетча произойдёт ПОСЛЕ гидрации
const { data, pending, refresh } = await useAsyncData(
    'delayed',
    () => $fetch('/api/slow'),
    { server: false }
)


onMounted(async () => {
  console.log('[delayed] onMounted — клиент смонтирован; фетч идёт на клиенте')
// refresh() можно вызвать вручную при необходимости
})
</script>


<template>
  <div class="stack">
    <h2>/delayed (server:false)</h2>
    <pre v-if="data">{{ data }}</pre>
    <p v-else>Loading… pending={{ pending }}</p>
    <NuxtLink to="/">Back</NuxtLink>
  </div>
</template>