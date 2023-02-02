<script setup lang="ts">
import {  defineComponent, PropType, ref } from 'vue'
import type {  BlockValue,  TableBlockProperties } from '@/lib/types';
import { defineNotionProps,useNotionBlock } from '@/lib/blockable';
import {useDatabase } from '@/lib/database'
import NotionTextRenderer from '@/blocks/helpers/text-renderer.vue'
import NotionDBTableCell from '@/blocks/helpers/database-table-cell.vue'

const props = defineProps({collectionData:Object as PropType<BlockValue>, ...defineNotionProps })

//@ts-ignore
const { pass } = useNotionBlock(props)
//@ts-ignore
const { schema,data,properties } = useDatabase(props)

const tableValue = ref<{[key:string]:any}>({})

const isVisible = (columnId:TableBlockProperties) => columnId.visible
</script>
  
<script lang="ts">
export default defineComponent({
    name: "NotionDBTable",
    components: {NotionDBTableCell}
})
</script>

<template>
    <div>
      <div class="notion-database-table-row" v-for="rowIndex in data.length + 1">
        <tr>
            <td
                v-for="(columnProperty, columnIndex) in properties"
                :key="columnIndex"
                class="notion-database-table-data"
                :class="{'header':(rowIndex - 1)}"
            >
                <div :style="{width:`${columnProperty.width}PX`}" v-if="isVisible(columnProperty)" >
                    <NotionDBTableCell v-bind="pass" :collection-data="schema[columnProperty.property]" :data="data[rowIndex -2]"/> 
                </div>
            </td>
        </tr>
      </div>
    </div>
  </template>