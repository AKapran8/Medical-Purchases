export interface IPurchase {
    dosage: string;
    mnn_id: number;
    num: number;
    release_form: string;
    subtype: string;
    unit: string;
    name: string; 
    multiplicity?: number; //not required in task, but returned from back
}

export interface ITableColum {
    keyValue: string;
    viewValue: string;
    isDisplayed: boolean;
  }