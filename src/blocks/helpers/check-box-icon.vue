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
<div class="checkbox-container">
    <div class="checkbox-icon-container">
        <svg viewBox="0 0 14 14" class="check" style="width: 12px; height: 12px; flex-shrink: 0; backface-visibility: hidden;"><polygon points="5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.9968652 0 6.49933039"></polygon></svg>
    </div>
</div>
</template>

