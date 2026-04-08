import React from 'react';
import { Input, Select, Upload, Button, InputProps, SelectProps, ButtonProps } from 'antd';
import type { UploadProps } from 'antd';
import { TextAreaProps } from 'antd/es/input';
import './index.less';

// --- Premium Button ---
export interface PremiumButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'icon' | 'ghost-action';
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({ variant = 'primary', className, ...props }) => {
  return (
    <Button
      {...props}
      className={`premium-btn premium-btn-${variant} ${className || ''}`}
    />
  );
};

// --- Premium Input ---
export const PremiumInput: React.FC<InputProps> = (props) => {
  return (
    <Input
      {...props}
      className={`premium-input ${props.className || ''}`}
    />
  );
};

// --- Premium Select ---
export const PremiumSelect = Object.assign(
  (props: SelectProps<any>) => {
    return (
      <Select
        {...props}
        className={`premium-select ${props.className || ''}`}
        dropdownClassName={`premium-select-dropdown ${props.dropdownClassName || ''}`}
        popupClassName={`premium-select-dropdown ${props.popupClassName || ''}`}
      />
    );
  },
  { Option: Select.Option }
);

// --- Premium TextArea ---
const { TextArea } = Input;
export const PremiumTextArea: React.FC<TextAreaProps> = (props) => {
  return (
    <TextArea
      {...props}
      className={`premium-textarea ${props.className || ''}`}
    />
  );
};

// --- Premium Password ---
const { Password } = Input;
export const PremiumPassword: React.FC<InputProps> = (props) => {
  return (
    <Password
      {...props}
      className={`premium-input ${props.className || ''}`}
    />
  );
};

// --- Premium Upload Dragger ---
const { Dragger } = Upload;
export const PremiumUploadDragger: React.FC<UploadProps> = (props) => {
  return (
    <Dragger
      {...props}
      className={`premium-upload-dragger ${props.className || ''}`}
    />
  );
};
