<script setup lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import type { DecorationType, BlockValue, TableType, ColumnSchemaType, tableValueProperties, TableBlockProperties } from '@/lib/types';
import { defineNotionProps,useNotionBlock } from '@/lib/blockable';
import { useMath } from '@/lib/math'
import NotionTextRenderer from '@/blocks/helpers/text-renderer.vue'
import { useDatabase } from '@/lib/database';
import CheckBoxIcon from './check-box-icon.vue';
// import { formula } from '@/lib/math';

const props = defineProps({
    collectionData:Object as PropType<ColumnSchemaType>,
    data:Object as PropType<tableValueProperties>,
    setRef:Function, 
    ...defineNotionProps 
})

//@ts-ignore
const { blockMap,pass } = useNotionBlock(props)
//@ts-ignore
const { schema } = useDatabase(props)
//@ts-ignore
const { formula } = useMath(props)


const type = (t:string | string[]) => {
    console.log(props.collectionData?.type)
    if(Array.isArray(t)) return t.includes(props.collectionData!.type)
    return props.collectionData!.type === t
}

const getText = computed(() => {
    if(!props.data) return [[props.collectionData?.name]] as DecorationType[]
    console.log((props.data as tableValueProperties)[props.collectionData!.name][0][0])
    return ((props.data as tableValueProperties)[props.collectionData!.name] ?? [[' ']]  )as DecorationType[]
})
const isTrue = computed(() => {return getText.value[0][0] === 'Yes'})
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
            <NotionTextRenderer v-if="!data" v-bind="pass" :text="getText"/>
            <!-- text cell -->
            <NotionTextRenderer v-else-if="type(['date','status','select','number','phone_number','multi_select','email'])" v-bind="pass" :text="getText"/>
            <!-- checkbox -->
            <CheckBoxIcon v-else-if="type('checkbox')" :class="{'checkbox-true':isTrue}"/>
            <!-- formula cell -->
            <div></div>
            <!-- rollup -->
            <div></div>
        </div>
    </div>
</template>