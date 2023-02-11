<script setup lang="ts">
import { defineNotionProps, useNotionBlock } from '@/lib/blockable';
import { PropType, StyleValue, defineComponent,computed } from 'vue';

const props = defineProps({
    isOn:Boolean,
    ...defineNotionProps 
})

</script>

<script lang="ts">
export default defineComponent({
    name:"CheckBoxIcon"
})
</script>

<template>
<div class="checkbox-container" :class="`checkbox-${ props.isOn ? 'true' : 'false'}`">
    <div class="checkbox-icon-container">
        <svg v-if="isOn" viewBox="0 0 14 14" class="check" style="width: 12px; height: 12px; flex-shrink: 0; backface-visibility: hidden;"><polygon points="5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.9968652 0 6.49933039"></polygon></svg>
        <svg v-else viewBox="0 0 16 16" class="checkboxSquare" style="width: 100%; height: 100%; display: block; flex-shrink: 0; backface-visibility: hidden;"><path d="M1.5,1.5 L1.5,14.5 L14.5,14.5 L14.5,1.5 L1.5,1.5 Z M0,0 L16,0 L16,16 L0,16 L0,0 Z"></path></svg>
    </div>
    
</div>
</template>

