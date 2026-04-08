import React, { useState, useEffect } from "react";
import {
  DatePicker,
  Button,
  message,
  ConfigProvider,
  Empty,
  Table,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import zhCN from "antd/locale/zh_CN";
import dayjs, { Dayjs } from "dayjs";
import { Layout } from "@/components/Layout";
import { useTheme } from "@/hooks/useTheme";
import CustomerSelectModal, { Customer } from "@/components/CustomerSelectModal";
import {
  fetchRecordingList,
  RecordingItem,
  RecordingQueryParams,
  bindContact,
} from "@/services/recording";
import "./index.less";

const RecordingManagement: React.FC = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<RecordingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchDate, setSearchDate] = useState<Dayjs>(dayjs());
  
  // 客户选择弹窗
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<RecordingItem | null>(null);
  
  // 使用 ref 防止 StrictMode 下的重复请求
  const hasLoadedRef = React.useRef(false);

  // 加载数据
  const loadData = async (force: boolean = false) => {
    // 如果已经请求过，直接返回（防止 StrictMode 重复调用）
    if (!force && hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    
    setLoading(true);
    try {
      const dateStr = searchDate.format("YYYY-MM-DD");
      const params: RecordingQueryParams = {
        pageNumber,
        pageSize,
        startTime: `${dateStr} 00:00:00`,
        endTime: `${dateStr} 23:59:59`,
      };

      const response = await fetchRecordingList(params);

      if (response.data?.code === 200 && response.data?.data) {
        // 处理录音数据，自动匹配客户信息
        const recordings = response.data.data.data.map((item) => ({
          ...item,
          customer: item.contactAlias
            ? {
                id: item.id,
                name: item.contactAlias,
                alias: item.contactAlias,
                wxId: item.contactWxId || "",
              }
            : null,
        }));
        
        setDataSource(recordings);
        setTotal(response.data.data.total);
      } else {
        throw new Error(response.data?.message || "获取录音列表失败");
      }
    } catch (error) {
      console.error("获取录音列表失败:", error);
      message.error(
        error instanceof Error ? error.message : "获取录音列表失败"
      );
      setDataSource([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 搜索
  const handleSearch = () => {
    setPageNumber(1);
    hasLoadedRef.current = false;
    loadData(true);
  };

  // 重置
  const handleReset = () => {
    setSearchDate(dayjs());
    setPageNumber(1);
  };

  // 播放录音
  const handlePlay = (record: RecordingItem) => {
    if (!record.url) {
      message.warning("录音文件不可用");
      return;
    }
    
    // 打开新窗口播放音频
    const audioWindow = window.open("", "_blank");
    if (audioWindow) {
      audioWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>录音播放 - ${record.customer?.name || "未选择客户"}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: #f5f5f5;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              max-width: 600px;
              width: 100%;
            }
            h2 {
              margin: 0 0 20px 0;
              color: #1f2937;
            }
            .info {
              margin-bottom: 20px;
              padding: 15px;
              background: #f9fafb;
              border-radius: 8px;
            }
            .info-item {
              margin: 8px 0;
              color: #6b7280;
            }
            .info-item strong {
              color: #374151;
            }
            audio {
              width: 100%;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>录音播放</h2>
            <div class="info">
              <div class="info-item"><strong>客户:</strong> ${record.customer?.name || "未选择客户"}</div>
              <div class="info-item"><strong>开始时间:</strong> ${formatDateTime(record.startTime)}</div>
              <div class="info-item"><strong>结束时间:</strong> ${formatDateTime(record.endTime)}</div>
              <div class="info-item"><strong>时长:</strong> ${formatDuration(record.duration)}</div>
            </div>
            <audio controls autoplay>
              <source src="${record.url}" type="audio/mpeg">
              您的浏览器不支持音频播放。
            </audio>
          </div>
        </body>
        </html>
      `);
    }
  };

  // 下载录音
  const handleDownload = (record: RecordingItem) => {
    if (!record.url) {
      message.warning("录音文件不可用");
      return;
    }
    
    try {
      const link = document.createElement("a");
      link.href = record.url;
      link.download = record.filename || "recording.mp3";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success("开始下载录音");
    } catch (error) {
      console.error("下载失败:", error);
      message.error("下载失败，请稍后重试");
    }
  };

  // 格式化日期时间
  const formatDateTime = (dateTimeStr: string): string => {
    if (!dateTimeStr) return "";
    return dayjs(dateTimeStr).format("YYYY-MM-DD HH:mm:ss");
  };

  // 格式化时长
  const formatDuration = (duration: number): string => {
    if (!duration) return "00:00:00";
    // duration/60 = 真实的视频时长（单位分钟）
    const totalMinutes = Math.floor(duration / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = Math.floor(duration % 60);
    
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // 打开客户选择弹窗
  const openCustomerModal = (record: RecordingItem) => {
    setCurrentRecording(record);
    setCustomerModalVisible(true);
  };

  // 关闭客户选择弹窗
  const closeCustomerModal = () => {
    setCustomerModalVisible(false);
    setCurrentRecording(null);
  };

  // 处理客户选择
  const handleCustomerSelect = async (customer: Customer | null) => {
    if (!currentRecording) return;

    try {
      if (customer) {
        // 有选中客户，调用绑定联系人接口
        const response = await bindContact({
          id: currentRecording.id,
          contactWxId: customer.wxId,
        });

        if (response.data?.code === 200) {
          // 绑定成功，更新本地数据
          setDataSource((prev) =>
            prev.map((item) =>
              item.id === currentRecording.id
                ? { ...item, customer }
                : item
            )
          );
          message.success("客户绑定成功");
        } else {
          throw new Error(response.data?.message || "绑定客户失败");
        }
      } else {
        // 没有选中客户，调用绑定接口但不传contactWxId参数来清除绑定
        const response = await bindContact({
          id: currentRecording.id,
        });

        if (response.data?.code === 200) {
          // 清除绑定成功，更新本地数据
          setDataSource((prev) =>
            prev.map((item) =>
              item.id === currentRecording.id
                ? { ...item, customer: null }
                : item
            )
          );
          message.success("客户绑定已清除");
        } else {
          throw new Error(response.data?.message || "清除客户绑定失败");
        }
      }

      // 关闭客户选择弹窗
      closeCustomerModal();
      
      // 刷新录音列表
      await loadData(true);
    } catch (error) {
      console.error("绑定客户失败:", error);
      message.error(
        error instanceof Error ? error.message : "绑定客户失败"
      );
      // 关闭客户选择弹窗
      closeCustomerModal();
    }
  };

  // 表格列配置
  const columns = [
    {
      title: "客户",
      dataIndex: "customer",
      key: "customer",
      width: 150,
      render: (_: any, record: RecordingItem) => (
        <Button
          type="text"
          className={`customer-btn ${record.customer ? "has-customer" : ""}`}
          onClick={() => openCustomerModal(record)}
        >
          {record.customer ? record.customer.name : "选择客户"}
        </Button>
      ),
    },
    {
      title: "开始时间",
      dataIndex: "startTime",
      key: "startTime",
      width: 180,
      render: (text: string) => (
        <span className="time-cell">{formatDateTime(text)}</span>
      ),
    },
    {
      title: "结束时间",
      dataIndex: "endTime",
      key: "endTime",
      width: 180,
      render: (text: string) => (
        <span className="time-cell">{formatDateTime(text)}</span>
      ),
    },
    {
      title: "时长",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      render: (text: number) => (
        <span className="duration-cell">{formatDuration(text)}</span>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: RecordingItem) => (
        <div className="action-buttons">
          <Button
            type="link"
            size="small"
            onClick={() => handlePlay(record)}
            disabled={!record.url}
            title={record.url ? "播放录音" : "录音文件不可用"}
          >
            ▶️ 播放
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleDownload(record)}
            disabled={!record.url}
            title={record.url ? "下载录音" : "录音文件不可用"}
          >
            📥 下载
          </Button>
        </div>
      ),
    },
  ];

  // 统一加载数据
  useEffect(() => {
    // 重置加载标志，允许新的加载
    hasLoadedRef.current = false;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, searchDate]);

  return (
    <Layout>
      <ConfigProvider locale={zhCN}>
        <div className={`recording-management-page ${isDark ? "dark-theme" : "light-theme"}`}>
          <div className="page-header">
            <h1>录音管理</h1>
          </div>

          {/* 搜索区域 */}
          <div className="filter-section">
            <div className="filter-row">
              <div className="filter-item">
                <label className="filter-label">日期范围</label>
                <DatePicker
                  value={searchDate}
                  onChange={(date) => date && setSearchDate(date)}
                  format="YYYY-MM-DD"
                  placeholder="选择日期"
                  className="filter-input"
                />
              </div>
              <div className="filter-actions">
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={loading}
                >
                  搜索
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </div>
            </div>
          </div>

          {/* 数据表格 */}
          <div className="table-section">
            <Table
              columns={columns}
              dataSource={dataSource}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pageNumber,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
                onChange: (page, size) => {
                  setPageNumber(page);
                  setPageSize(size || 10);
                },
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无录音数据"
                  />
                ),
              }}
              scroll={{ x: 900 }}
            />
          </div>

          {/* 客户选择弹窗 */}
          <CustomerSelectModal
            visible={customerModalVisible}
            defaultSearch={currentRecording?.contactAlias || currentRecording?.customer?.name || ""}
            startTime={currentRecording ? `${searchDate.format("YYYY-MM-DD")} 00:00:00` : ""}
            endTime={currentRecording ? `${searchDate.format("YYYY-MM-DD")} 23:59:59` : ""}
            onClose={closeCustomerModal}
            onConfirm={handleCustomerSelect}
          />
        </div>
      </ConfigProvider>
    </Layout>
  );
};

export default RecordingManagement;


