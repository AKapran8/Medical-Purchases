import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';

import { take } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { PurchasesService } from './service/purchases.service';

import { IPurchase, ITableColum } from './purchases.model';
import { PageChangeEvent, SortTypeEnum, TableUtilsData } from './utils.model';

import {
  filterTableData,
  paginateTableData,
  searchTableData,
  sortTableData,
} from './table-utils-functionality';
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
  public isFetching: boolean = false;
  public isFetched: boolean = false;

  public tableUtils: TableUtilsData = {
    filter: [],
    sort: [],
    search: '',
  };

  public pagination: IPagination = {
    currentPage: 1,
    itemsPerPage: 10,
  };

  public totalItems: number = 0;

  public paginationOptions: number[] = [10, 25, 50, 100];

  public columns: ITableColum[] = [
    { keyValue: 'mnn_id', viewValue: 'Ідентифікатор МНН', isDisplayed: true },
    { keyValue: 'subtype', viewValue: 'Піднапрям', isDisplayed: true },
    { keyValue: 'num', viewValue: '№ позиції номенклатури', isDisplayed: true },
    { keyValue: 'name', viewValue: 'МНН', isDisplayed: true },
    { keyValue: 'release_form', viewValue: 'Форма випуску', isDisplayed: true },
    { keyValue: 'dosage', viewValue: 'Дозування', isDisplayed: true },
    { keyValue: 'unit', viewValue: 'Одиниці виміру', isDisplayed: true },
  ];

  private _purchases: IPurchase[] = [];
  public modifiedTableData: IPurchase[] = [];

  constructor(
    private _purchasesService: PurchasesService,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._initComponentData();
  }

  public getPurchasesCount(): number {
    return this._purchases.length;
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

  private _setTableData(): void {
    /* Search */
    const columnsArray: string[] = this.columns.map((c) => c.keyValue);
    const searched: IPurchase[] = searchTableData(
      this.tableUtils.search,
      this._purchases,
      columnsArray
    );

    /* Filter */
    const filtered: IPurchase[] = filterTableData(this.tableUtils, searched);

    /* Sort */
    const sorted = sortTableData(this.tableUtils.sort || [], filtered);

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
    this.tableUtils.search = (event.target as HTMLInputElement).value.trim();
    this._setTableData();
  }
  /* Search end */
  /* Filter start */
  public filterHandler(event: Event, key: string): void {
    const value: string = (event.target as HTMLInputElement).value.trim();

    if (!this.tableUtils?.filter?.length) {
      // @ts-ignore
      this.tableUtils.filter!.push({ key, value });
    }

    this.tableUtils.filter = this.tableUtils.filter?.map((f) => {
      if (f.key === key) {
        return { key, value };
      }
      return f;
    });

    this._setTableData();
  }
  /* Filter end */
  /* Sort start */
  public sortHandler(key: string): void {
    const index: number =
      this.tableUtils?.sort?.findIndex((s) => s.key === key) || 0;

    if (index === -1) {
      this.tableUtils.sort?.push({ key, type: SortTypeEnum.ASC });
    } else {
      this.tableUtils.sort = this.tableUtils.sort?.map((s) => {
        if (s.key === key) {
          const sortType: SortTypeEnum =
            s.type === SortTypeEnum.ASC ? SortTypeEnum.DESC : SortTypeEnum.ASC;
          console.log({ key, type: sortType });
          return { key, type: sortType };
        }
        return s;
      });
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
  /* Excel import start */
  public downloadExcel(): void {
    const data = this._getWorkSheetData();

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });
    saveAs(blob, `file-example.xlsx`);
  }

  private _getWorkSheetData(): any[][] {
    const headers: string[] = this.columns.map((c) => c.viewValue);
    const data: string[][] = this.modifiedTableData.map((purchase) =>
      Object.values(purchase).map((value) => String(value))
    );
    return [headers, ...data];
  }
  /* Excel import end */
}
