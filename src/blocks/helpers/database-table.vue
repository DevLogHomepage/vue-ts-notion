<script setup lang="ts">
import { defineComponent, onBeforeMount, onMounted } from 'vue'
import type { TableBlockProperties } from '@/lib/types';
import { defineNotionProps,useNotionBlock } from '@/lib/blockable';
import { useDatabase,defineDatabaseProps } from '@/lib/database'
import NotionDBTableCell from '@/blocks/helpers/database-table-cell.vue'

const props = defineProps({...defineDatabaseProps, ...defineNotionProps })

//@ts-ignore
const { pass,parent,properties:blockProperties } = useNotionBlock(props)
//@ts-ignore
const { schema,data,properties,setDBTable,setRelationTable } = useDatabase(props)

const isVisible = (columnId:TableBlockProperties) => columnId.visible

onBeforeMount(() => {
    data.value.forEach((d,i) => {
        setDBTable(parent.value.value.id,d.id,d)
    })
    console.log(blockProperties.value)
    setRelationTable(schema.value)
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