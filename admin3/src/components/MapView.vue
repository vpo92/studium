<template>
  <div ref="mapEl" class="map-container" :class="{ full }"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'

const props = defineProps({
  manuscrits: { type: Array, default: () => [] },
  full: { type: Boolean, default: false }
})

const mapEl = ref(null)
let map = null
let markers = null

function initMap() {
  if (!mapEl.value || map) return
  map = L.map(mapEl.value).setView([46.5, 2.5], 5)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
  }).addTo(map)
  markers = L.layerGroup().addTo(map)
  updateMarkers()
}

function updateMarkers() {
  if (!map || !markers) return
  markers.clearLayers()
  if (!props.manuscrits || props.manuscrits.length === 0) return
  props.manuscrits.forEach(ms => {
    if (ms.lat && ms.lng) {
      L.marker([ms.lat, ms.lng])
        .bindPopup(`<b>${ms.Ville || ''}</b><br/>${ms.Bibliotheque || ''}<br/>${ms.Cote || ''}`)
        .addTo(markers)
    }
  })
  if (props.manuscrits.length > 0) {
    const bounds = markers.getBounds()
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] })
  }
}

onMounted(() => {
  initMap()
})

watch(() => props.manuscrits, () => updateMarkers(), { deep: true })
</script>
