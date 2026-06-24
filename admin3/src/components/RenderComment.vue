<template>
  <span>
    <span v-for="(c, i) in commentList" :key="i">
      {{ c.value || c }}<span v-if="i < commentList.length - 1">; </span>
    </span>
  </span>
</template>

<script setup>
defineProps({
  commentList: { type: Array, required: true }
})
</script>
