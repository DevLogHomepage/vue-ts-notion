<script setup lang="ts">
import { defineComponent, onMounted } from 'vue'
import type { TableBlockProperties } from '@/lib/types';
import { defineNotionProps,useNotionBlock } from '@/lib/blockable';
import { useDatabase,defineDatabaseProps } from '@/lib/database'
import NotionDBTableCell from '@/blocks/helpers/database-table-cell.vue'

const props = defineProps({...defineDatabaseProps, ...defineNotionProps })

//@ts-ignore
const { pass } = useNotionBlock(props)
//@ts-ignore
const { schema,data,properties,preloadRelation,setProps } = useDatabase(props)

const isVisible = (columnId:TableBlockProperties) => columnId.visible

onMounted(() => {
    Object.entries(schema.value).forEach(([key,value]) => {
        data.value.forEach(d => {
            setProps(value,d)
        })
    })
})

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
                <div :style="{width:`${columnProperty.width}PX`}" v-if="isVisible(columnProperty) && (schema[columnProperty.property] ?? false)" >
                    <NotionDBTableCell v-bind="pass" :collection-data="props.collectionData" :schema-data="schema[columnProperty.property.replace('//','/')]" :data="data[rowIndex -2]"/> 
                </div>
            </td>
        </tr>
      </div>
    </div>
  </template>