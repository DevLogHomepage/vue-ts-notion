<script setup lang="ts">
import { useNotionBlock, defineNotionProps } from "@/lib/blockable"
import NotionDecorator from "@/blocks/decorator.vue"
// import { DecorationType } from "@/lib/types";
import { PropType } from "vue"
import type {DecorationType} from '@/lib/types'

const props = defineProps({ text: Object as PropType< DecorationType[] | string[]>, ...defineNotionProps })
//@ts-ignore
const { pass, format } = useNotionBlock(props)

</script>

<script lang="ts">
export default {
  name: "NotionTextRenderer",
}
</script>

<template>
  <span>
    <NotionDecorator v-for="(t, i) in text" :key="i" :content="(t as DecorationType)" v-bind="pass" />
  </span>
</template>
