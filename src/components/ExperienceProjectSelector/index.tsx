import React, { useState, useEffect, useRef } from 'react';
import { Picker, Button, Cell } from '@arco-design/mobile-react';
import { ExperienceProject } from '../../types';
import './index.less';

interface ExperienceProjectSelectorProps {
  value: ExperienceProject[];
  onChange: (value: ExperienceProject[]) => void;
  showErrors?: boolean;
}

// 项目类型配置
const PROJECT_TYPES = [
  {
    key: 'subject_diagnosis',
    label: '学科诊断',
    description: '专业的学科能力评估'
  },
  {
    key: 'career_planning',
    label: '专业规划',
    description: '个性化升学规划指导'
  },
  {
    key: 'trial_class',
    label: '试听课',
    description: '体验优质教学课程'
  }
];

// 学科配置
const SUBJECTS = [
  { key: 'chinese', label: '语文' },
  { key: 'math', label: '数学' },
  { key: 'english', label: '英语' },
  { key: 'physics', label: '物理' },
  { key: 'chemistry', label: '化学' },
  { key: 'biology', label: '生物' },
  { key: 'politics', label: '政治' },
  { key: 'history', label: '历史' },
  { key: 'geography', label: '地理' },
  { key: 'japanese', label: '日语' },
  { key: 'technology', label: '技术' }
];

const ExperienceProjectSelector: React.FC<ExperienceProjectSelectorProps> = ({
  value = [],
  onChange,
  showErrors = false
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerValue] = useState(['subject_diagnosis', 'chinese']);
  const [selectedItems, setSelectedItems] = useState<ExperienceProject[]>([]);
  const pickerRef = useRef<any>();

  // 构建Picker数据 - 使用级联结构
  const pickerData = React.useMemo(() => {
    return PROJECT_TYPES.map(project => ({
      label: project.label,
      value: project.key,
      children: SUBJECTS.map(subject => ({
        label: subject.label,
        value: subject.key
      }))
    }));
  }, []);

  // 初始化数据
  useEffect(() => {
    if (value.length > 0) {
      setSelectedItems(value);
    }
  }, []);

  // 处理Picker确定选择
  const handlePickerOk = (value: any[]) => {
    const [projectType, subject] = value.map(v => String(v));
    
    // 检查是否已存在相同的项目类型
    const existingProjectIndex = selectedItems.findIndex(
      item => item.appointmentType === projectType
    );
    
    let newSelectedItems: ExperienceProject[];
    
    if (existingProjectIndex >= 0) {
      // 如果项目类型已存在，添加学科到该项目
      newSelectedItems = [...selectedItems];
      const existingSubjects = newSelectedItems[existingProjectIndex].subjects;
      
      if (!existingSubjects.includes(subject)) {
        newSelectedItems[existingProjectIndex] = {
          ...newSelectedItems[existingProjectIndex],
          subjects: [...existingSubjects, subject]
        };
      }
    } else {
      // 如果项目类型不存在，创建新项目
      newSelectedItems = [
        ...selectedItems,
        {
          appointmentType: projectType,
          subjects: [subject]
        }
      ];
    }
    
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
    setShowPicker(false);
  };

  // 移除选择的学科
  const handleRemoveSubject = (projectType: string, subject: string) => {
    const newSelectedItems = selectedItems.map(item => {
      if (item.appointmentType === projectType) {
        const newSubjects = item.subjects.filter(s => s !== subject);
        return {
          ...item,
          subjects: newSubjects
        };
      }
      return item;
    }).filter(item => item.subjects.length > 0); // 移除没有学科的项目
    
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
  };

  // 移除整个项目
  const handleRemoveProject = (projectType: string) => {
    const newSelectedItems = selectedItems.filter(
      item => item.appointmentType !== projectType
    );
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
  };

  // 获取项目类型的显示名称
  const getProjectLabel = (projectType: string) => {
    return PROJECT_TYPES.find(p => p.key === projectType)?.label || projectType;
  };

  // 获取学科的显示名称
  const getSubjectLabel = (subjectKey: string) => {
    return SUBJECTS.find(s => s.key === subjectKey)?.label || subjectKey;
  };

  // 检查是否有错误
  const hasError = showErrors && selectedItems.length === 0;

  return (
    <div className="experience-project-selector">
      {/* 已选择的项目展示 */}
      <div className="selected-projects">
        {selectedItems.map((item, index) => (
          <div key={`${item.appointmentType}-${index}`} className="selected-project-item">
            <div className="project-header">
              <span className="project-name">{getProjectLabel(item.appointmentType)}</span>
              <Button
                size="mini"
                className="remove-project-btn"
                onClick={() => handleRemoveProject(item.appointmentType)}
              >
                ✕
              </Button>
            </div>
            <div className="selected-subjects">
              {item.subjects.map(subject => (
                <div key={subject} className="subject-tag">
                  <span>{getSubjectLabel(subject)}</span>
                  <button
                    className="remove-subject-btn"
                    onClick={() => handleRemoveSubject(item.appointmentType, subject)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 添加按钮 */}
      <div className="add-selection-container">
        <Cell.Group bordered={false}>
          <Cell
            label="选择体验项目"
            showArrow
            onClick={() => setShowPicker(true)}
            className="add-selection-cell"
          >
            {selectedItems.length > 0 ? '已选择项目' : '点击选择项目'}
          </Cell>
        </Cell.Group>
      </div>

      {/* Picker选择器 */}
      <Picker
        ref={pickerRef}
        visible={showPicker}
        cascade={true}
        data={pickerData}
        maskClosable={true}
        hideEmptyCols={true}
        onHide={() => {
          setShowPicker(false);
        }}
        onOk={handlePickerOk}
        onPickerChange={() => {
          if (pickerRef.current && pickerRef.current.getAllColumnValues) {
            console.info('-----demo getAllColumnValues', pickerRef.current.getAllColumnValues());
          }
        }}
        value={pickerValue}
        cols={2}
        needBottomOffset={true}
        title="选择体验项目"
      />
      
      {hasError && (
        <div className="error-hint">请选择至少一个体验项目</div>
      )}
    </div>
  );
};

export default ExperienceProjectSelector;