import React, { memo } from 'react';
import { Input, Select } from 'antd';
import { StudentBasicInfo } from '../types';

interface BasicInfoFormProps {
  data: StudentBasicInfo;
  isEditing: boolean;
  editFormData: any;
  themeClass: string;
  onFieldChange: (field: string, value: any) => void;
}

/**
 * 基本信息表单组件
 * 用于展示和编辑学生基本信息
 */
const BasicInfoForm: React.FC<BasicInfoFormProps> = memo(({
  data,
  isEditing,
  editFormData,
  themeClass,
  onFieldChange,
}) => {
  const infoItems = [
    {
      label: '姓名',
      field: 'realName',
      value: data.realName,
      editable: true,
      placeholder: '请输入姓名',
    },
    {
      label: '性别',
      field: 'gender',
      value: data.gender,
      editable: true,
      type: 'select',
      options: [
        { label: '男', value: '男' },
        { label: '女', value: '女' },
      ],
      placeholder: '请选择性别',
    },
    {
      label: '高考年届',
      field: 'examYear',
      value: data.examYear,
      editable: false,
      placeholder: '请输入高考年届',
    },
    {
      label: '学籍省份',
      field: 'province',
      value: data.province,
      editable: true,
      placeholder: '请输入学籍省份',
    },
    {
      label: '就读高中',
      field: 'currentSchool',
      value: data.currentSchool,
      editable: true,
      placeholder: '请输入就读高中',
    },
    {
      label: '主修专业',
      field: 'major',
      value: data.major,
      editable: true,
      placeholder: '请输入主修专业',
    },
  ];

  return (
    <div className="info-grid">
      {infoItems.map((item) => (
        <div key={item.field} className="info-item">
          <span className="info-label">{item.label}:</span>
          {!isEditing ? (
            <span className="info-value">{item.value || '-'}</span>
          ) : item.type === 'select' ? (
            <Select
              size="small"
              value={editFormData[item.field]}
              onChange={(value) => onFieldChange(item.field, value)}
              style={{ width: '100%' }}
              placeholder={item.placeholder}
              disabled={!item.editable}
              popupClassName={
                themeClass === 'light-theme' ? 'light-theme-dropdown' : ''
              }
            >
              {item.options?.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <Input
              className="info-input"
              size="small"
              value={editFormData[item.field]}
              onChange={(e) => onFieldChange(item.field, e.target.value)}
              placeholder={item.placeholder}
              disabled={!item.editable}
            />
          )}
        </div>
      ))}
    </div>
  );
});

BasicInfoForm.displayName = 'BasicInfoForm';

export default BasicInfoForm;
