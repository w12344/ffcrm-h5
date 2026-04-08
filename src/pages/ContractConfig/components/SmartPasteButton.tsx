import React, { useState } from 'react';
import { Button, Input, message, Grid, Space } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { parsePastedText, validateAndConvertData } from '../utils/pasteParser';
import PremiumModal from '@/components/PremiumModal';

const { TextArea } = Input;
const { useBreakpoint } = Grid;

interface SmartPasteButtonProps {
  onPaste: (data: Record<string, any>) => void;
  size?: 'large' | 'middle' | 'small';
  buttonText?: string;
}

const SmartPasteButton: React.FC<SmartPasteButtonProps> = ({
  onPaste,
  size = 'middle',
  buttonText = '智能粘贴',
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [parsedData, setParsedData] = useState<Record<string, any>>({});
  const screens = useBreakpoint();

  // 判断是否为移动端（md断点以下视为移动端）
  // screens 如果为空（初始化时），默认为非移动端布局，或者根据 window 宽度判断
  const isMobile = screens.md === false;

  // 监听粘贴内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPasteContent(text);

    if (text.trim()) {
      const parsed = parsePastedText(text);
      const validated = validateAndConvertData(parsed);
      setParsedData(validated);
    } else {
      setParsedData({});
    }
  };

  // 打开弹窗
  const handleOpenModal = () => {
    setIsModalVisible(true);
    setPasteContent('');
    setParsedData({});
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  // 确认粘贴
  const handleConfirmPaste = () => {
    if (Object.keys(parsedData).length > 0) {
      onPaste(parsedData);
      message.success(`成功填充 ${Object.keys(parsedData).length} 个字段`);
      setIsModalVisible(false);
    } else {
      message.warning('未能识别有效字段');
    }
  };

  // 从剪贴板粘贴
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPasteContent(text);
        const parsed = parsePastedText(text);
        const validated = validateAndConvertData(parsed);
        setParsedData(validated);
      }
    } catch (error) {
      message.error('无法读取剪贴板内容，请手动粘贴');
    }
  };

  // 复制模板
  const handleCopyTemplate = async () => {
    const template = `现在需要家长提供以下信息，我可以提前把电子合同编辑好。这样入学就更加便利，不必等待。
学生姓名：
学生性别：
学生手机号：
学生身份证号：
原高中：
当前年级：
监护人姓名：
监护人手机号：
监护人身份证号：
监护人与学生关系：
联系地址：`;

    try {
      await navigator.clipboard.writeText(template);
      message.success('模板已复制到剪贴板');
    } catch (error) {
      message.error('复制失败，请手动复制');
    }
  };

  return (
    <>
      <Button
        type={buttonText === '智能粘贴' ? 'default' : 'text'}
        icon={<CopyOutlined />}
        onClick={handleOpenModal}
        size={size}
      >
        {buttonText}
      </Button>

      <PremiumModal
        title="智能粘贴"
        visible={isModalVisible}
        onClose={handleCloseModal}
        width={isMobile ? '95%' : 800}
      >
        <div>
          {/* 支持字段说明 */}
          <div style={{
            marginBottom: '10px',
            padding: '8px',
            background: '#f5f7fa',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#606266',
            lineHeight: '1.5'
          }}>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>支持字段：</div>
            <div style={{ color: '#909399', fontSize: '11px' }}>
              学生姓名/性别/手机号/身份证/高中/年级、
              监护人姓名/手机号/身份证/关系、联系地址
            </div>
            <div style={{ fontSize: '11px', color: '#ff4d4f', marginTop: '4px' }}>
              监护人信息会自动填充到第一步和第二步对应字段
            </div>
          </div>

          {/* 布局：移动端上下，桌面端左右 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '12px',
            marginBottom: '12px'
          }}>
            {/* 示例区域 */}
            <div style={{
              padding: '10px 12px',
              background: '#fff9e6',
              borderRadius: '4px',
              border: '1px solid #ffe58f',
              fontSize: '12px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{ fontWeight: 500, color: '#d48806' }}>
                  粘贴示例
                </span>
                <Button
                  size="small"
                  type="link"
                  onClick={handleCopyTemplate}
                  style={{ padding: 0, height: 'auto', color: '#d48806', fontSize: '12px' }}
                >
                  复制模板
                </Button>
              </div>
              <div style={{
                fontFamily: 'Consolas, Monaco, monospace',
                lineHeight: '1.5',
                color: '#595959',
                fontSize: '11px',
                maxHeight: isMobile ? '80px' : 'none', // 移动端限制高度
                overflowY: 'auto'
              }}>
                学生姓名：李四<br />
                学生性别：男<br />
                学生手机号：13900139000<br />
                学生身份证号：110101200501011234<br />
                原高中：北京市第一中学<br />
                当前年级：高三<br />
                监护人姓名：张三<br />
                监护人手机号：13800138000<br />
                监护人身份证号：110101198001011234<br />
                监护人与学生关系：父亲<br />
                联系地址：北京市朝阳区某某街道123号
              </div>
            </div>

            {/* 粘贴区域 */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{ fontSize: '12px', color: '#606266', fontWeight: 500 }}>
                  粘贴内容
                </span>
                <Button
                  size="small"
                  type="link"
                  onClick={handlePasteFromClipboard}
                  style={{ padding: 0, height: 'auto', fontSize: '12px' }}
                >
                  从剪贴板粘贴
                </Button>
              </div>
              <TextArea
                value={pasteContent}
                onChange={handleContentChange}
                placeholder="请在此粘贴内容..."
                rows={isMobile ? 6 : 11} // 移动端减少行数
                style={{
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '12px'
                }}
              />
            </div>
          </div>

          {/* 识别结果 */}
          {Object.keys(parsedData).length > 0 && (
            <div style={{
              padding: '8px 10px',
              background: '#f0f9ff',
              borderRadius: '4px',
              border: '1px solid #d1e9ff'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#1890ff',
                marginBottom: '6px'
              }}>
                识别到 {Object.keys(parsedData).length} 个字段
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
                gap: '6px',
                fontSize: '12px'
              }}>
                {Object.entries(parsedData).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      padding: '2px 6px',
                      background: '#fff',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      border: '1px solid #e6f7ff'
                    }}
                    title={`${key}: ${String(value)}`}
                  >
                    <span style={{ color: '#909399', fontSize: '11px' }}>{key}:</span>{' '}
                    <span style={{ color: '#303133', fontWeight: 500 }}>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: '20px',
          borderTop: '1px solid rgba(0,0,0,0.04)',
          marginTop: '8px'
        }}>
          <Space size={16}>
            <Button onClick={handleCloseModal}>取消</Button>
            <Button type="primary" onClick={handleConfirmPaste} disabled={Object.keys(parsedData).length === 0}>确认填充</Button>
          </Space>
        </div>
      </PremiumModal>
    </>
  );
};

export default SmartPasteButton;
