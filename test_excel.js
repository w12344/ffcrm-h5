import XLSX from 'xlsx';

const wb = XLSX.readFile('public/业务数据.xlsx');
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];

const range = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']) : { s: { c: 0 }, e: { c: 14 } };
const colCount = range.e.c - range.s.c + 1;
console.log('colCount:', colCount);
