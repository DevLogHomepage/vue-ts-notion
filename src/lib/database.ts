import { computed } from "vue";
import { NotionBlockProps,NotionDatabaseProps } from "./types";

export const useDatabase = (props: Readonly<NotionBlockProps & NotionDatabaseProps>) => {
    const collection = computed(() => props.collectionData)
    const format = computed(() => collection.value?.format)
    const properties = computed(() => format?.value.table_properties ?? [])
    const parent_id = computed(() => collection.value?.parent_id ?? '')
    const parent = computed(() => props.blockMap![parent_id.value])
    const data = computed(() => parent.value?.collection.data)
    const schema = computed(() => parent.value.collection.schema)

    const type = (t:string | string[]) => {
        
    }
    return{
        collection,
        format,
        properties,
        parent_id,
        parent,
        data,
        schema
    }
}