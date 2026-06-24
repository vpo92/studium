<template>
  <div>
    <div v-for="(value, key) in filteredFiche" :key="key" class="fiche-chapter">
      <div class="fiche-chapter-title">{{ t(key) }}</div>
      <RenderProperty :prop="value" :path="key" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import RenderProperty from './RenderProperty.vue'
import { t } from '../services/messages'

const props = defineProps({
  fiche: { type: Object, required: true }
})

const skipKeys = ['_id', 'reference', 'title', 'link', 'raw', 'extras']
const filteredFiche = computed(() => {
  const obj = {}
  for (const [k, v] of Object.entries(props.fiche)) {
    if (!skipKeys.includes(k)) obj[k] = v
  }
  return obj
})
</script>
