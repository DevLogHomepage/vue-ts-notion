

<script setup lang="ts">
import { useNotionBlock, defineNotionProps } from "@/lib/blockable"
import { computed, defineComponent, onMounted, ref } from 'vue'
import { BlockValue, DecorationType } from "@/lib/types";
import NotionTextRenderer from "@/blocks/helpers/text-renderer.vue"
import NotionDatabase from "./helpers/database.vue"

const props = defineProps({...defineNotionProps })
//@ts-ignore
const { block,title, pass, blockColorClass } = useNotionBlock(props)

const typesNumber = ref(0)

const header = (columnType:BlockValue) => [[columnType?.name == '' ? columnType.type : columnType.name]] as DecorationType[]
const setDisplayTable = (_:MouseEvent,index:number) => {typesNumber.value  = index}
const underLine = (index:number) => (typesNumber.value === index) ? {borderBottom: 'solid 2px rgb(55,53,47)',paddingTop:'2px',color: 'rgba(55,53,47,1)'} : ''

const tableTypes = computed(() => {
    return block?.value.collection.types
})

onMounted(() => {
    block?.value.collection.types.forEach((type,index) => {
            if(type.format?.table_wrap)
                typesNumber.value  = index
        })
})
</script>

<script lang="ts">
export default defineComponent({
    name: "NotionCollectionView",
    components: { 
        NotionTextRenderer,
        NotionDatabase,
     },
})
</script>

<template>
    <div>
        <div class="notion-database-table-block">
            <div class="notion-database-table-header">
                <div
                class="notion-database-table-header-cell" 
                v-for="(columnType,columnIndex) in tableTypes" 
                :key="columnIndex" 
                v-on:click="setDisplayTable($event,columnIndex)"
                >
                    <div :style="underLine(columnIndex)">
                        <div class="notion-database-table-cell">
                            <div class="notion-database-table-text">
                                <NotionTextRenderer :text="header(columnType)" v-bind="pass"/>
                            </div>
                        </div>
                    </div>
                </div>
    
            </div>
        </div>
        <div v-for="(blockValId,blockValIndex) in tableTypes" :key="blockValIndex">
            <NotionDatabase v-if="blockValIndex == typesNumber"
            v-bind="pass"
            :collectionData="blockValId">
            </NotionDatabase>
        </div>
    </div>
</template>