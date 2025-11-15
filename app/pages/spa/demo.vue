<script setup lang="ts">
import { onMounted } from 'vue'
console.log('[spa/demo] setup —', import.meta.server ? 'SERVER' : 'CLIENT')
const when = ref<string>('')


onMounted(() => {
  when.value = new Date().toLocaleTimeString()
  console.log('[spa/demo] onMounted — чистый CSR, SSR отключён правилом routeRules')
})
</script>


<template>
  <div class="stack">
    <h2>SPA island</h2>
    <p>Mounted at: {{ when }}</p>
    <NuxtLink to="/">Back</NuxtLink>
  </div>
</template>