<template>
  <span>
    <span v-for="(r, i) in refList" :key="i">
      {{ r.value || r }}<span v-if="i < refList.length - 1">; </span>
    </span>
  </span>
</template>

<script setup>
defineProps({
  refList: { type: Array, required: true }
})
</script>
