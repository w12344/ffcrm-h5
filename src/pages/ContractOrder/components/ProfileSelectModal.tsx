import React, { useEffect, useState } from "react";
import { Select, message, Spin, Button, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { fetchProfilesWithContracts, ProfileWithContract } from "@/services/contract";
import { useTheme } from "@/hooks/useTheme";
import PremiumModal from "@/components/PremiumModal";
import "./ProfileSelectModal.less";

interface ProfileSelectModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (profileId: number) => void;
}

const ProfileSelectModal: React.FC<ProfileSelectModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  const { isDark } = useTheme();
  const [profiles, setProfiles] = useState<ProfileWithContract[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // 加载档案列表
  const loadProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetchProfilesWithContracts();
      if (response.data?.code === 200 && response.data?.data) {
        // 去重：根据档案ID去重，保留第一个出现的档案
        const uniqueProfiles = response.data.data
        setProfiles(uniqueProfiles);
      } else {
        message.error(response.data?.message || "加载档案列表失败");
        setProfiles([]);
      }
    } catch (error) {
      console.error("加载档案列表失败:", error);
      message.error("加载档案列表失败");
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  // 当弹窗打开时加载档案列表
  useEffect(() => {
    if (visible) {
      loadProfiles();
      setSelectedProfileId(undefined);
    }
  }, [visible]);

  // 处理确认
  const handleOk = () => {
    if (!selectedProfileId) {
      message.warning("请选择档案");
      return;
    }
    onConfirm(selectedProfileId);
  };

  return (
    <PremiumModal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "0.267rem" }}>
          <UserOutlined style={{ color: "var(--color-purple-primary)" }} />
          <span>选择档案</span>
        </div>
      }
      visible={visible}
      onClose={onCancel}
      width={600}
      destroyOnClose
      className={`profile-select-modal ${isDark ? "dark-theme" : "light-theme"}`}
    >
      <Spin spinning={loading}>
        <div style={{ padding: "0.533rem 0" }}>
          <div style={{ marginBottom: "0.267rem", color: "var(--text-secondary)", fontSize: "0.373rem" }}>
            请选择要创建合同的档案：
          </div>
          <Select
            style={{ width: "100%" }}
            placeholder="请选择档案"
            value={selectedProfileId}
            onChange={setSelectedProfileId}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={profiles.map(p => ({
              value: p.id,
              label: p.profileName
            }))}
            size="large"
          />
        </div>
      </Spin>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: '20px',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        marginTop: '8px'
      }}>
        <Space size={16}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleOk}>确认</Button>
        </Space>
      </div>
    </PremiumModal>
  );
};

export default ProfileSelectModal;
