import { utils, writeFile } from 'xlsx';

export interface ExportColumn<T> {
  title: string;
  key: keyof T | string;
  width?: number;
  formatter?: (row: T, index: number) => unknown;
}

const normalizeFileName = (fileName: string): string => {
  if (fileName.trim().length === 0) {
    return '导出数据.xlsx';
  }

  return fileName.toLowerCase().endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
};

const toCellValue = (value: unknown): string | number | boolean => {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toLocaleString('zh-CN');
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return String(value);
};

export const exportRowsToXlsx = <T>(
  rows: T[],
  columns: ExportColumn<T>[],
  fileName = '导出数据.xlsx',
  sheetName = '导出数据'
): void => {
  const headerRow = columns.map((column) => column.title);
  const dataRows = rows.map((row, index) =>
    columns.map((column) => {
      if (column.formatter) {
        return toCellValue(column.formatter(row, index));
      }

      const rawValue = row[column.key as keyof T];
      return toCellValue(rawValue);
    })
  );

  const worksheet = utils.aoa_to_sheet([headerRow, ...dataRows]);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, sheetName);
  writeFile(workbook, normalizeFileName(fileName));
};
