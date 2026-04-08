import React, { useEffect, useState } from "react";
import { Spin, Tabs, Button, message } from "antd";
import { FileExcelOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import PremiumModal from "@/components/PremiumModal";
import "./ExcelPreviewModal.less";

interface ExcelPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  themeClass: string;
  searchText?: string;
}

const ExcelPreviewModal: React.FC<ExcelPreviewModalProps> = ({
  visible,
  onClose,
  themeClass,
  searchText,
}) => {
  const [loading, setLoading] = useState(false);
  const [sheets, setSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  useEffect(() => {
    if (visible) {
      loadExcel();
    } else {
      setHtmlContent("");
      setSheets([]);
      setWorkbook(null);
      // 清除高亮效果，避免下次打开还留着
      document.querySelectorAll('.excel-highlight-target, .excel-highlight-related').forEach(el => {
        el.classList.remove('excel-highlight-target', 'excel-highlight-related');
        (el as HTMLElement).style.backgroundColor = '';
      });
    }
  }, [visible]);

  useEffect(() => {
    if (!loading && htmlContent && searchText) {
      setTimeout(() => {
        const container = document.querySelector(".html-table-wrapper");
        if (container) {
          const cells = Array.from(container.querySelectorAll("td"));

          // 1. 精确匹配 - 仅匹配作为单独单元格内容的指标，避免匹配到长标题
          let targetCell = cells.find(
            (cell) => {
              const text = cell.textContent?.trim();
              return text === searchText.trim();
            }
          );

          // 2. 包含匹配 - 限制只在较短的单元格中查找，避免匹配到如 "12.22-招生结束目标完成情况" 这种大标题
          if (!targetCell) {
            targetCell = cells.find((cell) => {
              const text = cell.textContent?.trim() || "";
              // 假设指标单元格一般比较短，如果是大标题很长就不匹配
              return text.includes(searchText) && text.length < 20;
            });
          }

          // 3. 关键词映射匹配 - 处理指标名称与Excel表头的差异
          if (!targetCell) {
            const keywordMap: Record<string, string[]> = {
              退学人头: ["退学", "流失人数", "退学人数", "流失"],
              实际入学数: ["入学", "入学人数", "新生", "实际入学"],
              交定金人头: ["定金", "交定金", "签约"],
              退费人头: ["退费", "退款人数", "退费人数"],
              大盘净招生人数: ["净招生", "净增", "净人数", "净招"],
              实际总营收: ["总营收", "营收", "总收入", "实际营收"],
              总收款: ["收款", "到账", "收款金额"],
              总退款: ["退款", "退费金额", "退款金额"],
            };

            const keywords = keywordMap[searchText] || [];
            for (const keyword of keywords) {
              targetCell = cells.find((cell) =>
                cell.textContent?.includes(keyword),
              );
              if (targetCell) break;
            }
          }

          // 4. 模糊匹配 - 去掉常见后缀
          if (!targetCell) {
            const cleanText = searchText
              .replace(/(大盘|总|实际|净|人头|人数|金额|数|量|额)/g, "")
              .trim();
            if (cleanText && cleanText.length >= 2) {
              targetCell = cells.find((cell) =>
                cell.textContent?.includes(cleanText),
              );
            }
          }

          if (targetCell) {
            targetCell.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            });

            // 高亮当前行和列的所有相关数据单元格 (常亮显示)
            const parentRow = targetCell.closest('tr');
            if (parentRow) {
              const rowCells = Array.from(parentRow.querySelectorAll('td'));

              // 找到目标单元格的索引
              const cellIndex = rowCells.indexOf(targetCell);

              // 获取表格中所有的行
              const allRows = Array.from(container.querySelectorAll('tr'));

              // 添加高亮类名
              targetCell.classList.add('excel-highlight-target');

              // 高亮整行
              rowCells.forEach(c => {
                c.classList.add('excel-highlight-related');
              });

              // 高亮整列 (简单实现，未处理复杂的 colspan/rowspan)
              if (cellIndex >= 0) {
                allRows.forEach(row => {
                  const cells = Array.from(row.querySelectorAll('td'));
                  if (cells[cellIndex]) {
                    cells[cellIndex].classList.add('excel-highlight-related');
                  }
                });
              }
            }

            targetCell.style.backgroundColor = "#ffeb3b";

            // 移除原本的 3 秒后取消高亮的逻辑，改为由 CSS 控制常亮，
            // 并在关闭弹窗时重置
            // setTimeout(() => {
            //   targetCell.style.backgroundColor = originalBg;
            // }, 3000);
          } else {
            message.info(`当前报表中未找到 "${searchText}" 的相关数据`);
          }
        }
      }, 300);
    }
  }, [loading, htmlContent, searchText]);

  const loadExcel = async () => {
    setLoading(true);
    try {
      const response = await fetch("/业务数据.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });

      setWorkbook(wb);
      setSheets(wb.SheetNames);

      if (wb.SheetNames.length > 0) {
        const firstSheet = wb.SheetNames[0];
        setActiveSheet(firstSheet);
        renderSheet(wb, firstSheet);
      }
    } catch (error) {
      console.error("Error loading excel:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;

    // Add special class to the table to help with CSS styling
    let html = XLSX.utils.sheet_to_html(ws, {
      id: "excel-preview-table",
      editable: false,
    });

    // Determine max column count to avoid messing up table-layout
    const range = ws["!ref"]
      ? XLSX.utils.decode_range(ws["!ref"])
      : { s: { c: 0 }, e: { c: 14 } };
    const colCount = range.e.c - range.s.c + 1;

    // Convert completely empty rows into visual gaps
    html = html.replace(
      /<tr[^>]*>(?:\s*<td[^>]*>(?:<br\s*\/?>|\s|&nbsp;)*<\/td>\s*)+<\/tr>/gi,
      `<tr class="table-gap-row"><td colspan="${colCount}"></td></tr>`,
    );

    // Also catch rows with a single spanning empty td
    html = html.replace(
      /<tr[^>]*>\s*<td[^>]*colspan="(\d+)"[^>]*>(?:<br\s*\/?>|\s|&nbsp;)*<\/td>\s*<\/tr>/gi,
      `<tr class="table-gap-row"><td colspan="${colCount}"></td></tr>`,
    );

    // Combine consecutive gap rows to avoid huge gaps
    html = html.replace(
      new RegExp(
        `(<tr class="table-gap-row"><td colspan="${colCount}"><\\/td><\\/tr>\\s*)+`,
        "gi",
      ),
      `<tr class="table-gap-row"><td colspan="${colCount}"></td></tr>`,
    );

    // Identify major section headers to add top borders
    html = html.replace(
      /<tr([^>]*)>\s*<td([^>]*)>(年度目标完成情况|26届过程数据报表|顾问成交人头龙虎榜|小冲留存报表|总营收情况同比)<\/td>/gi,
      '<tr$1 class="section-header-row"><td$2>$3</td>',
    );

    // Replace <br> and newlines with spaces for a more compact view
    html = html.replace(/<br\s*\/?>/gi, " ").replace(/\n/g, " ");

    // Inject colgroup to set specific column widths based on content
    let colgroup = '<colgroup><col style="width: 90px;">'; // Slightly wider first column for names
    for (let i = 1; i < colCount; i++) {
      colgroup += '<col style="width: 70px;">'; // Compact width for data columns
    }
    colgroup += "</colgroup>";

    html = html.replace("<tbody>", `${colgroup}<tbody>`);

    // Add data-row-index attributes to tr elements for easier CSS targeting
    let rowIndex = 0;
    html = html.replace(/<tr/g, () => {
      return `<tr data-row-index="${rowIndex++}"`;
    });

    // Handle colspan and rowspan dynamically
    html = html.replace(/<td([^>]*)>/g, (_, attrs) => {
      let extraStyle = "";
      if (attrs.includes("colspan") || attrs.includes("rowspan")) {
        extraStyle =
          " font-weight: bold; background-color: #f2f7e6; color: #333;"; // 浅绿色背景，参考原图表头
      }

      // Look for cell styling like color, background
      let finalAttrs = attrs;
      if (attrs.includes('style="')) {
        finalAttrs = attrs.replace('style="', `style="${extraStyle} `);
      } else if (extraStyle) {
        finalAttrs = `${attrs} style="${extraStyle}"`;
      }
      return `<td${finalAttrs}>`;
    });

    // Handle styling specifically matching the original Excel visual cues
    html = html.replace(/>(101%|100%|259|215)</g, (match, p1) => {
      if (p1 === "259" || p1 === "215") {
        return ` style="background-color: #fffc00;"${match}`; // 黄色背景
      }
      return match;
    });

    // Add specific border top for major sections headers
    html = html.replace(
      /<td([^>]*)>(25届.*|26届.*|顾问.*|总营收.*)<\/td>/gi,
      (_, attrs, content) => {
        let styleStr =
          " font-size: 13px; font-weight: bold; padding-top: 8px; padding-bottom: 8px; background-color: #f6f6f6;";
        if (attrs.includes('style="')) {
          return `<td${attrs.replace('style="', `style="${styleStr} `)}>${content}</td>`;
        } else {
          return `<td${attrs} style="${styleStr}">${content}</td>`;
        }
      },
    );

    setHtmlContent(html);
  };

  const handleSheetChange = (key: string) => {
    setActiveSheet(key);
    if (workbook) {
      renderSheet(workbook, key);
    }
  };

  return (
    <PremiumModal
      visible={visible}
      onClose={onClose}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <FileExcelOutlined style={{ color: "#52c41a", fontSize: "22px" }} />
          <span>大盘业务详表</span>
        </div>
      }
      subtitle="BUSINESS OPERATION DATA OVERVIEW"
      themeMode={themeClass === "dark-theme" ? "dark" : "light"}
      className="boss-excel-modal"
      width="98vw"
      height="98vh"
      showCancel={false}
    >
      <div className="excel-preview-container">
        <div
          className="excel-header-actions"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div
            className="tabs-container"
            style={{ flex: 1, overflow: "hidden" }}
          >
            {sheets.length > 0 && (
              <Tabs
                activeKey={activeSheet}
                onChange={handleSheetChange}
                items={sheets.map((s) => ({ key: s, label: s }))}
                size="middle"
              />
            )}
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            href="/业务数据.xlsx"
            download="业务数据.xlsx"
            className="download-btn"
            style={{ marginTop: "8px" }}
          >
            下载原件
          </Button>
        </div>

        <div className="excel-content-area">
          {loading ? (
            <div className="loading-wrapper">
              <Spin tip="正在解析并渲染 Excel 数据..." size="large" />
            </div>
          ) : (
            <div
              className="html-table-wrapper"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </div>
      </div>
    </PremiumModal>
  );
};

export default ExcelPreviewModal;
