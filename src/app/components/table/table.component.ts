import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";

import { take } from "rxjs/operators";
import { cloneDeep } from "lodash";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { PurchasesService } from "./service/purchases.service";

import { IPurchase, ISecondTaskBody, } from "./purchases.model";
import { PageChangeEvent, ITableUtilData } from "./utils.model";

import {
  filterTableData,
  paginateTableData,
  searchTableData,
  sortTableData,
} from "./table-utils-functionality";
interface IPagination {
  currentPage: number;
  itemsPerPage: number;
}
@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit {
  public isFetching: boolean = false;
  public isFetched: boolean = false;
  public form: FormGroup | null = null;

  public inputSearch: string = '';
  public pagination: IPagination = {
    currentPage: 1,
    itemsPerPage: 10,
  };

  public totalItems: number = 0;

  public paginationOptions: number[] = [10, 25, 50, 100];

  public tableColumnsUtils: ITableUtilData[] = [
    { keyValue: "mnn_id", viewValue: "Ідентифікатор МНН", isDisplayed: true, sort: '', filter: '' },
    { keyValue: "subtype", viewValue: "Піднапрям", isDisplayed: true, sort: '', filter: '' },
    { keyValue: "num", viewValue: "№ позиції номенклатури", isDisplayed: true, sort: '', filter: '' },
    { keyValue: "name", viewValue: "МНН", isDisplayed: true, sort: '', filter: '' },
    { keyValue: "release_form", viewValue: "Форма випуску", isDisplayed: true, sort: '', filter: '' },
    { keyValue: "dosage", viewValue: "Дозування", isDisplayed: true, sort: '', filter: '' },
    { keyValue: "unit", viewValue: "Одиниці виміру", isDisplayed: true, sort: '', filter: '' },
  ];

  private _purchases: IPurchase[] = [];
  public modifiedTableData: IPurchase[] = [];

  constructor(
    private _purchasesService: PurchasesService,
    private _cdr: ChangeDetectorRef,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this._initComponentData();
    this._initForm();
  }

  /* init component data start */
  private _initForm(): void {
    this.form = this._formBuilder.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(1)]],
    });
  }

  private _initComponentData(): void {
    this.isFetching = true;
    this.isFetched = false;
    this._cdr.markForCheck();

    this._purchasesService
      .getPurchases()
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this._purchases = res || [];
          this.totalItems = this._purchases.length;

          if (this._purchases?.length) {
            this._modifyTableData();
          }
          this.isFetching = false;
          this.isFetched = true;
          this._cdr.markForCheck();
        },
        error: (error) => {
          this.isFetching = false;
          this.isFetched = true;
        },
      });
  }

  private _modifyTableData(): void {
    this.modifiedTableData = cloneDeep(this._purchases);
    this._setTableData();
  }

  public getPurchasesCount(): number {
    return this._purchases.length;
  }
  /* init component data start */


  private _setTableData(): void {
    /* Search */
    const columnsArray: string[] = this.tableColumnsUtils.map((c) => c.keyValue);
    const searched: IPurchase[] = searchTableData(
      this.inputSearch,
      this._purchases,
      columnsArray
    );

    /* Filter */
    const filtered: IPurchase[] = filterTableData(this.tableColumnsUtils, searched);

    /* Sort */
    const sorted = sortTableData(this.tableColumnsUtils || [], filtered);

    /* Pagination */
    this.totalItems = sorted.length;
    const pagination = paginateTableData(
      sorted,
      this.pagination.currentPage,
      this.pagination.itemsPerPage
    );

    /* Set */
    this.modifiedTableData = cloneDeep(pagination);
    this._cdr.markForCheck();
  }

  /* Search end */
  public searchHandler(event: Event): void {
    this.inputSearch = (event.target as HTMLInputElement).value.trim();
    this._setTableData();
  }
  /* Search end */

  /* Filter start */
  public filterHandler(event: Event, key: string): void {
    const value: string = (event.target as HTMLInputElement).value.trim();
    const column = this.tableColumnsUtils.find((c) => c.keyValue === key);

    if (column) {
      column.filter = value;
    }

    console.log(this.tableColumnsUtils)

    this._setTableData();
  }
  /* Filter end */

  /* Sort start */
  public sortHandler(key: string): void {
    const index: number = this.tableColumnsUtils.findIndex((c) => c.keyValue === key);

    if (index !== -1) {
      const currentSortType = this.tableColumnsUtils[index].sort;
      const sortType = currentSortType === 'ASC' ? 'DESC' : 'ASC';
      this.tableColumnsUtils[index].sort = sortType;
    }

    this._setTableData();
  }
  /* Sort end */

  /* Pagination start */
  public pageChangeHandler(event: PageChangeEvent): void {
    if (event.rows !== this.pagination.itemsPerPage) {
      this.pagination.itemsPerPage = event.rows;
      this.pagination.currentPage = 1;
    } else {
      this.pagination.currentPage = event.page + 1;
    }
    this._setTableData();
  }
  /* Pagination end */

  /* Toggle column visibility start */
  public toggleColumnVisibility(key: string): void {
    const column = this.tableColumnsUtils.find(c => c.keyValue === key);
    if (column) {
      column.isDisplayed = !column.isDisplayed;
    }
    this._cdr.markForCheck();
  }

  public isColumnDisplayed(key: string): boolean {
    const column = this.tableColumnsUtils.find(c => c.keyValue === key);
    return column ? column.isDisplayed : false;
  }
  /* Toggle column visibility end */

  /* Excel import start */
  public downloadExcel(): void {
    const data = this._getWorkSheetData();

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, `file-example.xlsx`);
  }

  private _getWorkSheetData(): any[][] {
    const headers: string[] = this.tableColumnsUtils.map((c) => c.viewValue);
    const data: string[][] = this.modifiedTableData.map((purchase) =>
      Object.values(purchase).map((value) => String(value))
    );
    return [headers, ...data];
  }
  /* Excel import end */

  /* Post endpoint start */
  public onSubmit(): void {
    if (this.form?.invalid) return;
    if (!this.form?.get('name')?.value?.trim() || !this.form?.get('lastName')?.value?.trim()) return;

    const values = this.form?.value;
    const requestBody: ISecondTaskBody = {
      ...values,
      key: "Kapran"
    };

    this._purchasesService
      .secondOptionalTask(requestBody)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          const errorMessage: string = err?.error?.message || "Something went wrong";
          console.log(errorMessage);
        },
      });
  }
  /* Post endpoint end */

  public hasDisplayedColumn(): boolean {
    return this.tableColumnsUtils.some(c => c.isDisplayed);
  }

}
