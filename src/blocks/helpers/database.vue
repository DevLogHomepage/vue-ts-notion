

<script setup lang="ts">
import { useNotionBlock, defineNotionProps } from "@/lib/blockable"
import { computed, PropType } from "vue"
import { BlockValue } from "@/lib/types";
import NotionDBTable from '@/blocks/helpers/database-table.vue'

const props = defineProps({collectionData:Object as PropType<BlockValue>, ...defineNotionProps })
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
    components:{NotionDBTable},
    // props:{
    //     displayType:
    // }
}

  </script>

<template>
  <div>

  </div>
    <div v-if="isType('board')">1</div>
    <div v-else-if="isType('calendar')">2</div>
    <div v-else-if="isType('gallery')">3</div>
    <div v-else-if="isType('list')">4</div>
    <NotionDBTable :collectionData = "collectionData" v-if="isType('table')" v-bind="pass"/>
    <!-- <div v-else-if="isType('table')">5</div> -->
    <div v-if="isType('timeline')">6</div>
</template>