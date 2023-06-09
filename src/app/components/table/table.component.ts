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

  public columns: { keyValue: string; viewValue: string }[] = [
    { keyValue: 'name', viewValue: 'NAME' },
    { keyValue: 'dosage', viewValue: 'DOSAGE' },
    { keyValue: 'mnn_id', viewValue: 'ID' },
    { keyValue: 'multiplicity', viewValue: 'MULTIPLICITY' },
    { keyValue: 'num', viewValue: 'NUM' },
    { keyValue: 'release_form', viewValue: 'FORM' },
    { keyValue: 'subtype', viewValue: 'SUBTITLE' },
    { keyValue: 'unit', viewValue: 'UNIT' },
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

  public searchHandler(event: Event): void {
    this.tableUtils.search = (event.target as HTMLInputElement).value.trim();
    this._setTableData();
  }

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

    /* Set */
    this.modifiedTableData = cloneDeep(filtered);
    this._cdr.markForCheck();
  }
}
