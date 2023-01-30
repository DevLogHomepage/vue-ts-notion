<script setup lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import type { DecorationType, BlockValue, Properties, TableBlockProperties } from '@/lib/types';
import { defineNotionProps,useNotionBlock } from '@/lib/blockable';
import NotionTextRenderer from '@/blocks/helpers/text-renderer.vue'

const props = defineProps({collectionData:Object as PropType<BlockValue>, ...defineNotionProps })

//@ts-ignore
const { blockMap,pass } = useNotionBlock(props)

const collection = computed(() => props.collectionData)
const format = computed(() => collection.value?.format)
const properties = computed(() => format.value?.table_properties ?? [])
const parent_id = computed(() => collection.value?.parent_id ?? '')
const parent = computed(() => props.blockMap![parent_id.value])
const data = computed(() => parent.value?.collection.data)
const schema = computed(() => parent.value.collection.schema)

const isheaderTitle = (rowIndex:number,columnProperty:TableBlockProperties) => {
    if(!rowIndex) return [[schema.value[columnProperty.property].name]] as DecorationType[]
    if(schema.value[columnProperty.property].formula){
        testing(schema.value[columnProperty.property].formula.name,schema.value[columnProperty.property].formula.args)
    }
    return (data.value[rowIndex - 1][schema.value[columnProperty.property].name] ?? [[' ']] )as DecorationType[]
}

const isVisible = (columnId:TableBlockProperties) => columnId.visible
const testing = (type:string,...[arg]:any|undefined) => console.log('formula',type,arg)
</script>
  
<script lang="ts">
export default defineComponent({
    name: "NotionDBTable",
    components: {NotionTextRenderer}
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
                    <div class="notion-database-table-cell">
                        <div class="notion-database-table-text">
                            <NotionTextRenderer :text="isheaderTitle(rowIndex-1,columnProperty)" v-bind="pass"/>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
      </div>
    </div>
  </template>