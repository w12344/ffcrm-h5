# 合同配置组件重构说明

## 📁 目录结构

```
ContractConfig/components/
├── FormSections/                    # 表单区域组件（可复用）
│   ├── StudentInfoSection.tsx       # 学生信息区域
│   ├── GuardianInfoSection.tsx      # 监护人信息区域
│   ├── ServiceInfoSection.tsx       # 服务信息区域（仅服务学校模板）
│   ├── BasicInfoDisplay.tsx         # 基本信息展示区域
│   ├── FormActions.tsx              # 表单操作按钮区域
│   └── index.ts                     # 统一导出
├── FuwuSchoolForm.tsx               # 服务学校模板专用表单
├── DetailInfoForm.tsx               # 冲刺营/私塾模板表单（原有）
├── BasicInfoForm.tsx                # 第一步基本信息表单
└── README.md                        # 本文档

## 🎯 重构目标

### 1. **提高代码可读性**
- 将 1600+ 行的大文件拆分成多个小组件
- 每个组件职责单一，易于理解和维护
- 清晰的文件命名和组织结构

### 2. **提高代码可复用性**
- 抽取通用的表单区域组件
- 支持通过 props 配置不同模板的差异
- 减少重复代码

### 3. **提高代码可维护性**
- 模板逻辑分离，互不影响
- 新增模板时只需创建新的表单组件
- 修改某个区域不会影响其他部分

## 🔧 组件说明

### FormSections（表单区域组件）

#### StudentInfoSection
**用途**: 学生信息表单区域  
**支持模板**: 所有模板  
**Props**:
- `isHqMb`: 是否为服务学校模板
- `responsiveLayout`: 响应式布局配置

**差异处理**:
- 服务学校模板: 姓名 + 性别 + 出生日期 + 身份证号
- 冲刺营/私塾模板: 姓名 + 性别 + 身份证号 + 电话 + 学校 + 年级

#### GuardianInfoSection
**用途**: 监护人信息表单区域  
**支持模板**: 所有模板  
**Props**:
- `isHqMb`: 是否为服务学校模板
- `responsiveLayout`: 响应式布局配置

**差异处理**:
- 服务学校模板: 额外包含"联系地址"字段

#### ServiceInfoSection
**用途**: 服务信息表单区域  
**支持模板**: 仅服务学校模板  
**字段**: 服务日期、支付方式、住宿费用、签署日期、顾问签名

#### BasicInfoDisplay
**用途**: 合同基本信息展示  
**支持模板**: 所有模板  
**展示内容**: 合同标题、签署人信息

#### FormActions
**用途**: 表单操作按钮区域  
**支持模板**: 所有模板  
**功能**: 保存草稿、预览合同、提交签署

### FuwuSchoolForm（服务学校模板表单）

**用途**: 服务学校模板的完整表单组件  
**特点**:
- 独立的表单逻辑和状态管理
- 使用 FormSections 组件组合
- 包含日期格式化、表单验证等完整功能

### DetailInfoForm（冲刺营/私塾模板表单）

**用途**: 原有的冲刺营和私塾模板表单  
**优化点**:
- 使用 `FuwuSchoolForm` 处理服务学校模板
- 保持原有冲刺营/私塾模板的完整功能
- 代码结构更清晰

## 📊 重构前后对比

### 重构前
```
DetailInfoForm.tsx (1600+ 行)
├── 服务学校模板表单 (300+ 行)
├── 冲刺营/私塾模板表单 (1300+ 行)
└── 工具函数和状态管理
```

### 重构后
```
FormSections/ (可复用组件)
├── StudentInfoSection.tsx (130 行)
├── GuardianInfoSection.tsx (90 行)
├── ServiceInfoSection.tsx (130 行)
├── BasicInfoDisplay.tsx (60 行)
└── FormActions.tsx (70 行)

FuwuSchoolForm.tsx (180 行)
└── 使用 FormSections 组合

DetailInfoForm.tsx (1300 行)
└── 保持原有功能，使用 FuwuSchoolForm
```

## 🚀 使用示例

### 添加新模板

1. 创建新的表单组件（如 `NewTemplateForm.tsx`）
2. 复用 `FormSections` 中的组件
3. 在 `DetailInfoForm.tsx` 中添加条件判断

```typescript
// DetailInfoForm.tsx
import NewTemplateForm from './NewTemplateForm';

const isNewTemplate = templateCode === 'NEW_TEMPLATE';

if (isNewTemplate) {
  return (
    <NewTemplateForm
      initialValues={initialValues}
      signTaskId={signTaskId}
      basicInfo={basicInfo}
      onSubmit={onSubmit}
      loading={loading}
      onValuesChange={onValuesChange}
      isViewOnly={isViewOnly}
    />
  );
}
```

### 修改某个区域

只需修改对应的 Section 组件，不会影响其他部分：

```typescript
// 修改学生信息区域
// FormSections/StudentInfoSection.tsx
// 只需在这个文件中修改，所有使用该组件的地方都会更新
```

## ✅ 优化成果

1. **代码行数减少**: 通过组件复用，减少了重复代码
2. **可读性提升**: 每个文件职责单一，易于理解
3. **可维护性提升**: 修改某个区域不会影响其他部分
4. **可扩展性提升**: 新增模板更加简单
5. **修复 Lint 错误**: 移除未使用的变量和导入

## 📝 注意事项

1. 所有 FormSections 组件都是纯展示组件，不包含业务逻辑
2. 表单状态管理在父组件（FuwuSchoolForm 或 DetailInfoForm）中
3. 日期字段的格式化在父组件中统一处理
4. 保持向后兼容，不影响现有功能
