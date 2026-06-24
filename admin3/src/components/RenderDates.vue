<template>
  <span>
    <span v-for="(d, i) in formattedDates" :key="i">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:2px">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      {{ d }}<span v-if="i < formattedDates.length - 1">, </span>
    </span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  dates: { type: [Array, Object], required: true }
})

const formattedDates = computed(() => {
  const list = Array.isArray(props.dates) ? props.dates : [props.dates]
  return list.map(d => {
    const val = d.value || d
    if (d.type === 'SIMPLE') return val
    if (d.type === 'AFTER') return `après ${val}`
    if (d.type === 'BEFORE') return `avant ${val}`
    if (d.type === 'NEAR') return `vers ${val}`
    if (d.type === 'INTERVAL') return val
    return val
  })
})
</script>
