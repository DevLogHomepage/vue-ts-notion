<script setup lang="ts">
import { useNotionBlock, defineNotionProps } from "@/lib/blockable"
import NotionKatek from "@/blocks/helpers/katex.vue"
import { computed, PropType } from "vue"
import { BlockMap, ColumnSchemaType, DecorationType,type subDateFormat } from "@/lib/types";
import moment from 'moment'
import {TableMap} from "@/lib/database"
const props = defineProps({
  content: Object as PropType<DecorationType>,
  ...defineNotionProps,
})
//@ts-ignore
const { props: blockProps, pass, type, hasPageLinkOptions, pageLinkProps } = useNotionBlock(props)

const text = computed(() => props.content?.[0])
const decorators = computed(() => props.content?.[1] || [])
const decoratorKey = computed(() => decorators.value?.[0]?.[0])
const decoratorValue = computed(() => decorators.value?.[0]?.[1])
const unappliedDecorators = computed(() => {
  const clonedDecorators = JSON.parse(JSON.stringify(decorators.value || []))
  clonedDecorators.shift() // remove applied decorator
  return clonedDecorators
})
const nextContent = computed(() => [text.value, unappliedDecorators.value] as DecorationType)
const isPageLink = computed(() => text.value as string === "‣")
const isFileMedia = computed(() => text.value as string === "file‣")
const isUnderLine = computed(() => text.value as string === "_")
const isInlinePageLink = computed(() => (decoratorValue.value as string)?.[0] === "/")
const pageLinkTitle = computed(
  () => blockProps.blockMap?.[decoratorValue.value as string]?.value?.properties?.title?.[0]?.[0] || "link"
)
const target = computed(() => {
  if (type.value === "page") {
    return blockProps.pageLinkTarget
  }
  return blockProps.textLinkTarget
})

const name = (id:string) => {
  const data = TableMap.value.value[id]
  const parentId = data.parent_id_title as string
  const relationSchema = (props.blockMap as BlockMap)[parentId].collection.schema
  const [_,value] = Object.entries(relationSchema).find(([_,value]) => value.type === 'title') ?? ['','']

  return data[(value as ColumnSchemaType).name][0][0]
}

const dateFormated = (date:string) => {
  if(!date) return ''
  return moment(date).format(text.value as string)
}

const dateStart = computed(() => dateFormated((decoratorValue.value as subDateFormat).start_date))
const dateEnd = computed(() => dateFormated((decoratorValue.value as subDateFormat).end_date))
</script>

<script lang="ts">
export default {
  name: "NotionDecorator",
  inheritAttrs: false
}
</script>

<template>
  <!-- {{ decoratorKey }} -->
  <span v-if="decoratorKey === 'p'">
    {{ name(decoratorValue as string) }}
  </span>
  <component
    v-else-if="isPageLink && hasPageLinkOptions"
    class="notion-link"
    v-bind="pageLinkProps(decoratorValue as string)"
    :is="blockProps.pageLinkOptions?.component"
  >
    {{ pageLinkTitle }}
  </component>
  <div
    v-else-if="isFileMedia" class="notion-link">
    <img :src="`${decoratorValue}`"/>
  </div>
  <span v-else-if="decoratorKey === 'd'" v-if="decoratorValue">
    <div>{{ dateStart }}</div>
    <div v-if="dateEnd"> → {{ dateEnd }}</div>
  </span>
  <component
    v-else-if="decoratorKey === 'a' && hasPageLinkOptions && isInlinePageLink"
    class="notion-link"
    v-bind="pageLinkProps((decoratorValue as string).slice(1))"
    :is="blockProps.pageLinkOptions?.component"
  >
    <NotionDecorator :content="nextContent" v-bind="pass" />
  </component>
  <a
    v-else-if="decoratorKey === 'a' && isInlinePageLink"
    class="notion-link"
    :target="target"
    :href="blockProps.mapPageUrl((decoratorValue as string).slice(1))"
  >
    <NotionDecorator :content="nextContent" v-bind="pass" />
  </a>
  <a v-else-if="decoratorKey === 'a'" class="notion-link" :target="target" :href="(decoratorValue as string)">
    <NotionDecorator :content="nextContent" v-bind="pass" />
  </a>
  <span v-else-if="decorators.length === 0">{{ text }}</span>
  <span v-else-if="decoratorKey === 'h'" :class="'notion-' + decoratorValue"
    ><NotionDecorator :content="nextContent" v-bind="pass" />
  </span>
  <code v-else-if="decoratorKey === 'c'" class="notion-inline-code">
    <NotionDecorator :content="nextContent" v-bind="pass" />
  </code>
  <b v-else-if="decoratorKey === 'b'">
    <NotionDecorator :content="nextContent" v-bind="pass" />
  </b>
  <em v-else-if="decoratorKey === 'i'">
    <NotionDecorator :content="nextContent" v-bind="pass" />
  </em>
  <s v-else-if="decoratorKey === 's'">
    <NotionDecorator :content="nextContent" v-bind="pass" />
  </s>
  <u v-else-if="decoratorKey === '_'" class="notion-underline">
    <NotionDecorator :content="nextContent" v-bind="pass" />
  </u>
  <a v-else-if="decoratorKey === '%'">
    <NotionDecorator :content="nextContent" v-bind="pass" />%
  </a>
  <NotionKatek v-else-if="decoratorKey === 'e' && blockProps.katex" :expression="(decoratorValue as string)" />
  <code v-else-if="decoratorKey === 'e'" class="notion-inline-code">
    {{ decoratorValue }}
  </code>
  <a
    v-else-if="isPageLink"
    class="notion-link"
    :target="blockProps.pageLinkTarget"
    :href="blockProps.mapPageUrl(decoratorValue)"
    >{{ pageLinkTitle }}</a
  >
  <NotionDecorator v-else :content="nextContent" v-bind="pass" />
</template>
