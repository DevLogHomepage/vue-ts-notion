import { computed, PropType, ref } from "vue";
import { NotionBlockProps,NotionDatabaseProps,Formula, ColumnSchemaType, tableValueProperties, BlockValue, AggregationType, DecorationType } from "./types";

type FormulaBaseType=
    number
    | boolean
    | string
    | Date 

// 테이블 데이터를 각각 저장하기 위한 자료형
/** Type to save tableMap row data */ 
type tableMapType = {[nameId:string]:any}

// 각 collection Data(데이터 베이스)의 관계를 저장하기 위한 자료형
/** 
 * Type to save each of collection Data(database)'s relation
 * 
 * each releation data's uid(schema id) is store with parent block id
 */
type relationMapType = {[nameId:string]:string}

// schmea 아이디와 schema 아이디가 존재하는 블럭의 아이디와 함께 저장하기 위한 자료형
/**
 * Type to save schema id with parent block id
 * 
 * use in relation types MUST NEEDED
 */
type schemaMapType = {[nameId:string]:string[]}

export const defineDatabaseProps = {
    collectionData:{type: Object as PropType<BlockValue>},
    tableMap:{type:Object as PropType<tableMapType>}
}

/**
 * temporary data store variable for displaying table
 */
class TableMap{
    static value = ref<tableMapType>({} as tableMapType)
    static relation = ref<relationMapType>({} as relationMapType)
    static schema = ref<schemaMapType>({} as schemaMapType)
}

export const useDatabase = (props: Readonly<NotionBlockProps & NotionDatabaseProps>) => {
    // block's collection
    const collection = computed(() => props.collectionData)
    // collection's format
    const format = computed(() => collection.value?.format)
    // collection's properties (properties store database view data)
    const properties = computed(() => format?.value.table_properties ?? [])
    // database's parent block id
    const parent_id = computed(() => collection.value?.parent_id ?? '')
    // database's parent
    const parent = computed(() => props.blockMap![parent_id.value])
    // database display data (different with properties data)
    const data = computed(() => parent.value?.collection.data)
    // collection view's schema data
    const schema = computed(() => parent.value.collection.schema)
    
    /**
     * get specific data in the table row data
     * 
     * @param schemaData database table cell's schema data
     * @param tableData data of the row
     * @returns `decorationType` extract data from `tableData` using `schemaData`'s data 
     */
    const getProps = (schemaData:ColumnSchemaType,tableData:tableValueProperties) => {
        if(!tableData) return [[schemaData.name]] //case when tableData got undefined
        //case when tableData doesn't have schemaData property
        if(!tableData[schemaData.name] || !schemaData) setProps(schemaData,tableData)
        // which different type have different process to make `decorationType`
        switch(schemaData.type){
            case 'title':
            case 'number':
            case 'checkbox':
            case 'url':
                return tableData[schemaData.name]
            case 'date':
                if(TableMap.value.value[tableData.id][schemaData.name]?.[0][1])
                    return [[schemaData.date_format ?? 'll',TableMap.value.value[tableData.id][schemaData.name]?.[0][1]]]
            case 'status':
            case 'select':
                const tempValue = tableData[schemaData.name]
                return (tempValue?.[0][0] == '' ||tempValue?.[0][0] == undefined) ? [[schemaData.defaultOption ?? '']] : tempValue
            case 'multi_select':
                return (tableData[schemaData.name]?.[0][0] as string)?.split(',').map(e => [e])
            case 'phone_number':
            case 'email':
                return [[tableData[schemaData.name]?.[0][0],['_']]]
            case 'file': //파일과 미디어
                return [['file‣',tableData[schemaData.name]?.[0][1]]]
        }
        return tableData[schemaData.name]
    }

    /**
     * setting props for the database Table variable(TableMap)
     * 
     * @param schemaData database table cell's schema data
     * @param tableData data of the row
     */
    const setProps = (schemaData:ColumnSchemaType,tableData:tableValueProperties) => {
        switch(schemaData.type){
            //this is for not making warnings
            //all of the database Table props are built in backend api
            case 'relation':
            case 'select':
            case 'title':
            case 'checkbox':
            case 'date':
            case 'status':
            case 'multi_select':
                break
            // rollup and formula are needed to calculate from data so setProps are needed
            case 'rollup':
                TableMap.value.value[tableData.id][schemaData.name] = rollup(schemaData,tableData)
                break
            case 'formula':
                TableMap.value.value[tableData.id][schemaData.name] =getFormula(schemaData,tableData)
                break
            default:
                console.warn(`${schemaData.type} is NOT SUPPORTED!`)
        }
    }

    /**
     * function that pre load needed information for building tables
     */
    const preloadRelation = () => {
        console.debug('tableMap',TableMap.value.value)
        console.debug('tableMap',TableMap.relation.value)
        
        Object.entries(props.blockMap).forEach(([blockMapKey,value]) =>{
            if(!value['collection']) return
            value.collection.data.forEach(data => {
                if(!TableMap.value.value[data.id]){
                    TableMap.value.value[data.id] = data
                    TableMap.value.value[data.id]['parent_id_title'] = blockMapKey
                }
            })
            Object.entries(value.collection.schema).forEach(([key,value]) => {
                if(value.type === 'relation') TableMap.relation.value[key] = blockMapKey
                if(!TableMap.schema.value[blockMapKey]) TableMap.schema.value[blockMapKey] = []
                TableMap.schema.value[blockMapKey].push(key)
            })

        })
    }

    /**
     * custom function that getting medians
     * 
     * @param numbers list of number need to get medians
     * @returns `number`
     */
    const median = (numbers:number[]) => {
        const sorted = numbers.slice().sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
      
        if (sorted.length % 2 === 0) 
          return (sorted[middle - 1] + sorted[middle]) / 2;
        else return sorted[middle];
    }

    /**
     * 
     * @param cellSchema database table cell schema data
     * @param data data of the row
     * @returns DecorationType[]
     */
    const rollup = (cellSchema:ColumnSchemaType,data:tableValueProperties) => {
        const relation = schema.value[cellSchema.relation_property.replace('//','/')]
        const relationName = relation.name
        const relationProperty = relation.property
        const targetProperty = cellSchema.target_property
        const targetSchema = props?.blockMap[TableMap.relation.value[relationProperty]].collection.schema[targetProperty]
        const targetSchemaName = targetSchema.name

        const targetData = data[relationName]?.filter(e => ((e?.[1]?.[0][1] != undefined) && TableMap.value.value[e?.[1]?.[0][1] as string]))
        const targetDataId = targetData?.map(e => e?.[1]?.[0][1])
        if(!targetDataId || !targetData.length) return [['']]
        targetDataId?.forEach(e => {
            if(!TableMap.value.value[e as string]) setProps(targetSchema,data)
        })

        // length of data that are blanked
        const empty = targetDataId?.filter(e => TableMap.value.value[e as string][targetSchemaName] === undefined).length
        // length of data that are not blanked
        const not_empty = targetDataId?.filter(e => TableMap.value.value[e as string][targetSchemaName] !== undefined).length
        // all of the `decorationType` of relation 
        const allTesting = targetDataId?.map(e => getProps(targetSchema,TableMap.value.value[e as string]))
        // all text of the `decorationType` Array
        const allValue = allTesting?.map(e => e?.[0][0]).filter(e => e !== undefined)
        // all decorationValue of the `decorationType` Array
        const allDateValue = allTesting?.map(e => e?.[0][1]).filter(e => e !== undefined)
        // all Date data of the `decorationType` Array
        const allDates = allDateValue?.map(e => e?.[0]?.[1]?.start_date).concat(allDateValue.map(e => e?.[0]?.[1]?.end_date))
        
        switch(cellSchema.aggregation){
            case "show_unique":
                return allValue.filter((value,index,arr) => arr.indexOf(value) === index).map(e => [e])
            case "count":
                return [[targetDataId.length]   ]
            case "count_values":
                return [[targetDataId.length]]
            case 'unique':
                return [[allValue.filter((value,index,arr) => arr.indexOf(value) === index).length]]
            case 'empty':
                return [[empty]]
            case 'not_empty':
                return [[not_empty]]
            case 'percent_empty':
                return [[empty / targetDataId.length * 100,['%']]]
            case 'percent_not_empty':
                return [[not_empty / targetDataId.length * 100,['%']]]
            case 'earliest_date':
                return [['ll',[['d',{start_date:Math.min(...allDates.map(e => new Date(e as string).getTime()))}]]]]
            case 'latest_date':
                return [['ll',[['d',{start_date:Math.max(...allDates.map(e => new Date(e as string).getTime()))}]]]]
            case 'date_range': // need to make this unit to days years minutes
                return [[
                    (Math.max(...allDates.map(e => new Date(e as string).getTime())) - 
                    Math.min(...allDates.map(e => new Date(e as string).getTime()))) / (60 * 60 * 24 * 1000)]]
            case 'sum':
                return [[allValue.reduce((x,y) => x + y)]]
            case 'average':
                return [[allValue.reduce((x,y) => x + y) / not_empty]]
            case 'median':
                return [[median(allValue)]]
            case 'min':
                return [[Math.min(...allValue)]]
            case 'max':
                return [[Math.max(...allValue)]]
            case 'range':
                return [[Math.max(...allValue) - Math.min(...allValue)]]
            case 'checked':
                return [[allValue.filter(e => e === 'Yes').length]]
            case 'unchecked':
                return [[allValue.filter(e => e === 'No').length]]
            case 'percent_checked':
                const trueValue = allValue.filter(e => e === 'Yes').length
                return [[trueValue ? (trueValue / allValue.length * 100).toFixed(1) : 0,['%']]]
            case 'percent_unchecked':
                const falseValue = allValue.filter(e => e === "No").length
                return [[falseValue ? (falseValue / allValue.length * 100).toFixed(1) : 0,['%']]]
            default:
                const groupId = targetSchema.groups?.find(e => e.name === (cellSchema.aggregation as AggregationType).groupName)!.optionIds[0]
                const optionId =  targetSchema.options?.find(e => e.id === groupId)
                const groupCount = allValue?.filter(e =>  ((e === undefined || e === '') ? targetSchema.defaultOption : e) === optionId?.value)
                switch((cellSchema.aggregation as AggregationType)?.operator){
                    case 'percent_per_group':
                        return [[groupCount.length ? (groupCount.length /allValue.length * 100).toFixed(1) : 0,['%']]]
                    case 'count_per_group':
                        return [[`${groupCount.length} / ${allValue.length}`]]
                    default:
                        const rollupNames = targetDataId.map(e => TableMap.value.value[e as string][targetSchemaName]?.[0])
                        return rollupNames
                }
        }
    }

    /**
     * To start recursive function in formula type
     * 
     * @param schemaData database table schema data
     * @param data data of the row
     * @returns DecorationType[]
     */
    const getFormula  = (schemaData:ColumnSchemaType,data:tableValueProperties) => {
        console.group()
        console.debug('[Formula]:','schemaData',schemaData,data)
        let returnValue
        try{
            returnValue = formula(schemaData,schemaData.formula,data)
        }
        catch(e){
            console.error()
        }
        console.debug('result:',returnValue)
        console.groupEnd()
        if(schemaData.formula.result_type === 'checkbox') return [[returnValue ? "Yes" : "No"]]
        if(schemaData.formula.result_type === 'text') return [[returnValue]]
        return returnValue
    }

    /**
     * Main part of formula recursive
     * 
     * @param schemaData database table schema data
     * @param cellFormula database's formula
     * @param data data of the row
     * @returns `Formula` | `FormulaBaseType`
     */
    const formula = (schemaData:ColumnSchemaType,cellFormula:Formula,data:tableValueProperties):Formula | FormulaBaseType => {
        let arg = cellFormula?.args?.map(e => formula(schemaData,e as Formula,data)) as FormulaBaseType[]
        switch(cellFormula?.type){
            case 'constant':
                return constant(cellFormula)
            case 'function':
                return function_(cellFormula,arg)
            case 'operator':
                return operator(cellFormula,arg)
            case 'conditional':
                return conditional(schemaData,cellFormula,data)
            case 'property':
                const targetSchema = Object.entries(TableMap.schema.value).find(([key,value]) => value.includes(cellFormula.id as string))?.[0]
                if(!targetSchema) return ''
                const testingProps = props.blockMap[targetSchema].collection.schema[cellFormula.id as string]
                const propertValue =  getProps(testingProps,data)
                console.debug('[Formula] - property',propertValue,testingProps,data)
                if(propertValue?.[0]?.[1]?.[0] === '%') return propertValue?.[0]?.[0] * 0.01
                if(Array.isArray(propertValue[0][0])){
                    console.log('proper',propertValue[0][0][0])
                    return propertValue[0][0][0]
                }
                return propertValue?.[0][0] ?? propertValue
        }
    }

    /**
     * process for constant type in formula
     * 
     * @param type database formula
     * @returns `FormulaBaseType`
     */
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
        console.debug('[Formula] - constant',type.value)
        return type.value
    }

    /**
     * to process conditional type in formula( different with function if)
     * 
     * @param schemaData database table schema data
     * @param type database formula
     * @param data data of the row
     * @returns `Formula` | `FormulaBaseType`
     */
    const conditional = (schemaData:ColumnSchemaType,type:Formula,data:tableValueProperties) => {
        const conditionArg = formula(schemaData,type.condition,data)
        if(conditionArg)
            return formula(schemaData,type.true,data)
        else return formula(schemaData,type.false,data)
    }

    /**
     * to process operator type in formula( different with function if)
     * 
     * @param type database formula
     * @param data data of the row
     * @returns `FormulaBaseType`
     */
    const operator = (type:Formula,data:FormulaBaseType[]):FormulaBaseType => {
        switch(type.name){
            case 'if':
                return if_(data as FormulaBaseType[])
            case 'add':
                return add(data as number[])
            case 'subtract':
                return subtract(data as number[])
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
            case 'larger':
                return larger(data as FormulaBaseType[])
            case 'largerEq':
                return largerEq(data as FormulaBaseType[])
            case 'smaller':
                return smaller(data as FormulaBaseType[])
            case 'smallerEq':
                return smallerEq(data as FormulaBaseType[])
            default:
                console.warn(`${type.name} is NOT SUPPORTED!!`)
                return ''
        }
    }

    /**
     * to process function type in formula( different with function if)
     * 
     * @param type database formula
     * @param data data of the row
     * @returns `FormulaBaseType`
     */
    const function_ = (type:Formula,data:FormulaBaseType[]):FormulaBaseType => {
        //Todo: this `function` type's function needed to fill
        switch(type.name){
            case 'if':
                return if_(data as FormulaBaseType[])
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
            case 'round':
                return round(data as number[])
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
            default:
                console.warn(`${type.name} is NOT SUPPORTED!!`)
                return ''
        }     
    }

    const if_ = ([arg1,args2,args3]:FormulaBaseType[]) => arg1 ? args2 : args3
    const add = ([arg1,arg2]:number[]) => arg1 + arg2
    const subtract = ([arg1,arg2]:number[]) => arg1 - arg2
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
        collection,
        format,
        properties,
        parent_id,
        parent,
        data,
        schema,
        getProps,
        setProps,
        preloadRelation
    }

}