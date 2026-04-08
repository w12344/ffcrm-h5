const fs = require('fs');
const mammoth = require('mammoth');
const TurndownService = require('turndown');
const turndownPluginGfm = require('turndown-plugin-gfm');

const docPath = '/Users/wzq/Desktop/project/feifan/ffcrm-h5/老板端需求文档 (1).docx';
const outPath = '/Users/wzq/Desktop/project/feifan/ffcrm-h5/老板端需求文档_精排版.md';

const gfm = turndownPluginGfm.gfm;
const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
});
turndownService.use(gfm);

// Custom rules to make sure tables and headings are parsed better
turndownService.addRule('strong_to_bold', {
  filter: ['strong', 'b'],
  replacement: function (content) {
    return '**' + content + '**';
  }
});

mammoth.convertToHtml({path: docPath}, {
    // Map default Word heading styles to h1-h6
    styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Heading 5'] => h5:fresh",
        "p[style-name='Heading 6'] => h6:fresh",
        "p[style-name='Title'] => h1:fresh"
    ]
})
  .then(function(result){
      const html = result.value;
      const markdown = turndownService.turndown(html);
      fs.writeFileSync(outPath, markdown);
      console.log('Conversion successful. File saved to: ' + outPath);
  })
  .catch(function(err){
      console.error('Error during conversion:', err);
  });
