<template>
  <div v-if="meta" class="meta-group">
    <div v-if="meta.dates" style="margin-top:4px">
      <span class="label">Dates : </span>
      <RenderDates :dates="meta.dates" />
    </div>
    <div v-if="meta.places" style="margin-top:4px">
      <span class="label">Lieux : </span>
      <RenderPlaces :places="meta.places" />
    </div>
    <div v-if="meta.names" style="margin-top:4px">
      <span class="label">Noms : </span>
      <RenderNames :names="meta.names" />
    </div>
  </div>
</template>

<script setup>
import RenderDates from './RenderDates.vue'
import RenderPlaces from './RenderPlaces.vue'
import RenderNames from './RenderNames.vue'

defineProps({
  meta: { type: Object, default: null }
})
</script>
