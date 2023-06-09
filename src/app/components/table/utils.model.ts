export enum SortTypeEnum {
  ASC = 'Ascending',
  DESC = 'Descending',
}

export type FilterDataType = {
  key: string;
  value: any;
};

export type SortDataType = { key: string; type: SortTypeEnum };

export type TableUtilsData = {
  sort?: SortDataType[] | null;
  search?: string;
  filter?: FilterDataType[] | [];
};

export enum FieldTypeEnum {
  string,
  number,
}