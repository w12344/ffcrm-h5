const XLSX = require('xlsx');
const ws = XLSX.utils.aoa_to_sheet([
  [1, 2, 3],
  [4, 5, 6, 7]
]);
const range = XLSX.utils.decode_range(ws['!ref']);
const colCount = range.e.c - range.s.c + 1;
console.log(colCount);
