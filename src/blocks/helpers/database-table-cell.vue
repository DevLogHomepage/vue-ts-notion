<script setup lang="ts">
import {  defineComponent, PropType } from 'vue'
import type {  ColumnSchemaType, tableValueProperties } from '@/lib/types';
import { defineNotionProps,useNotionBlock } from '@/lib/blockable';
import { defineDatabaseProps, useDatabase } from '@/lib/database';
import CheckBoxIcon from './check-box-icon.vue';
// import { formula } from '@/lib/math';

const props = defineProps({
    data:Object as PropType<tableValueProperties>,
    schemaData:Object as PropType<ColumnSchemaType>,
    ...defineDatabaseProps,
    ...defineNotionProps 
})

//@ts-ignore
const { blockMap,pass } = useNotionBlock(props)
//@ts-ignore
const { getDBTable } = useDatabase(props)



const type = (t:string | string[]) => {
    if(Array.isArray(t)) return t.includes(props.collectionData!.type)
    return props.collectionData!.type === t
}

// const isTrue = computed(() => {return getText.value[0][0] === 'Yes'})
</script>


<script lang="ts">

export default defineComponent({
    name: "NotionDBTableCell",
    components: { CheckBoxIcon }
})
</script>

<template>
    <div class="notion-database-table-cell">
        <div class="notion-database-table-text">

            {{ getDBTable(props.schemaData as ColumnSchemaType,props.data as tableValueProperties) }}
            <!-- <NotionTextRenderer v-if="!data" v-bind="pass" :text="getText"/>
            <NotionTextRenderer v-else-if="type(['date','status','select','number','phone_number','multi_select','email'])" v-bind="pass" :text="getText"/>
            <CheckBoxIcon v-else-if="type('checkbox')" :class="{'checkbox-true':isTrue}"/>
            <div></div>
            <div></div> -->
        </div>
    </div>
</template>