import { IPurchase } from './purchases.model';
import { ITableUtilData } from './utils.model';

interface IReturnedPurchase {
  [key: string]: string | number | boolean | null | undefined;
}

export const searchTableData = (
  searchValue: string = '',
  rows: IPurchase[] = [],
  columns: string[]
): IPurchase[] => {
  if (!searchValue) return rows;
  const trimmedValue: string = searchValue.toLowerCase().trim();

  const searched =
    rows.filter((item) => {
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
};

export const filterTableData = (
  columns: ITableUtilData[],
  rows: any[] = []
): any[] => {
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

      let modifiedFieldValue: string = '';
      if (row[filter.keyValue]) {
        modifiedFieldValue = row[filter.keyValue]!.toString().toLowerCase();
      }

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

export const sortTableData = <T>(
  columns: ITableUtilData[],
  rows: T[] = []
): T[] => {
  const sortFields = columns.filter((column) => column.sort !== '');

  if (sortFields.length === 0) {
    return rows;
  }

  return rows.sort((item1, item2) => {
    for (let i = 0; i < sortFields.length; i++) {
      const field = sortFields[i];
      const { keyValue, sort } = field;

      let firstItem = (item1 as any)[keyValue];
      let secondItem = (item2 as any)[keyValue];

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
  rows: IPurchase[],
  page: number,
  size: number
): IPurchase[] => {
  return rows.slice((page - 1) * size, page * size);
};
