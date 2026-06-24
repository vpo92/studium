<template>
  <span>
    <span v-for="(p, i) in places" :key="i">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:2px">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
      {{ p.value || p }}<span v-if="i < places.length - 1">, </span>
    </span>
  </span>
</template>

<script setup>
defineProps({
  places: { type: [Array, Object], required: true }
})
</script>
