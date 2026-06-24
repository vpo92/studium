<template>
  <div>
    <template v-if="isArray">
      <div v-for="(item, i) in prop" :key="i">
        <RenderProperty :prop="item" :path="`${path}[${i}]`" />
      </div>
    </template>
    <template v-else-if="isObjectWithValue">
      <div class="fiche-property-list">
        <li v-if="prop.value">
          <span v-if="label" class="label">{{ label }} : </span>
          <span v-html="formatValue(prop.value)"></span>
        </li>
        <li v-if="prop.opus">
          <RenderOpus :opus-list="prop.opus" />
        </li>
        <li v-if="prop.manuscrits">
          <RenderMS :ms-list="prop.manuscrits" />
        </li>
        <RenderMeta :meta="prop.meta" />
        <li v-if="prop.comment">
          <span class="label">Commentaire : </span>
          <RenderComment :comment-list="prop.comment" />
        </li>
        <li v-if="prop.reference">
          <span class="label">Référence : </span>
          <RenderReference :ref-list="prop.reference" />
        </li>
        <li v-if="prop.versions">
          <RenderVersion :version-list="prop.versions" />
        </li>
      </div>
    </template>
    <template v-else-if="isObject">
      <div v-if="hasNameKey" class="fiche-property">
        <div class="fiche-property-title">{{ t(path) }}</div>
        <ul class="fiche-property-list">
          <li v-for="(v, k) in prop" :key="k">
            <RenderProperty :prop="v" :path="`${path}.${k}`" />
          </li>
        </ul>
      </div>
      <RenderProperty v-else v-for="(v, k) in prop" :key="k" :prop="v" :path="`${path}.${k}`" />
    </template>
    <template v-else>
      <span v-html="formatValue(prop)"></span>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '../services/messages'
import RenderOpus from './RenderOpus.vue'
import RenderMS from './RenderMS.vue'
import RenderMeta from './RenderMeta.vue'
import RenderComment from './RenderComment.vue'
import RenderReference from './RenderReference.vue'
import RenderVersion from './RenderVersion.vue'

const props = defineProps({
  prop: { type: [Object, Array, String, Number, Boolean], required: true },
  path: { type: String, default: '' }
})

const isArray = computed(() => Array.isArray(props.prop))
const isObject = computed(() => props.prop !== null && typeof props.prop === 'object' && !isArray.value)
const isObjectWithValue = computed(() => isObject.value && ('value' in props.prop || 'opus' in props.prop || 'manuscrits' in props.prop || 'versions' in props.prop))
const hasNameKey = computed(() => isObject.value && Object.keys(props.prop).length > 0 && !('value' in props.prop))

const label = computed(() => {
  const p = props.path
  const last = p.split('.').pop()
  if (!isNaN(last)) return ''
  return t(last)
})

function formatValue(v) {
  if (v === null || v === undefined) return ''
  return String(v).replace(/[$&:£*%]/g, '').trim()
}
</script>
