/**
 * 智能粘贴解析工具
 * 支持从粘贴内容中提取表单字段值
 */

// 字段映射表 - 将各种可能的字段名称映射到表单字段名
// 只支持以下指定字段的粘贴
const FIELD_MAPPING: Record<string, string[]> = {
  // 签署人信息
  signerName: ["监护人姓名"],
  signerMobile:['监护人手机号'],
  signerIdCard:['监护人身份证号'],
  // 监护人信息
  guardianName: ["监护人姓名"],
  guardianPhone: ["监护人手机号"],
  guardianIdCard: ["监护人身份证号"],
  guardianRelation: ["监护人与学生关系", "与学生关系", "学生关系"],

  // 学生信息
  studentName: ["学生姓名"],
  studentGender: ["学生性别"],
  studentPhone: ["学生手机号", "学生电话"],
  studentIdCard: ["学生身份证号"],
  currentSchool: ["原高中", "当前学校"],
  currentGrade: ["当前年级"],

  // 家庭信息
  address: ["联系地址", "联系地址"],
};

/**
 * 解析粘贴内容
 * @param text 粘贴的文本内容
 * @returns 解析后的字段值对象
 */
export const parsePastedText = (text: string): Record<string, any> => {
  const result: Record<string, any> = {};

  // 按行分割
  const lines = text.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    // 尝试多种分隔符：冒号、等号、空格
    const separators = ["：", ":", "=", "  ", "\t"];
    let matched = false;

    for (const separator of separators) {
      if (line.includes(separator)) {
        const parts = line.split(separator);
        if (parts.length >= 2) {
          const fieldLabel = parts[0].trim();
          const fieldValue = parts.slice(1).join(separator).trim();

          // 查找所有匹配的字段名（支持一个标签映射到多个字段）
          const matchedFields = findAllMatchingFields(fieldLabel);
          if (matchedFields.length > 0 && fieldValue) {
            // 将值设置到所有匹配的字段
            matchedFields.forEach(field => {
              result[field] = fieldValue;
            });
            matched = true;
            break;
          }
        }
      }
    }

    // 如果没有匹配到分隔符，尝试模糊匹配
    if (!matched) {
      const matchResult = fuzzyMatch(line);
      if (matchResult) {
        Object.assign(result, matchResult);
      }
    }
  }

  return result;
};

/**
 * 查找所有匹配的字段名（支持一个标签映射到多个字段）
 * @param label 字段标签
 * @returns 匹配的字段名数组
 */
const findAllMatchingFields = (label: string): string[] => {
  const normalizedLabel = label.trim().toLowerCase();
  const matchedFields: string[] = [];

  for (const [fieldName, aliases] of Object.entries(FIELD_MAPPING)) {
    for (const alias of aliases) {
      // 使用精确匹配，避免"监护人与学生关系"匹配到"监护人姓名"等字段
      if (normalizedLabel === alias.toLowerCase()) {
        matchedFields.push(fieldName);
        break; // 找到一个别名匹配就跳出，避免重复添加
      }
    }
  }

  return matchedFields;
};

/**
 * 模糊匹配 - 处理没有明确分隔符的情况
 * @param line 文本行
 * @returns 匹配结果
 */
const fuzzyMatch = (line: string): Record<string, any> | null => {
  const result: Record<string, any> = {};

  // 先找到所有可能的匹配
  for (const [, aliases] of Object.entries(FIELD_MAPPING)) {
    for (const alias of aliases) {
      const index = line.indexOf(alias);
      if (index !== -1) {
        // 提取别名后面的内容作为值
        const value = line.substring(index + alias.length).trim();
        // 移除可能的分隔符
        const cleanValue = value.replace(/^[：:=\s]+/, "").trim();
        if (cleanValue) {
          // 找到所有使用相同别名的字段
          const allMatchedFields = findAllMatchingFields(alias);
          allMatchedFields.forEach((field: string) => {
            result[field] = cleanValue;
          });
          return result;
        }
      }
    }
  }

  return null;
};

/**
 * 验证并转换数据类型
 * @param data 原始数据
 * @returns 转换后的数据
 */
export const validateAndConvertData = (
  data: Record<string, any>
): Record<string, any> => {
  const converted: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (!value) continue;

    // 所有字段都直接使用字符串值
    converted[key] = value.toString().trim();
  }

  return converted;
};
