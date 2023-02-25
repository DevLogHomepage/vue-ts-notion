<script setup lang="ts">
import { defineComponent, PropType } from 'vue'
import type { DecorationType, SchemaSelectOption } from '@/lib/types';
import { defineNotionProps,useNotionBlock } from '@/lib/blockable';
import { defineDatabaseProps } from '@/lib/database';
import NotionTextRenderer from '@/blocks/helpers/text-renderer.vue'

const props = defineProps({
    textData:Object as PropType<DecorationType[] | string>,
    colorOptions:Object as PropType<SchemaSelectOption[] | undefined>,    
    ...defineDatabaseProps,
    ...defineNotionProps 
})

//@ts-ignore
const { pass } = useNotionBlock(props)

const options = (element:DecorationType) => {
    if(props.colorOptions){
        for(let i of props.colorOptions){
            if(i.value === element[0]) return i.color ?? 'default'
        }
    }
    else return ""
}

</script>

<script lang="ts">
export default defineComponent({
    name:"NotionTextSeperater"
})
</script>

<template>

    <div class="dataabase-selectbox-conatiner">
        <div v-for="e in textData" 
        :style="{backgroundColor:`var(--notion-select-${options(e as DecorationType)})`}" 
        class="database-selectbox">
            <NotionTextRenderer v-bind="pass" :text="e"/>
        </div>
    </div>
</template>
