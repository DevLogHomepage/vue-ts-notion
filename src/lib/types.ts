export type Booleanish = boolean | 'true' | 'false'

export type BoldFormatType = ["b"];
export type ItalicFormatType = ["i"];
export type StrikeFormatType = ["s"];
export type CodeFormatType = ["c"];
export type KatexFormatType = ["e"];
export type unKnownFormatType = ["h"]; //TODO: need to change this type name
export type LinkFormatType = ["a", string];
export type DateFormatType = [
  "d",
  {
    type: "date";
    start_date: string;
    date_format: string;
  }
];

export type UserFormatType = ["u", string];
export type PageFormatType = ["p", string];
export type SubDecorationType =
  | BoldFormatType
  | ItalicFormatType
  | StrikeFormatType
  | CodeFormatType
  | LinkFormatType
  | DateFormatType
  | UserFormatType
  | KatexFormatType
  | unKnownFormatType
  | PageFormatType

export type BaseDecorationType = [string]

export type AdditionalDecorationType = [string, SubDecorationType[]]

export type DecorationType = BaseDecorationType | AdditionalDecorationType

export type ColumnType =
  | "select"
  | "text"
  | "date"
  | "person"
  | "checkbox"
  | "title"
  | "multi_select"
  | "number"
  | "relation"
  | "file"
  | "email"
  | "phone_number"
  | "url"
  | "status"



type UserType = { id: string; full_name: string }

export type RowContentType =
  | string
  | boolean
  | number
  | string[]
  | { title: string; id: string }
  | UserType[]
  | DecorationType[]
  | { name: string; url: string }[]

export interface BlockMap {
  [key: string]: Block
}

export interface Block {
  role: Role
  value: BlockValue
  collection:Collection
}

export interface Collection {
  title:string,
  schema:{[key:string]:ColumnSchemaType},
  types:BlockValue[],
  data:tableValueProperties[]
};

export interface BaseValueType {
  id: string;
  type: string;
  version: number;
  created_time: number;
  last_edited_time: number;
  parent_id: string;
  parent_table: string;
  alive: boolean;
  created_by_table: string;
  created_by_id: string;
  last_edited_by_table: string;
  last_edited_by_id: string;
  content?: string[];

  format:Format;
  properties: Properties | tableValueProperties;

  name:string
}

export interface tableValueProperties{ 
  [key: string]: DecorationType[] 
}

export type ColumnSchemaType = {
  name: string;
  type: ColumnType;
  formula:any
};


export interface BlockValue {
  id: string
  version: number
  type: string
  properties: Properties
  content: string[]
  format: Format
  permissions: Permission[]
  created_time: number
  last_edited_time: number
  parent_id: string
  parent_table: string
  alive: boolean
  created_by_table: string
  created_by_id: string
  last_edited_by_table: string
  last_edited_by_id: string
  space_id: string

  name?: string
}

export interface Format {
  domain?: string
  original_url?: string
  page_icon?: string
  drive_properties: GoogleDriveProperties
  hide_linked_collection_name:boolean,
  table_block_column_header:string[],
  table_block_row_header:string[],
  table_block_column_order:string[],
  table_properties: TableBlockProperties[]
  table_wrap:boolean,
  [key: string]: any
}

export interface TableBlockProperties{
  width:number,
  visible:boolean,
  property:string,
  title:DecorationType[],
  caption:DecorationType[],
  description:DecorationType
  source:DecorationType
  checked:boolean
}

export interface GoogleDriveProperties {
  file_id: string
  icon: string
  modified_time: number
  thumbnail: string
  title: string
  trashed: boolean
  url: string
  user_name: string
  version: string
}

export interface Permission {
  role: Role
  type: string
  added_timestamp: number
}

export interface Properties {
  title: string[]
  caption?: string[]
  description?: string[]
  language?: string[]
  [key: string]: any
}

export enum Role {
  Reader = "reader",
}

export interface PageLinkOptions {
  component: any
  href: string
}

export type NotionBlockProps = {
  blockMap: BlockMap
  contentId?: string
  contentIndex: number
  embedAllow: string
  fullPage: boolean
  hideList?: string[]
  level: number
  mapImageUrl: Function
  mapPageUrl: Function
  pageLinkOptions?: PageLinkOptions
  pageLinkTarget: string
  prism: boolean
  katex: boolean
  textLinkTarget: string
  collection:Collection
}
