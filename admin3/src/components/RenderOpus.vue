<template>
  <div>
    <div v-for="(opus, i) in opusList" :key="i" class="opus-card">
      <div class="opus-title" v-if="opus.title">
        <template v-for="(tItem, ti) in (Array.isArray(opus.title) ? opus.title : [opus.title])" :key="ti">
          {{ tItem.value || tItem }}<span v-if="ti < opus.title.length - 1">; </span>
        </template>
      </div>
      <div style="margin-top:4px;font-size:12px;color:var(--gray-600)">
        <div v-if="opus.dateAndPlace"><span class="label">Date et lieu : </span>{{ formatDatePlace(opus.dateAndPlace) }}</div>
        <div v-if="opus.language"><span class="label">Langue : </span>{{ formatLanguage(opus.language) }}</div>
        <div v-if="opus.manuscrits">
          <span class="label">Manuscrits : </span>
          <RenderMS :ms-list="opus.manuscrits" />
        </div>
        <div v-if="opus.versions"><RenderVersion :version-list="opus.versions" /></div>
        <div v-if="opus.comment"><span class="label">Commentaire : </span><RenderComment :comment-list="opus.comment" /></div>
        <div v-if="opus.reference"><span class="label">Référence : </span><RenderReference :ref-list="opus.reference" /></div>
        <template v-for="(v, k) in extraKeys(opus)" :key="k">
          <div><span class="label">{{ t(k) }} : </span><span>{{ formatValue(v) }}</span></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '../services/messages'
import RenderMS from './RenderMS.vue'
import RenderVersion from './RenderVersion.vue'
import RenderComment from './RenderComment.vue'
import RenderReference from './RenderReference.vue'

const props = defineProps({
  opusList: { type: Array, required: true }
})

const knownKeys = ['title', 'titleVariant', 'dateAndPlace', 'language', 'manuscrits', 'versions', 'incipits', 'colophon', 'editionBefore1700', 'dedicaceOrAdress', 'editorialWork', 'versionWork', 'modernEdition', 'illustration', 'otherLanguage', 'bibliography', 'comment', 'reference']

function extraKeys(opus) {
  const obj = {}
  for (const [k, v] of Object.entries(opus)) {
    if (!knownKeys.includes(k)) obj[k] = v
  }
  return obj
}

function formatDatePlace(v) {
  if (Array.isArray(v)) return v.map(x => x.value || x).join('; ')
  return v.value || v
}

function formatLanguage(v) {
  if (Array.isArray(v)) return v.map(x => t(x.value || x)).join(', ')
  return t(v.value || v)
}

function formatValue(v) {
  if (v === null || v === undefined) return ''
  if (Array.isArray(v)) return v.map(x => x.value || x).join('; ')
  if (typeof v === 'object') return v.value || JSON.stringify(v)
  return String(v)
}
</script>
