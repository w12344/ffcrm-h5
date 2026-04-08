import React from 'react';
import { Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

interface FormActionsProps {
  /** 是否为只读模式 */
  isViewOnly?: boolean;
  /** 保存草稿加载状态 */
  saveDraftLoading?: boolean;
  /** 预览加载状态 */
  previewLoading?: boolean;
  /** 提交加载状态 */
  submitLoading?: boolean;
  /** 保存草稿回调 */
  onSaveDraft?: () => void;
  /** 预览回调 */
  onPreview?: () => void;
  /** 提交回调 */
  onSubmit?: () => void;
}

/**
 * 表单操作按钮区域
 */
const FormActions: React.FC<FormActionsProps> = ({
  isViewOnly = false,
  saveDraftLoading = false,
  previewLoading = false,
  submitLoading = false,
  onSaveDraft,
  onPreview,
  onSubmit,
}) => {
  if (isViewOnly) {
    return null;
  }

  return (
    <div className="footer-actions">
      <Button 
        size="large"
        icon={<EyeOutlined />}
        loading={previewLoading}
        onClick={onPreview}
      >
        预览合同
      </Button>
      <Button 
        size="large"
        loading={saveDraftLoading}
        onClick={onSaveDraft}
      >
        保存草稿
      </Button>
      <Button 
        type="primary" 
        size="large"
        loading={submitLoading}
        onClick={onSubmit}
      >
        提交合同
      </Button>
    </div>
  );
};

export default FormActions;
