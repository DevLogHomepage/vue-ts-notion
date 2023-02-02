import type { Formula, NotionBlockProps, NotionDatabaseProps } from "@/lib/types";
import type { Static } from "vue";
import { useDatabase } from "./database"; 

//Todo: blockable 만들어 놓은 것 처럼 해서 넣어서 사용하기

//database-table
//database-Calendar
//database-timeline
//database-list
//database-gallery
//database-board

// database-table-cell
// database-calendar-cell
// database-timeline-cell
// database-list-cell
// database-gallery-cell
// database-board-cell


type FormulaBaseType=
    number
    | boolean
    | string
    | Date 

//TODO: 반활할 경우 반환을 바로 하는게 아니라 타입 변환 해주고 
//type: number, boolean

export const useMath = (props: Readonly<NotionBlockProps & NotionDatabaseProps>) => {
    const {schema} = useDatabase(props)

    const formula = (type:Formula) => {
        if(type.args){
            (type.args as Formula[])?.forEach(e => {
                formula(e)
            })
        }

        console.log('midle',type)
        const args = type.args as FormulaBaseType[]
        switch(type.type){
            case 'constant':
                return constant(type)
            case 'function':
                return function_(type)
            case 'operator':
                return operator(type)
            case 'conditional':
                return 
            case 'property':
                return property(type)
        }
    }

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
        formula
    }
}


const testing = {"name": "Progress",
"type": "formula",
"formula": {
    "args": [
        {
            "args": [
                {
                    "args": [
                        {
                            "id": "khOi",
                            "name": "Percent",
                            "type": "property",
                            "result_type": "number"
                        },
                        {
                            "type": "constant",
                            "value": 100,
                            "value_type": "number",
                            "result_type": "number"
                        }
                    ],
                    "name": "multiply",
                    "type": "operator",
                    "operator": "*",
                    "result_type": "number"
                },
                {
                    "type": "constant",
                    "value": 100,
                    "value_type": "number",
                    "result_type": "number"
                }
            ],
            "name": "largerEq",
            "type": "operator",
            "operator": ">=",
            "result_type": "checkbox"
        },
        {
            "type": "constant",
            "value": "▓▓▓▓▓▓▓▓▓▓ 100%🏆",
            "value_type": "string",
            "result_type": "text"
        },
        {
            "true": {
                "type": "constant",
                "value": "░░░░░░░░░░0%",
                "value_type": "string",
                "result_type": "text"
            },
            "type": "conditional",
            "false": {
                "args": [
                    {
                        "args": [
                            {
                                "args": [
                                    {
                                        "type": "constant",
                                        "value": "▓▓▓▓▓▓▓▓▓▓",
                                        "value_type": "string",
                                        "result_type": "text"
                                    },
                                    {
                                        "type": "constant",
                                        "value": 0,
                                        "value_type": "number",
                                        "result_type": "number"
                                    },
                                    {
                                        "args": [
                                            {
                                                "args": [
                                                    {
                                                        "id": "khOi",
                                                        "name": "Percent",
                                                        "type": "property",
                                                        "result_type": "number"
                                                    },
                                                    {
                                                        "type": "constant",
                                                        "value": 10,
                                                        "value_type": "number",
                                                        "result_type": "number"
                                                    }
                                                ],
                                                "name": "multiply",
                                                "type": "operator",
                                                "operator": "*",
                                                "result_type": "number"
                                            }
                                        ],
                                        "name": "floor",
                                        "type": "function",
                                        "result_type": "number"
                                    }
                                ],
                                "name": "slice",
                                "type": "function",
                                "result_type": "text"
                            },
                            {
                                "args": [
                                    {
                                        "args": [
                                            {
                                                "args": [
                                                    {
                                                        "args": [
                                                            {
                                                                "args": [
                                                                    {
                                                                        "type": "constant",
                                                                        "value": "░░░░░░░░░░",
                                                                        "value_type": "string",
                                                                        "result_type": "text"
                                                                    },
                                                                    {
                                                                        "type": "constant",
                                                                        "value": 0,
                                                                        "value_type": "number",
                                                                        "result_type": "number"
                                                                    },
                                                                    {
                                                                        "args": [
                                                                            {
                                                                                "args": [
                                                                                    {
                                                                                        "type": "constant",
                                                                                        "value": 10,
                                                                                        "value_type": "number",
                                                                                        "result_type": "number"
                                                                                    },
                                                                                    {
                                                                                        "args": [
                                                                                            {
                                                                                                "id": "khOi",
                                                                                                "name": "Percent",
                                                                                                "type": "property",
                                                                                                "result_type": "number"
                                                                                            },
                                                                                            {
                                                                                                "type": "constant",
                                                                                                "value": 10,
                                                                                                "value_type": "number",
                                                                                                "result_type": "number"
                                                                                            }
                                                                                        ],
                                                                                        "name": "multiply",
                                                                                        "type": "operator",
                                                                                        "operator": "*",
                                                                                        "result_type": "number"
                                                                                    }
                                                                                ],
                                                                                "name": "subtract",
                                                                                "type": "operator",
                                                                                "operator": "-",
                                                                                "result_type": "number"
                                                                            }
                                                                        ],
                                                                        "name": "ceil",
                                                                        "type": "function",
                                                                        "result_type": "number"
                                                                    }
                                                                ],
                                                                "name": "slice",
                                                                "type": "function",
                                                                "result_type": "text"
                                                            },
                                                            {
                                                                "type": "constant",
                                                                "value": " ",
                                                                "value_type": "string",
                                                                "result_type": "text"
                                                            }
                                                        ],
                                                        "name": "add",
                                                        "type": "operator",
                                                        "operator": "+",
                                                        "result_type": "text"
                                                    },
                                                    {
                                                        "args": [
                                                            {
                                                                "args": [
                                                                    {
                                                                        "args": [
                                                                            {
                                                                                "id": "khOi",
                                                                                "name": "Percent",
                                                                                "type": "property",
                                                                                "result_type": "number"
                                                                            },
                                                                            {
                                                                                "type": "constant",
                                                                                "value": 100,
                                                                                "value_type": "number",
                                                                                "result_type": "number"
                                                                            }
                                                                        ],
                                                                        "name": "multiply",
                                                                        "type": "operator",
                                                                        "operator": "*",
                                                                        "result_type": "number"
                                                                    }
                                                                ],
                                                                "name": "round",
                                                                "type": "function",
                                                                "result_type": "number"
                                                            }
                                                        ],
                                                        "name": "format",
                                                        "type": "function",
                                                        "result_type": "text"
                                                    }
                                                ],
                                                "name": "add",
                                                "type": "operator",
                                                "operator": "+",
                                                "result_type": "text"
                                            },
                                            {
                                                "type": "constant",
                                                "value": "%",
                                                "value_type": "string",
                                                "result_type": "text"
                                            }
                                        ],
                                        "name": "add",
                                        "type": "operator",
                                        "operator": "+",
                                        "result_type": "text"
                                    }
                                ],
                                "name": "format",
                                "type": "function",
                                "result_type": "text"
                            }
                        ],
                        "name": "add",
                        "type": "operator",
                        "operator": "+",
                        "result_type": "text"
                    }
                ],
                "name": "format",
                "type": "function",
                "result_type": "text"
            },
            "condition": {
                "args": [
                    {
                        "id": "khOi",
                        "name": "Percent",
                        "type": "property",
                        "result_type": "number"
                    }
                ],
                "name": "empty",
                "type": "function",
                "result_type": "checkbox"
            },
            "result_type": "text"
        }
    ],
    "name": "if",
    "type": "function",
    "result_type": "text"
}
}