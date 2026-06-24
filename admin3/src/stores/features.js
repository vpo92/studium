import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFeaturesStore = defineStore('features', () => {
  const features = ref({
    indexSearch: true,
    textSearch: true,
    advancedSearch: true,
    mongoSearch: true,
    mongoDump: true,
  })

  return { features }
})
