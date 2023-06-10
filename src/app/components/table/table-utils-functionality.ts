import { IPurchase } from './purchases.model';
import {
  SortDataType,
  SortTypeEnum,
  TableUtilsData,
} from './utils.model';

// export const getDisplayedColumnsFromColumnsManager = (
//     manageColumnsData: ManageColumnDataType[]
// ): string[] => {
//     return manageColumnsData
//         .filter((item) => item.isDisplayed)
//         .map((res) => {
//             return res.key;
//         });
// };


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

export const filterTableData = (
  tableUtilsData: TableUtilsData,
  rows: any[] = []
): any[] => {
  if (!tableUtilsData || !tableUtilsData.filter) {
    return rows;
  }

  return rows.filter((row) => {
    let resultArray: boolean[] = [];

    tableUtilsData.filter?.forEach((filter) => {
      if (!(filter.key in row)) {
        throw new Error(filter.key + " field doesn't exist");
      }

      const modifiedFieldValue =
        row[filter.key] !== undefined && row[filter.key] !== null
          ? row[filter.key].toString().toLowerCase()
          : '';
      const searchString = String(filter.value).toLowerCase();
      if (modifiedFieldValue.includes(searchString)) {
        resultArray.push(true);
      } else {
        resultArray.push(false);
      }
    });

    return !resultArray.includes(false);
  });
};

export const sortTableData = (
  sortFields: SortDataType[] = [],
  rows: any[] = []
): any[] => {
  if (!sortFields.length) {
    return rows;
  }

  let result = rows.sort((item1, item2) => {
    for (let i = 0; i < sortFields.length; i++) {
      const field = sortFields[i];
      const { key, type } = field;

      let firstItem = item1[key];
      let secondItem = item2[key];

      if (typeof firstItem === 'string') {
        firstItem = firstItem.toLowerCase();
      }
      if (typeof secondItem === 'string') {
        secondItem = secondItem.toLowerCase();
      }

      if (type === SortTypeEnum.ASC) {
        if (firstItem > secondItem) {
          return 1;
        }
        if (firstItem < secondItem) {
          return -1;
        }
      } else if (type === SortTypeEnum.DESC) {
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

  return result;
};

export const paginateTableData = (
    rows: any[],
    page: number,
    size: number
): any[] => {
    return rows.slice((page - 1) * size, page * size);
};