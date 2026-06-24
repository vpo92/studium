<template>
  <div>
    <div v-for="(v, i) in versionList" :key="i" class="version-item">
      <div v-if="v.title"><span class="label">Titre : </span>{{ v.title.value || v.title }}</div>
      <div v-if="v.dateAndPlace"><span class="label">Date et lieu : </span>{{ formatItem(v.dateAndPlace) }}</div>
      <div v-if="v.language"><span class="label">Langue : </span>{{ formatItem(v.language) }}</div>
      <div v-if="v.manuscrits"><RenderMS :ms-list="v.manuscrits" /></div>
      <RenderMeta :meta="v.meta" />
    </div>
  </div>
</template>

<script setup>
import RenderMS from './RenderMS.vue'
import RenderMeta from './RenderMeta.vue'

defineProps({
  versionList: { type: Array, required: true }
})

function formatItem(item) {
  if (!item) return ''
  if (Array.isArray(item)) return item.map(x => x.value || x).join('; ')
  return item.value || item
}
</script>
