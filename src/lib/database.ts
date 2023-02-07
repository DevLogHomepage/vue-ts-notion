import { computed, PropType, ref } from "vue";
import { NotionBlockProps,NotionDatabaseProps,Formula, ColumnSchemaType, BaseDecorationType, tableValueProperties, BlockValue } from "./types";
import type { Static } from "vue";
import { useNotionBlock } from "./blockable";

type FormulaBaseType=
    number
    | boolean
    | string
    | Date 

type tableMapType = {[nameId:string]:any}

export const defineDatabaseProps = {
    collectionData:{type: Object as PropType<BlockValue>},
    tableMap:{type:Object as PropType<tableMapType>}
}

class TableMap{
    static value = ref<tableMapType>({} as tableMapType)
}
export const useDatabase = (props: Readonly<NotionBlockProps & NotionDatabaseProps>) => {
    const { pass:passBlock} = useNotionBlock(props)
    
    // const tableMap = ref<tableMapType>({} as tableMapType)
    // let tableMapTesting = {}
    // const tableMap = {}
    const setDBTable = (databaseId:string,dataId:string,data:any) => {
        if(!data) return 
        if(!TableMap.value.value[dataId] == undefined)
        console.debug('[setDBTable]',databaseId,dataId,data)
        console.debug('[tableMap]:',TableMap.value)
        TableMap.value.value[dataId] = data
        TableMap.value.value[dataId]['parent_id_title'] = databaseId
    }
    
    const getDBTable = (cellSchema:ColumnSchemaType,data:tableValueProperties) => {
        if(!data) return cellSchema.name
        // if(TableMap.value.value[data.id]) return TableMap.value.value[data.id]
        return getContent(cellSchema,data)
    }
    
    const collection = computed(() => props.collectionData)
    const format = computed(() => collection.value?.format)
    const properties = computed(() => format?.value.table_properties ?? [])
    const parent_id = computed(() => collection.value?.parent_id ?? '')
    const parent = computed(() => props.blockMap![parent_id.value])
    const data = computed(() => parent.value?.collection.data)
    const schema = computed(() => parent.value.collection.schema)

    const type = (t:string | string[]) => {
        if(Array.isArray(t)) return t.includes(props.collectionData!.type)
        return props.collectionData!.type === t
    }

    const rollup = (cellSchema:ColumnSchemaType,data:tableValueProperties) => {
        const relationId = schema.value[cellSchema.relation_property.replace('//','/')].collection_id
        const relationName = schema.value[cellSchema.relation_property.replace('//','/')].name
        
        const targetProperty = cellSchema.target_property
        console.debug('[rollup]',relationId,relationName,targetProperty)
        const targetDataId = data[relationName].filter(e => e?.[1]?.[0][1] != undefined).map(e => e?.[1]?.[0][1])
        targetDataId.forEach(e => {
            console.log(TableMap.value.value[e as string])
        })
    
        // return returnValue
    }
    const getContent = (cellContent:ColumnSchemaType,data:tableValueProperties) => {
        console.log('getContent',data)
        switch(cellContent.type){
            case 'title':
                // console.log('title',TableMap.value.value[data.id][cellContent.name])
                return TableMap.value.value[data.id][cellContent.name]
            case 'date':
                return
            case 'created_by':
                return
            case 'status':
                return
            case 'select':
                return
            case 'last_edited_by':
                return
            case 'person':
                return
            case 'url':
                return
            case 'phone_number':
                return
            case 'multi_select':
                return
            case 'email':
                return
            case 'file':
                return
            case 'relation':
                return
            case 'create_time':
                return
            case 'last_edited_time':
                return
            case 'number':
                return
            case 'checkbox':
                return
            case 'formula':
                return
            case 'rollup':
                return rollup(cellContent,data)
        }
    }


    return{
        collection,
        format,
        properties,
        parent_id,
        parent,
        data,
        schema,
        type,
        rollup,
        getContent,
        setDBTable,
        getDBTable
        // pass
    }
}



export const useFormula = (props: Readonly<NotionBlockProps & NotionDatabaseProps>) => {
    const {schema,type} = useDatabase(props)


    // const getContent = (type:Formula) => {
    //     if(type.args){
    //         (type.args as Formula[])?.forEach(e => {
    //             getContent(e)
    //         })
    //     }

    //     switch(type.type){
    //         case 'constant':
    //             return constant(type)
    //         case 'function':
    //             return function_(type)
    //         case 'operator':
    //             return operator(type)
    //         case 'conditional':
    //             return 
    //         case 'property':
    //             return property(type)
    //     }     
    // }

    const property = (type:Formula) => {
        schema.value[type.id as string]
    }

    const constant = (type:Formula) => {
        switch(type.name){
            case "e": 
                return 2.718281828459045;
            case "pi":
                return 3.14159265359;
            case "true":
                return true;
            case "false":
                return false;
        }
        return type.value
    }

    const operator = (type:Formula) => {
        switch(type.name){
            case 'if':
                return if_(type.args as FormulaBaseType[])
            case 'add':
                return add(type.args as number[])
            case 'substract':
                return substract(type.args as number[])
            case 'multiply':
                return multiply(type.args as number[])
            case 'divide':
                return divide(type.args as number[])
            case 'pow':
                return pow(type.args as number[])
            case 'mod':
                return mod(type.args as number[])
            case 'unaryMinus':
                return unaryMinus(type.args as number[])
            case 'unaryPlus':
                return unaryPlus(type.args as number[])
            case 'not':
                return not(type.args as boolean[])
            case 'and':
                return and(type.args as boolean[])
            case 'or':
                return or(type.args as boolean[])
            case 'equal':
                return equal(type.args as boolean[])
            case 'unequal':
                return unequal(type.args as boolean[])
            case 'larger':
                return larger(type.args as FormulaBaseType[])
            case 'largerEq':
                return largerEq(type.args as FormulaBaseType[])
            case 'smaller':
                return smaller(type.args as FormulaBaseType[])
            case 'smallerEq':
                return smallerEq(type.args as FormulaBaseType[])
        }
    }

    const function_ = (type:Formula) => {
        switch(type.name){
            case 'concat':
                return concat(type.args as string[])
            case 'join':
                return join(type.args as string[])
            case 'slice':
                return slice(type.args as FormulaBaseType[])
            case 'length':
                return length_(type.args as string[])
            case 'format':
                return format_(type.args as FormulaBaseType[])
            case 'toNumber':
                return toNum(type.args as number[])
            case 'contains':
                return contains(type.args as string[])
            case 'replace':
                return replace(type.args as FormulaBaseType[])
            case 'replaceAll':
                return replaceAll(type.args as FormulaBaseType[])
            case 'test':
                return test(type.args as FormulaBaseType[])
            case 'empty':
                return empty(type.args as FormulaBaseType[])
            case 'abs':
                return abs(type.args as number[])
            case 'cbrt':
                return cbrt(type.args as number[])
            case 'ceil':
                return ceil(type.args as number[])
            case 'exp':
                return ceil(type.args as number[])
            case 'floor':
                return floor(type.args as number[])
            case 'ln':
                return ln(type.args as number[])
            case 'log10':
                return log10(type.args as number[])
            case 'log2':
                return log2(type.args as number[])
            case 'max':
                return max(type.args as number[])
            case 'min':
                return min(type.args as number[])
            case 'sqrt':
                return sqrt(type.args as number[])
            case 'start':
                return ''
            case 'end':
                return ''
            case 'now':
                return ''
            case 'timestamp':
                return ''
            case 'fromTimestamp':
                return ''
            case 'dateAdd':
                return ''
            case 'dateSubtract':
                return ''
            case 'dateBetween':
                return ''
            case 'formatDate':
                return ''
            case 'minute':
                return ''
            case 'hour':
                return ''
            case 'day':
                return '' 
            case 'month':
                return ''
            case 'year':
                return ''
            case 'id':
                return ''
        }     
    }

    const if_ = ([arg1,args2,args3]:FormulaBaseType[]) => arg1 ? args2 : args3
    const add = ([arg1,arg2]:number[]) => arg1 + arg2
    const substract = ([arg1,arg2]:number[]) => arg1 - arg2
    const multiply= ([arg1,arg2]:number[]) => arg1 * arg2
    const divide = ([arg1,arg2]:number[]) => arg1 / arg2
    const pow = ([arg1,arg2]:number[]) => Math.pow(arg1,arg2)
    const mod = ([arg1,arg2]:number[]) => arg1 % arg2
    const unaryMinus = ([arg1]:number[]) => arg1 * -1
    const unaryPlus = ([arg1]:number[]) => +arg1
    const not = ([arg1]:boolean[]) => !arg1
    const and = ([arg1,arg2]:boolean[]) => arg1 && arg2 
    const or = ([arg1,arg2]:boolean[]) => arg1 || arg2
    const equal = ([arg1,arg2]:boolean[]) => arg1 == arg2
    const unequal = ([arg1,arg2]:boolean[]) => arg1 != arg2
    const larger = ([arg1,arg2]:FormulaBaseType[]) => arg1 > arg2
    const largerEq = ([arg1,arg2]:FormulaBaseType[]) => arg1 >= arg2
    const smaller = ([arg1,arg2]:FormulaBaseType[]) => arg1 < arg2
    const smallerEq = ([arg1,arg2]:FormulaBaseType[]) => arg1 <= arg2

    const concat = (args:string[]) => args.join('')
    const join =([arg1,...args]:string[]) => args.join(arg1)
    const slice = ([arg1,arg2,arg3]:FormulaBaseType[]) => (arg1 as string).slice(arg2 as number,arg3 as number) 
    const length_ = ([arg1]:string[]) => arg1.length 
    const format_ = ([arg1]:FormulaBaseType[]) => `${arg1}` 
    const toNum = ([arg1]:(number)[]) => +arg1 
    const contains = ([arg1,arg2]:string[]) => arg1.indexOf(arg2) > 0 
    const replace = ([arg1,arg2,arg3]:FormulaBaseType[]) => format_([arg1]).replace(arg2 as string,arg3 as string) 
    const replaceAll = ([arg1,arg2,arg3]:FormulaBaseType[]) => format_([arg1]).replaceAll(arg2 as string,arg3 as string) 
    const test = ([arg1,arg2]:FormulaBaseType[]) => format_([arg1]).indexOf(arg2 as string) != -1 
    const empty = ([arg1]:FormulaBaseType[]) => format_([arg1]) == '' 
    const abs = ([arg1]:number[]) => Math.abs(arg1) 
    const cbrt = ([arg1]:number[]) => Math.cbrt(arg1) 
    const ceil = ([arg1]:number[]) => Math.ceil(arg1) 
    const exp = ([arg1]:number[]) => Math.exp(arg1) 
    const floor = ([arg1]:number[]) => Math.floor(arg1) 
    const ln = ([arg1]:number[]) => Math.log(arg1) 
    const log10 = ([arg1]:number[]) => Math.log10(arg1) 
    const log2 = ([arg1]:number[]) => Math.log2(arg1) 
    const max = ([...args]) => Math.max(...args) 
    const min = ([...args]) => Math.min(...args) 
    const sign = ([arg1]:number[]) => Math.sign(arg1) 
    const sqrt = ([arg1]:number[]) => Math.sqrt(arg1) 
    const round = ([arg1]:number[]) => Math.round(arg1) 

    return {
        operator,
        function_,
    }
}
