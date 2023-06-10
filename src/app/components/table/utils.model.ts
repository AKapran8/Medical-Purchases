export interface PageChangeEvent {
  page:  number;
  first: number;
  pageCount: number;
  rows: number;
}

export interface ITableUtilData {
  keyValue: string;
  viewValue: string;
  isDisplayed: boolean;
  sort: 'ASC' | 'DESC' | '';
  filter: string;
}
