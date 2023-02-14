import { computed, PropType, ref } from "vue";
import { NotionBlockProps,NotionDatabaseProps,Formula, ColumnSchemaType, tableValueProperties, BlockValue, Properties } from "./types";
import type { Static } from "vue";
import { useNotionBlock } from "./blockable";

import moment from 'moment'

type FormulaBaseType=
    number
    | boolean
    | string
    | Date 

type tableMapType = {[nameId:string]:any}
type relationMapType = {[nameId:string]:string}

export const defineDatabaseProps = {
    collectionData:{type: Object as PropType<BlockValue>},
    tableMap:{type:Object as PropType<tableMapType>}
}

let count = 0
class TableMap{
    static value = ref<tableMapType>({} as tableMapType)
    static relation = ref<relationMapType>({} as relationMapType)
}
export const useDatabase = (props: Readonly<NotionBlockProps & NotionDatabaseProps>) => {
    

    const setDBTable = (databaseId:string,dataId:string,data:any) => {
        if(!data) return 
        if(!TableMap.value.value[dataId] == undefined)
        console.debug('[setDBTable]',databaseId,dataId,data)
        console.debug('[tableMap]:',TableMap.value)
        TableMap.value.value[dataId] = data
        TableMap.value.value[dataId]['parent_id_title'] = databaseId
    }

    const setRelationTable = (schemaValue : {[key: string]: ColumnSchemaType;}) => {
        Object.entries(schemaValue).forEach(([key,value]) => {
            if(value.type === 'relation')
                TableMap.relation.value[key] = props.contentId ?? ''
        })
    }

    const getDBTable = (cellSchema:ColumnSchemaType,data:tableValueProperties) => {
        if(!data) return [[cellSchema.name]]
        // if(!TableMap.value.value[data.id][cellSchema.name])
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
        const relationProperty = schema.value[cellSchema.relation_property.replace('//','/')].property
        
        const targetProperty = cellSchema.target_property
        const targetSchema = props.blockMap[TableMap.relation.value[relationProperty]].collection.schema[targetProperty]
        const targetSchemaName = targetSchema.name
        const targetDataId = data[relationName]?.filter(e => e?.[1]?.[0][1] != undefined).map(e => e?.[1]?.[0][1])
        
        console.debug('[rollup]',relationId,relationName,targetProperty)

        const empty = targetDataId?.filter(e => TableMap.value.value[e as string][targetSchemaName] === undefined).length
        const not_empty = targetDataId?.filter(e => TableMap.value.value[e as string][targetSchemaName] !== undefined).length
        const allValue = targetDataId?.map(e => TableMap.value.value[e as string][targetSchemaName]?.[0][0]).filter(e => e !== undefined)
        const allDateValue = targetDataId?.map(e => TableMap.value.value[e as string][targetSchemaName]?.[0][1]).filter(e => e !== undefined)

        const allDates = allDateValue?.map(e => e?.[0][1].start_date).concat(allDateValue.map(e => e?.[0][1].end_date))
        
        const addDB = (value:any) => {
            TableMap.value.value[data.id][cellSchema.name] = value
            return value
        }


        function median(values:number[]){
            if(values.length ===0) throw new Error("No inputs");
        
            values.sort(function(a,b){
            return a-b;
            });
        
            var half = Math.floor(values.length / 2);
            
            if (values.length % 2)
            return values[half];
            
            return (values[half - 1] + values[half]) / 2.0;
        }

        switch(cellSchema.aggregation){
            case "show_unique":
                return addDB(allValue.filter((value,index,arr) => arr.indexOf(value) === index).map(e => [e]))
            case "count":
                return addDB([[targetDataId.length]])
            case "count_values":
                return addDB([[targetDataId.length]])
            case 'unique':
                return addDB([[allValue.filter((value,index,arr) => arr.indexOf(value) === index).length]])
            case 'empty':
                return addDB([[empty]])
            case 'not_empty':
                return addDB([[not_empty]])
            case 'percent_empty':
                return addDB([[empty / targetDataId.length * 100,['%']]])
            case 'percent_not_empty':
                return addDB([[not_empty / targetDataId.length * 100,['%']]])
            case 'earliest_date':
                return addDB([['ll',[['d',{start_date:Math.min(...allDates.map(e => new Date(e as string).getTime()))}]]]])
            case 'latest_date':
                return addDB([['ll',[['d',{start_date:Math.max(...allDates.map(e => new Date(e as string).getTime()))}]]]])
            case 'date_range': // need to make this unit to days years minutes
                return addDB([[
                    (Math.max(...allDates.map(e => new Date(e as string).getTime())) - 
                    Math.min(...allDates.map(e => new Date(e as string).getTime()))) / (60 * 60 * 24 * 1000)]]
                )
            case 'sum':
                return addDB([[allValue.reduce((x,y) => x + y)]])
            case 'average':
                return addDB([[allValue.reduce((x,y) => x + y) / not_empty]])
            case 'median':
                return addDB([[median(allValue)]])
            case 'min':
                return addDB([[Math.min(...allValue)]])
            case 'max':
                return addDB([[Math.max(...allValue)]])
            case 'range':
                return addDB([[Math.max(...allValue) - Math.min(...allValue)]])
            case 'checked':
                return addDB([[allValue.filter(e => e === 'Yes').length]])
            case 'unchecked':
                return addDB([[allValue.filter(e => e === 'No').length]])
            case 'percent_checked':
                const trueValue = allValue.filter(e => e === 'Yes').length
                return addDB([[trueValue ? (trueValue / allValue.length * 100).toFixed(1) : 0,['%']]])
            case 'percent_unchecked':
                const falseValue = allValue.filter(e => e === "No").length
                return addDB([[falseValue ? (falseValue / allValue.length * 100).toFixed(1) : 0,['%']]])
            default:
                const groupId = targetSchema.groups?.find(e => e.name === cellSchema.aggregation.groupName).optionIds[0]
                const optionId =  targetSchema.options?.find(e => e.id === groupId)
                const groupCount = allValue?.filter(e =>  ((e === undefined || e === '') ? targetSchema.defaultOption : e) === optionId?.value)
                switch(cellSchema.aggregation?.operator){
                    case 'percent_per_group':
                        return [[groupCount.length ? (groupCount.length /allValue.length * 100).toFixed(1) : 0,['%']]]
                    case 'count_per_group':
                        return [[`${groupCount.length} / ${allValue.length}`]]
                    default:
                        return [['NONE']]
                }
        }
    }
    const getContent = (cellContent:ColumnSchemaType,data:tableValueProperties) => {
        switch(cellContent.type){
            case 'title':
            case 'number':
            case 'checkbox':
            case 'url':
                return TableMap.value.value[data.id][cellContent.name]
            case 'date':
                if(TableMap.value.value[data.id][cellContent.name]?.[0][1])
                    return [[cellContent.date_format ?? 'll',TableMap.value.value[data.id][cellContent.name]?.[0][1]]]
                return [[undefined]] 
            case 'created_by':
                return
            case 'status':
            case 'select':
                const tempValue = TableMap.value.value[data.id][cellContent.name]
                return [(tempValue?.[0][0] == '' ||tempValue?.[0][0] == undefined) ? [[cellContent.defaultOption ?? '']] : tempValue]
            case 'last_edited_by':
                return
            case 'person': //api not supported
                return
            case 'multi_select':
                return (TableMap.value.value[data.id][cellContent.name]?.[0][0] as string)?.split(',').map(e => [[e]])
            case 'phone_number':
            case 'email':
                return [[TableMap.value.value[data.id][cellContent.name]?.[0][0],['_']]]
            case 'file': //파일과 미디어
                return [['file‣',TableMap.value.value[data.id][cellContent.name]?.[0][1]]]
            case 'relation':
                return
            case 'create_time':
                return
            case 'last_edited_time':
                return
            case 'formula':
                return getFormula(cellContent.formula,data)
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
        getDBTable,
        setRelationTable
    }
}

export const getFormula  = (cellFormula:Formula,data:tableValueProperties) => {
    const testing = formula(cellFormula,data)
    console.log('result',testing)
    return testing
}

export const formula = (cellFormula:Formula,data:tableValueProperties) => {
    let testing = [] as FormulaBaseType[]

    const property = (cellFormula:Formula) => {
        return data[cellFormula.name as string]?.[0][0]
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
        console.log('constant',type.value)
        return type.value
    }


    const operator = (type:Formula,data:FormulaBaseType[]) => {
        switch(type.name){
            case 'if':
                return if_(data as FormulaBaseType[])
            case 'add':
                return add(data as number[])
            case 'substract':
                return substract(data as number[])
            case 'multiply':
                return multiply(data as number[])
            case 'divide':
                return divide(data as number[])
            case 'pow':
                return pow(data as number[])
            case 'mod':
                return mod(data as number[])
            case 'unaryMinus':
                return unaryMinus(data as number[])
            case 'unaryPlus':
                return unaryPlus(data as number[])
            case 'not':
                return not(data as boolean[])
            case 'and':
                return and(data as boolean[])
            case 'or':
                return or(data as boolean[])
            case 'equal':
                return equal(data as boolean[])
            case 'unequal':
                return unequal(data as boolean[])
        }
    }

    const function_ = (type:Formula,data:FormulaBaseType[]) => {
        switch(type.name){
            case 'concat':
                return concat(data as string[])
            case 'join':
                return join(data as string[])
            case 'slice':
                return slice(data as FormulaBaseType[])
            case 'length':
                return length_(data as string[])
            case 'format':
                return format_(data as FormulaBaseType[])
            case 'toNumber':
                return toNum(data as number[])
            case 'contains':
                return contains(data as string[])
            case 'replace':
                return replace(data as FormulaBaseType[])
            case 'replaceAll':
                return replaceAll(data as FormulaBaseType[])
            case 'test':
                return test(data as FormulaBaseType[])
            case 'empty':
                return empty(data as FormulaBaseType[])
            case 'abs':
                return abs(data as number[])
            case 'cbrt':
                return cbrt(data as number[])
            case 'ceil':
                return ceil(data as number[])
            case 'exp':
                return ceil(data as number[])
            case 'floor':
                return floor(data as number[])
            case 'ln':
                return ln(data as number[])
            case 'log10':
                return log10(data as number[])
            case 'log2':
                return log2(data as number[])
            case 'max':
                return max(data as number[])
            case 'min':
                return min(data as number[])
            case 'sqrt':
                return sqrt(data as number[])
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
            case 'larger':
                return larger(data as FormulaBaseType[])
            case 'largerEq':
                return largerEq(data as FormulaBaseType[])
            case 'smaller':
                return smaller(data as FormulaBaseType[])
            case 'smallerEq':
                return smallerEq(data as FormulaBaseType[])
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
    const format_ = ([arg1]:FormulaBaseType[]) => {
        console.log('format',arg1)
        return  `${arg1}` 
    }
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

    if(cellFormula?.args){
        testing = cellFormula.args.map((e,i) => formula(e as Formula,data) as FormulaBaseType)
    }
    console.log('cellFormula',cellFormula,testing)

    switch(cellFormula?.type){
        case 'constant':
            return constant(cellFormula)
        case 'function':
            return function_(cellFormula,testing)
        case 'operator':
            return operator(cellFormula,testing)
        case 'conditional':
            break;
        case 'property':
            return property(cellFormula)
    }
}


const testing = (cellFormula:Formula,data:tableValueProperties,value:any) => {
    cellFormula?.args?.map(e => {

    })
}
