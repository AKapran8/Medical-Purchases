import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';

import { take } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import {
  WorkSheet as WorkSheetXLSX,
  WorkBook as WorkBookXLSX,
  utils as utilsXLSX,
  write as writeXLSX,
} from 'xlsx';
import { saveAs } from 'file-saver';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { PurchasesService } from './service/purchases.service';

import { IPurchase, ISecondTaskBody } from './purchases.model';
import { PageChangeEvent, ITableUtilData } from './utils.model';

import {
  filterTableData,
  paginateTableData,
  searchTableData,
  sortTableData,
} from './table-utils-functionality';
import { TABLE_COLUMNS_CONFIG } from './table-data.config';
interface IPagination {
  currentPage: number;
  itemsPerPage: number;
}
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit {
  public showForm: boolean = false;
  public isFetching: boolean = false;
  public isFetched: boolean = false;
  public form: FormGroup | null = null;
  public totalItems: number = 0;
  public paginationOptions: number[] = [10, 25, 50, 100];
  public tableColumnsUtils: ITableUtilData[] = [];
  public modifiedTableData: IPurchase[] = [];
  public inputSearch: string = '';
  public pagination: IPagination = {
    currentPage: 1,
    itemsPerPage: 10,
  };

  private _purchases: IPurchase[] = [];

  constructor(
    private _purchasesService: PurchasesService,
    private _cdr: ChangeDetectorRef,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this._initColumnsData();
    this._initForm();
    this._initComponentData();
  }

  private _initColumnsData(): void {
    this.tableColumnsUtils = JSON.parse(JSON.stringify(TABLE_COLUMNS_CONFIG));
  }

  private _initForm(): void {
    this.form = new FormGroup({
      name: new FormControl<string>('', [Validators.required]),
      lastName: new FormControl<string>('', [Validators.required]),
      age: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(1),
      ]),
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
          console.log(error.error?.message || 'Something went wrong!');
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

  private _setTableData(): void {
    const columnsArray: string[] = this.tableColumnsUtils.map(
      (c) => c.keyValue
    );
    const searched: IPurchase[] = searchTableData(
      this.inputSearch,
      this._purchases,
      columnsArray
    );

    const filtered: IPurchase[] = filterTableData(
      this.tableColumnsUtils,
      searched
    );

    const sorted: IPurchase[] = sortTableData(
      this.tableColumnsUtils || [],
      filtered
    );

    this.totalItems = sorted.length;
    const pagination = paginateTableData(
      sorted,
      this.pagination.currentPage,
      this.pagination.itemsPerPage
    );

    this.modifiedTableData = cloneDeep(pagination);
    this._cdr.markForCheck();
  }

  public searchHandler(event: Event): void {
    this.inputSearch = (event.target as HTMLInputElement).value.trim();
    this._setTableData();
  }

  public filterHandler(event: Event, key: string): void {
    const value: string = (event.target as HTMLInputElement).value.trim();
    const column = this.tableColumnsUtils.find((c) => c.keyValue === key);

    if (column) {
      column.filter = value;
    }

    this._setTableData();
  }

  public sortHandler(key: string): void {
    const index: number = this.tableColumnsUtils.findIndex(
      (c) => c.keyValue === key
    );

    if (index !== -1) {
      const currentSortType = this.tableColumnsUtils[index].sort;
      const sortType = currentSortType === 'ASC' ? 'DESC' : 'ASC';
      this.tableColumnsUtils[index].sort = sortType;
    }

    this._setTableData();
  }

  public pageChangeHandler(event: PageChangeEvent): void {
    if (event.rows !== this.pagination.itemsPerPage) {
      this.pagination.itemsPerPage = event.rows;
      this.pagination.currentPage = 1;
    } else {
      this.pagination.currentPage = event.page + 1;
    }
    this._setTableData();
  }

  public toggleColumnVisibility(key: string): void {
    const column = this.tableColumnsUtils.find((c) => c.keyValue === key);
    if (column) {
      column.isDisplayed = !column.isDisplayed;
    }
    this._cdr.markForCheck();
  }

  public isColumnDisplayed(key: string): boolean {
    const column = this.tableColumnsUtils.find((c) => c.keyValue === key);
    return column ? column.isDisplayed : false;
  }

  public downloadExcel(): void {
    const data = this._getWorkSheetData();

    const worksheet: WorkSheetXLSX = utilsXLSX.aoa_to_sheet(data);
    const workbook: WorkBookXLSX = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = writeXLSX(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
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

  public onSubmit(): void {
    if (this.form?.invalid) return;
    if (
      !this.form?.get('name')?.value?.trim() ||
      !this.form?.get('lastName')?.value?.trim()
    )
      return;

    const values = this.form?.value;
    const requestBody: ISecondTaskBody = {
      ...values,
      key: 'Kapran',
    };

    this._purchasesService
      .secondOptionalTask(requestBody)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          const errorMessage: string =
            err?.error?.message || 'Something went wrong';
        },
      });
  }

  public hasDisplayedColumn(): boolean {
    return this.tableColumnsUtils.some((c) => c.isDisplayed);
  }
}
