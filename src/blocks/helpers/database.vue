

<script setup lang="ts">
import { useNotionBlock, defineNotionProps } from "@/lib/blockable"
import NotionDBTable from '@/blocks/helpers/database-table.vue'
import { defineDatabaseProps } from "@/lib/database";

const props = defineProps({...defineDatabaseProps, ...defineNotionProps })
//@ts-ignore
const { pass } = useNotionBlock(props)

const isType = (t:string | string[]) => {
  if (Array.isArray(t)) {
      return t.includes(props.collectionData!.type)
    }
    return props.collectionData?.type === t
}
</script>

<script lang="ts">
export default {
    name: "NotionDatabase",
    components:{NotionDBTable}
}

  </script>

<template>
  <div>
    <div v-if="isType('board')">1</div>
    <div v-else-if="isType('calendar')">2</div>
    <div v-else-if="isType('gallery')">3</div>
    <div v-else-if="isType('list')">4</div>
    <div v-if="isType('table')">
      <NotionDBTable  
      :collectionData="props.collectionData"
      v-bind="pass" />
    </div>
    <div v-else-if="isType('timeline')">6</div>
  </div>
</template>