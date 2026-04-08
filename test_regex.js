let html = `
<tr class="table-gap-row"><td colspan="100"></td></tr>
<tr class="table-gap-row"><td colspan="100"></td></tr>
<tr row="5"><td id="sjs-A6">Data</td><td id="sjs-B6"></td></tr>
<tr class="table-gap-row"><td colspan="100"></td></tr>
`;

html = html.replace(/(<tr class="table-gap-row"><td colspan="100"><\/td><\/tr>\s*)+/gi, '<tr class="table-gap-row"><td colspan="100"></td></tr>\n');

console.log(html);
