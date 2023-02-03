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