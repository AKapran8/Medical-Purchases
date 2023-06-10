import { IPurchase } from './purchases.model';
import {
  ITableUtilData,
} from './utils.model';

export const searchTableData = (searchValue: string = '', rows: IPurchase[] = [], columns: string[]): IPurchase[] => {
  if (!searchValue) return rows;
  const trimmedValue: string = searchValue.toLowerCase().trim();

  const searched = rows.filter((item) => {
    let result = false;
    columns.forEach((column: string) => {
      if (result) {
        return;
      }
      const value = String(item[column as keyof IPurchase]) || '';
      result = value.toLowerCase().includes(trimmedValue);
    });
    return result;
  }) || rows;

  return searched;
}


export const filterTableData = (columns: ITableUtilData[], rows: any[] = []): any[] => {
  const filterData = columns.filter((column) => column.filter !== '');

  if (filterData.length === 0) {
    return rows;
  }

  return rows.filter((row) => {
    let resultArray: boolean[] = [];

    filterData.forEach((filter) => {
      if (!(filter.keyValue in row)) {
        throw new Error(filter.keyValue + " field doesn't exist");
      }

      const modifiedFieldValue =
        row[filter.keyValue] !== undefined && row[filter.keyValue] !== null
          ? row[filter.keyValue].toString().toLowerCase()
          : '';
      const searchString = String(filter.filter).toLowerCase();
      if (modifiedFieldValue.includes(searchString)) {
        resultArray.push(true);
      } else {
        resultArray.push(false);
      }
    });

    return !resultArray.includes(false);
  });
};

export const sortTableData = (columns: ITableUtilData[], rows: any[] = []): any[] => {
  const sortFields = columns.filter((column) => column.sort !== '');

  if (sortFields.length === 0) {
    return rows;
  }

  return rows.sort((item1, item2) => {
    for (let i = 0; i < sortFields.length; i++) {
      const field = sortFields[i];
      const { keyValue, sort } = field;

      let firstItem = item1[keyValue];
      let secondItem = item2[keyValue];

      if (typeof firstItem === 'string') {
        firstItem = firstItem.toLowerCase();
      }
      if (typeof secondItem === 'string') {
        secondItem = secondItem.toLowerCase();
      }

      if (sort === 'ASC') {
        if (firstItem > secondItem) {
          return 1;
        }
        if (firstItem < secondItem) {
          return -1;
        }
      } else if (sort === 'DESC') {
        if (firstItem > secondItem) {
          return -1;
        }
        if (firstItem < secondItem) {
          return 1;
        }
      }
    }

    return 0;
  });
};


export const paginateTableData = (
  rows: any[],
  page: number,
  size: number
): any[] => {
  return rows.slice((page - 1) * size, page * size);
};