<script setup lang="ts">
import {  computed, defineComponent, PropType, watchEffect } from 'vue'
import type {  ColumnSchemaType, DecorationType, SchemaSelectGroup, SchemaSelectOption, tableValueProperties } from '@/lib/types';
import { defineNotionProps,useNotionBlock } from '@/lib/blockable';
import { defineDatabaseProps, useDatabase } from '@/lib/database';
import NotionTextRenderer from '@/blocks/helpers/text-renderer.vue'
import NotionTextSeperater from './text-seperater.vue';
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
const { getDBTable,getProps } = useDatabase(props)



const type = (t:string | string[]) => {
    if(Array.isArray(t)) return t.includes(props.schemaData!.type)
    return props.schemaData!.type === t
}

const isTrue = computed(() => {
    const value = getProps(props.schemaData as ColumnSchemaType,props.data as tableValueProperties)
    return value?.[0][0] === 'Yes'
})

const options = (a:DecorationType) => {
    if(!props.data) return ""
    for(let i of props.schemaData?.options as SchemaSelectOption[]){
        if(i.value === a[0][0])
            return i.color ?? 'default'
    }
    return ""
}

</script>


<script lang="ts">

export default defineComponent({
    name: "NotionDBTableCell",
    components: { CheckBoxIcon,NotionTextRenderer,NotionTextSeperater}
})

//'rollup'
</script>

<template>
    <div class="notion-database-table-cell">
        <div class="notion-database-table-text">
            <!-- {{ getProps(props.schemaData as ColumnSchemaType,props.data as tableValueProperties) }} -->
            <NotionTextRenderer v-if="!data" v-bind="pass" :text="getProps(props.schemaData as ColumnSchemaType,props.data as tableValueProperties)"/>
            <NotionTextRenderer v-else-if="type('title')" v-bind="pass" :text="getProps(props.schemaData as ColumnSchemaType,props.data as tableValueProperties)"/>
            <div v-else-if="type(['multi_select','select','status'])" class="dataabase-selectbox-conatiner">
                <NotionTextSeperater v-bind="pass"
                :color-options="props.schemaData?.options"
                :text-data="getProps(props.schemaData as ColumnSchemaType,props.data as tableValueProperties)"/>
            </div>
            <div v-else-if="type(['number'])" class="database-number">
                <NotionTextRenderer v-bind="pass" :text="getProps(props.schemaData as ColumnSchemaType,props.data as tableValueProperties)" />
            </div>
            <div v-else-if="type(['date','file','url','email','phone_number'])">
                <NotionTextRenderer v-bind="pass" :text="getProps(props.schemaData as ColumnSchemaType,props.data as tableValueProperties)"/>
            </div>
            <div v-else-if="type(['rollup','relation'])">
                <!-- {{ getProps(props.schemaData as ColumnSchemaType,props.data as tableValueProperties) }} -->
                <NotionTextRenderer v-bind="pass" :text="getProps(props.schemaData as ColumnSchemaType,props.data as tableValueProperties)"/>
            </div>
            <CheckBoxIcon v-else-if="type('checkbox')" v-bind="pass" :is-on="isTrue"/>
            <div v-else-if="type('formula')">
                <div v-if="schemaData?.formula.result_type === 'checkbox'">
                    <CheckBoxIcon v-bind="pass" :is-on="isTrue"/>
                </div>
                <div v-else-if="schemaData?.formula.result_type === 'text'"> 
                    <NotionTextRenderer v-bind="pass" :text="getProps(props.schemaData as ColumnSchemaType,props.data as tableValueProperties)"/>
                </div>
            </div>
        </div>
    </div>
</template>
