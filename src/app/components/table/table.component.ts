import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';

import { take } from 'rxjs/operators';
import { cloneDeep } from 'lodash';

import { PurchasesService } from './service/purchases.service';

import { IPurchase } from './purchases.model';
import { SortTypeEnum, TableUtilsData } from './utils.model';

import { filterTableData, searchTableData, sortTableData } from './table-utils-functionality';

interface ITableColum {
  keyValue: string;
  viewValue: string;
  isDisplayed: boolean;
}

interface IPagination {
  totalItems: number;
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

  public paginationOptions: number[] = [10, 15, 20]
  public pagination: IPagination = {
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
  }

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
          this.pagination.totalItems = this._purchases.length;

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
    const sorted = sortTableData(
      this.tableUtils.sort || [],
      filtered,
    );

    /* Pagination */
    this.pagination.totalItems = sorted.length;
    const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
    const endIndex = startIndex + this.pagination.itemsPerPage;
    /* Set */
    this.modifiedTableData = cloneDeep(sorted.slice(startIndex, endIndex));
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
      this.tableUtils.filter!.push({ key, value })
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
    const index: number = this.tableUtils?.sort?.findIndex(s => s.key === key) || 0;

    if (index === -1) {
      this.tableUtils.sort?.push({ key, type: SortTypeEnum.ASC });
    } else {
      this.tableUtils.sort = this.tableUtils.sort?.map((s) => {
        if (s.key === key) {
          const sortType: SortTypeEnum = s.type === SortTypeEnum.ASC ? SortTypeEnum.DESC : SortTypeEnum.ASC;
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
  public paginationCountChangeHandler(event: Event) {
    const itemsPerPage: number = +(event.target as HTMLInputElement).value;
    this.pagination.itemsPerPage = itemsPerPage
    this._setTableData();
  }

  public pageChangeHandler(page: number): void {
    this.pagination.currentPage = page;
    this._setTableData();
  }

  public getPageNumbers(): number[] {
    const pageCount = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
    const pageNumbers = Array(pageCount).fill(0).map((_, index) => index + 1);
    return pageNumbers.slice(0, 15);
  }
  /* Pagination end */

}
