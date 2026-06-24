<template>
  <span>
    <span v-for="(ms, i) in msList" :key="i" class="ms-item" @click="loadAndOpenMap(ms)" style="cursor:pointer">
      {{ ms.value || ms }}
    </span>
  </span>
</template>

<script setup>
const props = defineProps({
  msList: { type: Array, required: true }
})

const emit = defineEmits(['show-map'])

function loadAndOpenMap(ms) {
  emit('show-map', ms.value || ms)
}
</script>
