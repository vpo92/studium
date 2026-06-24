<template>
  <span>
    <span v-for="(n, i) in names" :key="i">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:2px">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      {{ n.value || n }}<span v-if="i < names.length - 1">, </span>
    </span>
  </span>
</template>

<script setup>
defineProps({
  names: { type: [Array, Object], required: true }
})
</script>
