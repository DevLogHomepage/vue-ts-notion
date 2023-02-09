<script setup lang="ts">
import {  computed, defineComponent, PropType } from 'vue'
import type {  ColumnSchemaType, DecorationType, SchemaSelectGroup, SchemaSelectOption, tableValueProperties } from '@/lib/types';
import { defineNotionProps,useNotionBlock } from '@/lib/blockable';
import { defineDatabaseProps, useDatabase } from '@/lib/database';
import NotionTextRenderer from '@/blocks/helpers/text-renderer.vue'
import CheckBoxIcon from './check-box-icon.vue';
// import { formula } from '@/lib/math';

const props = defineProps({
    data:Object as PropType<tableValueProperties>,
    schemaData:Object as PropType<ColumnSchemaType>,
    ...defineDatabaseProps,
    ...defineNotionProps 
})

//@ts-ignore
const { blockMap,pass,parent } = useNotionBlock(props)
//@ts-ignore
const { getDBTable } = useDatabase(props)



const type = (t:string | string[]) => {
    if(Array.isArray(t)) return t.includes(props.schemaData!.type)
    return props.schemaData!.type === t
}

// const isTrue = computed(() => {return getText.value[0][0] === 'Yes'})

const options = (a:DecorationType) => {
    if(!props.data) return ""
    for(let i of props.schemaData?.options as SchemaSelectOption[]){
        if(i.value === a[0][0])
            return i.color ?? 'default'
    }
    return ""
}

const groups = (a:DecorationType) => {
    if(!props.data) return ''
    for(let i of props.schemaData?.groups as SchemaSelectGroup[]){
        console.log(a[0][0],i.name)
        if(i.name === a[0][0])
            return i.color
    }
    return ""
}
</script>


<script lang="ts">

export default defineComponent({
    name: "NotionDBTableCell",
    components: { CheckBoxIcon,NotionTextRenderer }
})
</script>

<template>
    <div class="notion-database-table-cell">
        <div class="notion-database-table-text">
            <NotionTextRenderer v-if="!data" v-bind="pass" :text="getDBTable(props.schemaData as ColumnSchemaType,props.data as tableValueProperties)"/>
            <NotionTextRenderer v-else-if="type('title')" v-bind="pass" :text="getDBTable(props.schemaData as ColumnSchemaType,props.data as tableValueProperties)"/>
            <div v-else-if="type(['multi_select','select'])" class="dataabase-selectbox-conatiner">
                <div v-for="e in getDBTable(props.schemaData as ColumnSchemaType,props.data as tableValueProperties)" 
                :style="{backgroundColor:`var(--notion-select-${options((e as DecorationType))})`}" 
                class="database-selectbox">
                    <NotionTextRenderer v-bind="pass" :text="e"/>
                </div>
            </div>
            <div v-else-if="type('number')" class="database-number">
                <NotionTextRenderer v-bind="pass" :text="getDBTable(props.schemaData as ColumnSchemaType,props.data as tableValueProperties)" />
            </div>
            <div v-else-if="type('status')">
                <!-- {{ getDBTable(props.schemaData as ColumnSchemaType,props.data as tableValueProperties) }} -->
                <div v-for="e in getDBTable(props.schemaData as ColumnSchemaType,props.data as tableValueProperties)" 
                :style="{backgroundColor:`var(--notion-select-${options((e as DecorationType))})`}" 
                class="database-selectbox">
                    <NotionTextRenderer v-bind="pass" :text="e"/>
                </div>
            </div>
            <!-- <NotionTextRenderer v-if="!data" v-bind="pass" :text="getText"/>
            <NotionTextRenderer v-else-if="type(['date','status','select','number','phone_number','multi_select','email'])" v-bind="pass" :text="getText"/>
            <CheckBoxIcon v-else-if="type('checkbox')" :class="{'checkbox-true':isTrue}"/>
            <div></div>
            <div></div> -->
        </div>
    </div>
</template>