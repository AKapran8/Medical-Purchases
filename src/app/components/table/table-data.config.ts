import { ITableUtilData } from "./utils.model";

export const TABLE_COLUMNS_CONFIG: ITableUtilData[] = [
    { keyValue: "mnn_id", viewValue: "Ідентифікатор МНН", isDisplayed: true, sort: '', filter: '' },
    { keyValue: "subtype", viewValue: "Піднапрям", isDisplayed: true, sort: '', filter: '' },
    { keyValue: "num", viewValue: "№ позиції номенклатури", isDisplayed: true, sort: '', filter: '' },
    { keyValue: "name", viewValue: "МНН", isDisplayed: true, sort: '', filter: '' },
    { keyValue: "release_form", viewValue: "Форма випуску", isDisplayed: true, sort: '', filter: '' },
    { keyValue: "dosage", viewValue: "Дозування", isDisplayed: true, sort: '', filter: '' },
    { keyValue: "unit", viewValue: "Одиниці виміру", isDisplayed: true, sort: '', filter: '' },
];