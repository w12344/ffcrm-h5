import React, { useState, useRef, useEffect } from "react";
import {
  PhoneOutlined,
  CloseOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import { message, Image } from "antd";
import BenzAMRRecorder from "benz-amr-recorder";
import { CommunicationRecord, CallType } from "@/pages/CustomerProfile/types";
import ContextMenu, { ContextMenuItem } from "@/components/ContextMenu";
import { EmptyState } from "@/components";
import { fetchRecordTranscription } from "@/services/profile";
import chatIcon from "@/assets/images/chat.png";
import darkIcon from "@/assets/images/chat-dark.png";
import PremiumModal from "@/components/PremiumModal";
import "./index.less";

// 微信表情映射表（使用系统 emoji）
const EMOJI_MAP: Record<string, string> = {
  "[微笑]": "😊",
  "[撇嘴]": "😕",
  "[色]": "😍",
  "[发呆]": "😳",
  "[得意]": "😎",
  "[流泪]": "😢",
  "[害羞]": "😊",
  "[闭嘴]": "🤐",
  "[睡]": "😴",
  "[大哭]": "😭",
  "[尴尬]": "😅",
  "[发怒]": "😠",
  "[调皮]": "😜",
  "[呲牙]": "😁",
  "[惊讶]": "😲",
  "[难过]": "😞",
  "[酷]": "😎",
  "[冷汗]": "😰",
  "[抓狂]": "😫",
  "[吐]": "🤮",
  "[偷笑]": "😏",
  "[可爱]": "😊",
  "[白眼]": "🙄",
  "[傲慢]": "😤",
  "[饥饿]": "🤤",
  "[困]": "😪",
  "[惊恐]": "😱",
  "[流汗]": "😓",
  "[憨笑]": "😄",
  "[大兵]": "🪖",
  "[奋斗]": "💪",
  "[咒骂]": "😡",
  "[疑问]": "❓",
  "[嘘]": "🤫",
  "[晕]": "😵",
  "[折磨]": "😣",
  "[衰]": "😩",
  "[骷髅]": "💀",
  "[敲打]": "👊",
  "[再见]": "👋",
  "[擦汗]": "😅",
  "[抠鼻]": "🤧",
  "[鼓掌]": "👏",
  "[糗大了]": "😳",
  "[坏笑]": "😈",
  "[左哼哼]": "😤",
  "[右哼哼]": "😤",
  "[哈欠]": "😴",
  "[鄙视]": "🙄",
  "[委屈]": "😔",
  "[快哭了]": "😢",
  "[阴险]": "😏",
  "[亲亲]": "😘",
  "[吓]": "😱",
  "[可怜]": "🥺",
  "[菜刀]": "🔪",
  "[西瓜]": "🍉",
  "[啤酒]": "🍺",
  "[篮球]": "🏀",
  "[乒乓]": "🏓",
  "[咖啡]": "☕",
  "[饭]": "🍚",
  "[猪头]": "🐷",
  "[玫瑰]": "🌹",
  "[凋谢]": "🥀",
  "[示爱]": "💕",
  "[爱心]": "❤️",
  "[心碎]": "💔",
  "[蛋糕]": "🎂",
  "[闪电]": "⚡",
  "[炸弹]": "💣",
  "[刀]": "🔪",
  "[足球]": "⚽",
  "[瓢虫]": "🐞",
  "[便便]": "💩",
  "[月亮]": "🌙",
  "[太阳]": "☀️",
  "[礼物]": "🎁",
  "[拥抱]": "🤗",
  "[强]": "💪",
  "[弱]": "💪",
  "[握手]": "🤝",
  "[胜利]": "✌️",
  "[抱拳]": "🙏",
  "[勾引]": "👉",
  "[拳头]": "👊",
  "[差劲]": "👎",
  "[爱你]": "💕",
  "[NO]": "❌",
  "[OK]": "✅",
  "[爱情]": "💑",
  "[飞吻]": "😘",
  "[跳跳]": "🦘",
  "[发抖]": "😨",
  "[怄火]": "😡",
  "[转圈]": "🔄",
  "[磕头]": "🙇",
  "[回头]": "👀",
  "[跳绳]": "🏃",
  "[挥手]": "👋",
  "[激动]": "😆",
  "[街舞]": "💃",
  "[献吻]": "😘",
  "[左太极]": "☯️",
  "[右太极]": "☯️",
  "[苦涩]": "😖",
  "[旺柴]": "🐕",
};

/**
 * 解析文本中的表情符号，将表情文本替换为系统 emoji
 * @param text 原始文本
 * @returns 处理后的文本字符串
 */
const parseEmoji = (text: string): string => {
  if (!text) return "";

  let result = text;

  // 遍历所有表情映射，替换文本中的表情标记为对应的 emoji
  Object.keys(EMOJI_MAP).forEach((emojiText) => {
    const emoji = EMOJI_MAP[emojiText];
    // 使用全局替换，将所有匹配的表情文本替换为 emoji
    result = result.replace(new RegExp(emojiText.replace(/[\[\]]/g, "\\$&"), "g"), emoji);
  });

  return result;
};

// 微信风格的暂停图标（两个竖线）
const VoicePauseIcon: React.FC<
  React.SVGProps<SVGSVGElement> & { className?: string }
> = ({ className, ...props }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* 两个竖线 */}
    <rect x="5" y="4" width="2" height="8" fill="currentColor" rx="0.5" />
    <rect x="9" y="4" width="2" height="8" fill="currentColor" rx="0.5" />
  </svg>
);

interface CommunicationRecordsProps {
  records: CommunicationRecord[];
  themeMode?: "light" | "dark";
}

/**
 * 沟通记录组件 - 参考微信聊天界面
 */
const CommunicationRecords: React.FC<CommunicationRecordsProps> = ({
  records,
  themeMode = "light",
}) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const amrPlayerRef = useRef<any>(null);

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    recordId: string;
    recordType: string;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    recordId: "",
    recordType: "PHONE",
  });

  // 长按相关状态
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [transcribing, setTranscribing] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<Record<string, string>>(
    {}
  );
  // 防止重复打开音频错误窗口
  const errorHandledUrlsRef = useRef<Set<string>>(new Set());
  // iframe 音频播放器状态
  const [audioPlayerIframe, setAudioPlayerIframe] = useState<{
    visible: boolean;
    url: string;
    record?: CommunicationRecord;
    isPlaying?: boolean;
  }>({
    visible: false,
    url: "",
    isPlaying: false,
  });
  // iframe 引用
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // 滚动容器引用
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // 加载失败的图片 URL（用于显示占位符）
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());
  // 电话详情弹窗状态
  const [phoneDetailModal, setPhoneDetailModal] = useState<{
    visible: boolean;
    record?: CommunicationRecord;
    transcription?: string;
    loading: boolean;
    isPlaying?: boolean; // 通话详情中的音频播放状态
  }>({
    visible: false,
    loading: false,
    isPlaying: false,
  });

  /**
   * 格式化时间显示（参考微信）
   * - 今天：只显示时间 HH:mm
   * - 昨天：昨天 HH:mm
   * - 本周内：星期X HH:mm
   * - 超过一周：MM-DD HH:mm
   */
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const messageDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      // 获取时间字符串 HH:mm
      const timeString = date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // 今天：只显示时间
      if (messageDate.getTime() === today.getTime()) {
        return timeString;
      }

      // 昨天
      if (messageDate.getTime() === yesterday.getTime()) {
        return `昨天 ${timeString}`;
      }

      // 计算时间差（天数）
      const diffTime = today.getTime() - messageDate.getTime();
      const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));

      // 本周内（7天内）：显示星期几
      if (diffDays < 7) {
        const weekdays = [
          "星期日",
          "星期一",
          "星期二",
          "星期三",
          "星期四",
          "星期五",
          "星期六",
        ];
        const weekday = weekdays[date.getDay()];
        return `${weekday} ${timeString}`;
      }

      // 超过一周：显示日期 MM-DD HH:mm
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${month}-${day} ${timeString}`;
    } catch (error) {
      return timeStr;
    }
  };

  /**
   * 格式化时间（用于详情弹窗，显示完整日期和时间）
   */
  const formatDetailTime = (timeStr?: string) => {
    if (!timeStr) return "-";
    try {
      const date = new Date(timeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error("格式化时间失败:", error);
      return "-";
    }
  };

  /**
   * 格式化通话时长（duration 已经是秒为单位）
   */
  const formatCallDuration = (duration?: number) => {
    if (!duration) return "0秒";
    const seconds = Math.floor(duration);
    if (seconds < 60) {
      return `${seconds}秒`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${minutes}分${remainingSeconds}秒`
      : `${minutes}分`;
  };

  /**
   * 判断头像URL是否有效
   */
  const isValidAvatarUrl = (avatarUrl?: string): boolean => {
    return !!(
      avatarUrl &&
      avatarUrl !== "null" &&
      typeof avatarUrl === "string" &&
      avatarUrl.trim() !== ""
    );
  };

  /**
   * 从其他文本类型消息中获取相同发送者的头像
   * 用于某些消息类型没有头像时的回退
   */
  const getFallbackAvatar = (
    currentRecord: CommunicationRecord
  ): string | undefined => {
    // 如果当前记录已经有有效头像，直接返回
    if (isValidAvatarUrl(currentRecord.senderAvatar)) {
      return currentRecord.senderAvatar;
    }

    // 从其他记录中查找相同 senderType 的文本类型消息的头像
    for (const record of records) {
      // 跳过当前记录
      if (record.recordId === currentRecord.recordId) {
        continue;
      }

      // 必须是相同发送者类型
      if (record.senderType !== currentRecord.senderType) {
        continue;
      }

      // 必须是文本类型的消息：
      // 1. recordType 为 WECHAT 或 MESSAGE
      // 2. 或者 type === 1（文本消息）
      const isTextMessage =
        record.recordType === "WECHAT" ||
        record.recordType === "MESSAGE" ||
        record.type === 1;

      if (isTextMessage) {
        // 如果找到有效的头像，返回它
        if (isValidAvatarUrl(record.senderAvatar)) {
          return record.senderAvatar;
        }
      }
    }

    // 如果没找到，返回 undefined，使用默认占位符
    return undefined;
  };

  /**
   * 格式化通话时长为 MM:SS 格式（用于微信通话记录）
   */
  const formatCallDurationMMSS = (duration?: number) => {
    if (!duration) return "00:00";
    const totalSeconds = Math.floor(Number(duration));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  /**
   * 格式化语音时长（微信风格，如 "5''"）
   */
  const formatVoiceDuration = (duration?: number) => {
    if (!duration) return "0''";
    const seconds = Math.floor(duration);
    return `${seconds}''`;
  };

  /**
   * 收起转写文字
   */
  const handleCollapseTranscription = (recordId: string) => {
    setTranscriptions((prev) => {
      const newTranscriptions = { ...prev };
      delete newTranscriptions[recordId];
      return newTranscriptions;
    });
    closeContextMenu();
  };

  /**
   * 打开电话详情弹窗
   */
  const handleOpenPhoneDetail = async (record: CommunicationRecord) => {
    setPhoneDetailModal({
      visible: true,
      record,
      loading: true,
      transcription: undefined,
    });

    try {
      const result = await fetchRecordTranscription({
        recordId: record.recordId,
        recordType: record.recordType || "PHONE",
      });

      const responseData = result?.data;
      if (!responseData) {
        throw new Error("响应数据为空");
      }

      const transcriptionData = responseData.data;
      if (!transcriptionData) {
        throw new Error("转写数据为空");
      }

      const transcriptionText = transcriptionData.transcription;

      setPhoneDetailModal((prev) => ({
        ...prev,
        loading: false,
        transcription:
          transcriptionText === null || transcriptionText === undefined
            ? "转成文本内容为空"
            : typeof transcriptionText === "string" && transcriptionText.trim()
            ? transcriptionText
            : "转成文本内容为空",
      }));
    } catch (error) {
      console.error("获取电话转写失败:", error);
      setPhoneDetailModal((prev) => ({
        ...prev,
        loading: false,
        transcription: "获取转写内容失败",
      }));
      message.error("获取转写内容失败，请稍后重试");
    }
  };

  /**
   * 关闭电话详情弹窗
   */
  const handleClosePhoneDetail = () => {
    // 停止播放（如果有）
    const recordId = phoneDetailModal.record?.recordId;
    if (recordId && playingAudioId === recordId) {
      // 停止 AMR 播放器
      if (amrPlayerRef.current) {
        amrPlayerRef.current.stop();
        amrPlayerRef.current = null;
      }
      // 停止普通音频播放器
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingAudioId(null);
      setIsAudioPlaying(false);
    }

    setPhoneDetailModal({
      visible: false,
      loading: false,
      isPlaying: false,
    });
  };

  /**
   * 处理语音转文字
   */
  const handleTranscription = async (recordId: string, recordType: string) => {
    // 如果正在转写中，不重复请求
    if (transcribing === recordId) {
      return;
    }

    try {
      setTranscribing(recordId);
      const result = await fetchRecordTranscription({ recordId, recordType });

      // 接口返回的数据结构为 BaseResponse<RecordTranscriptionResponse>
      // 需要访问 result.data.data.transcription
      const responseData = result?.data;
      if (!responseData) {
        throw new Error("响应数据为空");
      }

      const transcriptionData = responseData.data;
      if (!transcriptionData) {
        throw new Error("转写数据为空");
      }

      const transcriptionText = transcriptionData.transcription;

      // 检查 transcription 是否为 null 或空字符串
      if (transcriptionText === null || transcriptionText === undefined) {
        message.warning({ content: "转成文本内容为空", key: "transcription" });
        return;
      }

      if (typeof transcriptionText === "string" && transcriptionText.trim()) {
        setTranscriptions((prev) => ({
          ...prev,
          [recordId]: transcriptionText,
        }));
      } else {
        message.warning({ content: "转成文本内容为空", key: "transcription" });
      }
    } catch (error) {
      console.error("语音转文字失败:", error);
      message.error({ content: "转写失败，请稍后重试", key: "transcription" });
    } finally {
      setTranscribing(null);
    }
  };

  /**
   * 处理语音气泡右键点击
   */
  const handleVoiceContextMenu = (
    e: React.MouseEvent,
    recordId: string,
    recordType: string
  ) => {
    e.preventDefault(); // 阻止默认右键菜单
    e.stopPropagation(); // 阻止事件冒泡

    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
      recordId,
      recordType,
    });
  };

  /**
   * 处理长按开始
   */
  const handleLongPressStart = (
    e: React.TouchEvent | React.MouseEvent,
    recordId: string,
    recordType: string
  ) => {
    // 清除之前的定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // 设置长按定时器（500ms）
    longPressTimerRef.current = setTimeout(() => {
      // 获取触摸或鼠标位置
      let x = 0;
      let y = 0;

      if ("touches" in e && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else if ("clientX" in e) {
        x = e.clientX;
        y = e.clientY;
      }

      setContextMenu({
        visible: true,
        position: { x, y },
        recordId,
        recordType,
      });
    }, 500); // 长按 500 毫秒触发
  };

  /**
   * 处理长按结束/取消
   */
  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  /**
   * 关闭右键菜单
   */
  const closeContextMenu = () => {
    setContextMenu({
      ...contextMenu,
      visible: false,
    });
  };

  /**
   * 检查是否为微信语音文件（仅通过文件扩展名判断silk格式）
   */
  const isWeChatVoice = (url: string) => {
    return url.endsWith(".silk") || url.endsWith(".amr");
  };

  /**
   * 检查是否为 AMR 格式
   */
  const isAMRFormat = (url: string) => {
    return url.toLowerCase().endsWith(".amr");
  };

  /**
   * 检查是否为 SILK 格式（目前不支持）
   */
  const isSILKFormat = (url: string) => {
    return url.toLowerCase().endsWith(".silk");
  };

  /**
   * 停止所有正在播放的音频（AMR 和普通音频）
   */
  const stopAllAudio = () => {
    // 停止 AMR 播放器
    if (amrPlayerRef.current) {
      try {
        amrPlayerRef.current.stop();
      } catch (error) {
        console.error("停止 AMR 播放器失败:", error);
      }
      amrPlayerRef.current = null;
    }

    // 停止普通音频播放器
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // 停止 iframe 中的音频播放器（直接检查 DOM 引用，不依赖状态）
    if (iframeRef.current?.contentWindow) {
      try {
        // 向 iframe 发送暂停消息
        iframeRef.current.contentWindow.postMessage(
          { type: "control-audio", action: "pause" },
          "*"
        );
      } catch (error) {
        console.error("停止 iframe 音频播放器失败:", error);
      }
      // 关闭 iframe（内联逻辑，避免函数定义顺序问题）
      // 使用函数式更新，确保获取最新的状态
      setAudioPlayerIframe((prev) => {
        if (prev.url) {
          URL.revokeObjectURL(prev.url);
        }
        return {
          visible: false,
          url: "",
          isPlaying: false,
        };
      });
    }

    // 重置播放状态
    setPlayingAudioId(null);
    setIsAudioPlaying(false);
  };

  /**
   * 播放 AMR 音频
   */
  const playAMRAudio = async (audioUrl: string, recordId: string) => {
    try {
      // 停止所有正在播放的音频
      stopAllAudio();

      console.log("开始加载 AMR 音频:", audioUrl);

      // 初始化 AMR 播放器
      const amr = new BenzAMRRecorder();
      amrPlayerRef.current = amr;

      // 初始化播放器
      await amr.initWithUrl(audioUrl);
      console.log("AMR 音频加载成功");

      // 设置播放状态
      setPlayingAudioId(recordId);
      setIsAudioPlaying(true);

      // 播放音频
      amr.play();

      // 监听播放结束
      amr.onEnded(() => {
        console.log("AMR 音频播放结束");
        setPlayingAudioId(null);
        setIsAudioPlaying(false);
        amrPlayerRef.current = null;
      });
    } catch (error) {
      console.error("AMR 音频播放失败:", error);
      setPlayingAudioId(null);
      setIsAudioPlaying(false);
      message.error({
        content: (
          <div>
            <div>AMR 音频播放失败</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <a
                href={audioUrl}
                download
                onClick={(e) => e.stopPropagation()}
                style={{ color: "#1890ff", textDecoration: "underline" }}
              >
                点击下载音频文件
              </a>
            </div>
          </div>
        ),
        duration: 5,
      });
    }
  };

  /**
   * 暂停/恢复 AMR 音频
   */
  const toggleAMRAudio = () => {
    if (amrPlayerRef.current) {
      const amr = amrPlayerRef.current;
      if (isAudioPlaying) {
        amr.pause();
        setIsAudioPlaying(false);
      } else {
        amr.play();
        setIsAudioPlaying(true);
      }
    }
  };

  /**
   * 播放/暂停音频
   */
  const handleAudioPlay = (recordId: string) => {
    // 查找对应的记录
    const record = records.find((r) => r.recordId === recordId);
    if (!record) return;

    // 获取音频URL（优先使用recordUrl，其次使用callFileUrl、url）
    const audioUrl = record.recordUrl || record.callFileUrl || record.url;
    if (!audioUrl) {
      message.warning("语音文件链接不存在");
      return;
    }

    console.log("准备播放音频:", audioUrl);

    // 检查是否为 SILK 格式（目前不支持）
    if (isSILKFormat(audioUrl)) {
      message.info({
        content: (
          <div>
            <div>SILK 格式暂不支持在线播放</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <a
                href={audioUrl}
                download
                onClick={(e) => e.stopPropagation()}
                style={{ color: "#1890ff", textDecoration: "underline" }}
              >
                点击下载语音文件
              </a>
            </div>
          </div>
        ),
        duration: 5,
      });
      return;
    }

    // 如果是 AMR 格式，使用 AMR 播放器
    if (isAMRFormat(audioUrl)) {
      if (playingAudioId === recordId) {
        // 切换暂停/播放
        toggleAMRAudio();
      } else {
        // 播放新的 AMR 音频
        playAMRAudio(audioUrl, recordId);
      }
      return;
    }

    // 处理普通音频格式（MP3, WAV 等）
    const audio = audioRef.current;
    if (!audio) return;

    if (playingAudioId === recordId) {
      // 如果是当前正在播放的音频，暂停
      if (!audio.paused) {
        audio.pause();
        setIsAudioPlaying(false);
      } else {
        // 如果是暂停状态，继续播放
        audio.play()
          .then(() => {
            setIsAudioPlaying(true);
          })
          .catch((err) => {
            console.error("播放失败:", err);
            setIsAudioPlaying(false);
            // 检查是否是格式错误
            // MEDIA_ERR_SRC_NOT_SUPPORTED = 4
            if (audio.error && audio.error.code === 4) {
              setPlayingAudioId(null);
              showAudioErrorMessage(audioUrl);
            } else {
              // 其他错误（如自动播放策略）不显示错误提示
              console.log("播放被阻止或失败，但不是格式错误:", err);
            }
          });
      }
    } else {
      // 停止所有正在播放的音频（包括 AMR 和普通音频）
      stopAllAudio();

      // 播放新音频
      audio.currentTime = 0; // 重置播放位置

      // 清除该音频 URL 的错误标记，允许重试
      errorHandledUrlsRef.current.delete(audioUrl);

      // 设置新的音频源
      audio.src = audioUrl;

      // 设置音频属性以支持低质量音频
      audio.preload = "auto";

      // 加载音频
      audio.load();

      // 尝试播放
      setPlayingAudioId(recordId);

      // 等待音频加载
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 播放成功
            console.log("播放成功");
            setIsAudioPlaying(true);
          })
          .catch((err) => {
            console.error("播放失败:", err);
            // 延迟检查错误，给音频一些加载时间
            setTimeout(() => {
              // MEDIA_ERR_SRC_NOT_SUPPORTED = 4: 格式不支持
              // MEDIA_ERR_DECODE = 3: 解码错误
              if (audio.error && audio.error.code === 4) {
                // 格式不支持错误
                console.error("音频格式不支持:", audio.error);
                setPlayingAudioId(null);
                showAudioErrorMessage(audioUrl);
              } else if (audio.error && audio.error.code === 3) {
                // 解码错误
                console.error("音频解码错误:", audio.error);
                setPlayingAudioId(null);
                showAudioErrorMessage(audioUrl);
              } else {
                // 可能是自动播放策略或其他非格式问题，不显示错误
                console.log("播放被阻止，但不是格式错误");
              }
            }, 500);
          });
      }
    }

    // 更新通话详情弹窗的播放状态（如果当前播放的是通话详情中的音频）
    if (phoneDetailModal.visible && phoneDetailModal.record?.recordId === recordId) {
      // 延迟更新，等待播放状态稳定
      setTimeout(() => {
        setPhoneDetailModal((prev) => ({
          ...prev,
          isPlaying: playingAudioId === recordId && isAudioPlaying,
        }));
      }, 100);
    }
  };

  /**
   * 处理通话详情弹窗中的音频播放/暂停
   */
  const handlePhoneDetailAudioPlay = () => {
    if (!phoneDetailModal.record) return;

    const recordId = phoneDetailModal.record.recordId;

    // 检查当前是否正在播放该音频
    const isCurrentlyPlaying =
      (playingAudioId === recordId && isAudioPlaying) ||
      (audioPlayerIframe.visible &&
        audioPlayerIframe.record?.recordId === recordId &&
        audioPlayerIframe.isPlaying);

    // 如果当前正在播放该音频，则暂停
    if (isCurrentlyPlaying) {
      // 暂停 AMR 播放器
      if (amrPlayerRef.current && playingAudioId === recordId) {
        amrPlayerRef.current.pause();
        setIsAudioPlaying(false);
        setPhoneDetailModal((prev) => ({ ...prev, isPlaying: false }));
      }
      // 暂停普通音频播放器
      else if (audioRef.current && playingAudioId === recordId && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
        setPhoneDetailModal((prev) => ({ ...prev, isPlaying: false }));
      }
      // 暂停 iframe 中的音频（通过 postMessage）
      else if (audioPlayerIframe.visible && audioPlayerIframe.record?.recordId === recordId) {
        // 向 iframe 发送暂停消息
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            { type: "control-audio", action: "pause" },
            "*"
          );
        }
        setAudioPlayerIframe((prev) => ({ ...prev, isPlaying: false }));
        setPhoneDetailModal((prev) => ({ ...prev, isPlaying: false }));
      }
    } else {
      // 播放音频
      handleAudioPlay(recordId);
      // 延迟更新通话详情播放状态，等待播放开始
      setTimeout(() => {
        setPhoneDetailModal((prev) => ({
          ...prev,
          isPlaying:
            playingAudioId === recordId ||
            (audioPlayerIframe.visible &&
              audioPlayerIframe.record?.recordId === recordId),
        }));
      }, 200);
    }
  };

  /**
   * 创建音频播放器 HTML 内容并返回 Blob URL
   */
  const createAudioPlayerHtml = (
    audioUrl: string,
    record?: CommunicationRecord
  ): string => {
    // 转义 HTML 内容，防止 XSS
    const escapeHtml = (str: string) => {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    };

    // 转义 URL，用于 HTML 属性
    const escapeUrl = (url: string) => {
      return url
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };

    // 转义 JavaScript 字符串中的特殊字符
    const escapeJsString = (str: string) => {
      return str
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");
    };

    // 规范化 URL，确保有协议前缀
    const normalizeUrl = (url: string): string => {
      if (!url || typeof url !== "string") {
        return url;
      }
      const trimmedUrl = url.trim();
      // 如果 URL 不以 http:// 或 https:// 开头，添加 https://
      if (trimmedUrl && !trimmedUrl.match(/^https?:\/\//i)) {
        return `https://${trimmedUrl}`;
      }
      return trimmedUrl;
    };

    const normalizedAudioUrl = normalizeUrl(audioUrl);
    const senderName = escapeHtml(record?.senderName || "未知");
    const messageTime = record?.messageTime
      ? escapeHtml(new Date(record.messageTime).toLocaleString("zh-CN"))
      : "";
    const duration = record?.callDuration
      ? escapeHtml(`${Math.floor(record.callDuration / 1000)}秒`)
      : "";
    const escapedAudioUrl = escapeUrl(normalizedAudioUrl);
    const escapedJsAudioUrl = escapeJsString(normalizedAudioUrl);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>语音播放 - ${senderName}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .icon {
            font-size: 24px;
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
            font-size: 14px;
          }
          .info-item strong {
            color: #374151;
            display: inline-block;
            min-width: 80px;
          }
          audio {
            display: none;
          }
          .custom-player {
            margin-top: 20px;
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
          }
          .player-controls {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
          }
          .play-btn {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #1890ff;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
          }
          .play-btn:hover {
            background: #40a9ff;
            transform: scale(1.05);
          }
          .play-btn:active {
            transform: scale(0.95);
          }
          .time-display {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #6b7280;
            font-size: 14px;
            font-variant-numeric: tabular-nums;
            min-width: 110px;
          }
          .progress-container {
            flex: 1;
            position: relative;
            height: 40px;
            display: flex;
            align-items: center;
            min-width: 200px;
            padding: 0 10px;
          }
          .progress-bar {
            position: relative;
            width: 100%;
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            cursor: pointer;
            transition: height 0.2s ease;
            min-height: 6px;
            display: block;
            box-sizing: border-box;
            overflow: visible;
          }
          .progress-bar:hover {
            height: 8px;
          }
          .progress-filled {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 0%;
            background: #1890ff;
            border-radius: 3px;
            pointer-events: none;
            transition: width 0.1s linear;
            min-width: 0;
          }
          .progress-handle {
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 16px;
            height: 16px;
            background: white;
            border: 2px solid #1890ff;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s ease, transform 0.2s ease;
            pointer-events: none;
          }
          .progress-bar:hover .progress-handle {
            opacity: 1;
          }
          .progress-handle.active {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
          }
          .volume-control {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 120px;
          }
          .volume-icon {
            color: #6b7280;
            font-size: 18px;
            cursor: pointer;
          }
          .volume-slider {
            flex: 1;
            height: 4px;
            border-radius: 2px;
            background: #e5e7eb;
            cursor: pointer;
            position: relative;
          }
          .volume-filled {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: #1890ff;
            border-radius: 2px;
            pointer-events: none;
          }
          .error-message {
            margin-top: 15px;
            padding: 12px;
            background: #fef2f2;
            border-left: 3px solid #ef4444;
            border-radius: 4px;
            font-size: 13px;
            color: #991b1b;
            display: none;
          }
          .error-message.show {
            display: block;
          }
          .tip {
            margin-top: 15px;
            padding: 10px;
            background: #fffbeb;
            border-left: 3px solid #f59e0b;
            border-radius: 4px;
            font-size: 13px;
            color: #92400e;
          }
          .download-link {
            display: inline-block;
            margin-top: 10px;
            color: #1890ff;
            text-decoration: underline;
            cursor: pointer;
          }
          .download-link:hover {
            color: #40a9ff;
          }

          /* 响应式设计 */
          @media (max-width: 768px) {
            .container {
              padding: 20px;
            }
            .player-controls {
              flex-wrap: wrap;
              gap: 10px;
            }
            .time-display {
              min-width: 90px;
              font-size: 12px;
            }
            .volume-control {
              width: 100%;
              order: 1;
            }
            .progress-container {
              width: 100%;
              order: 0;
            }
          }

          /* 深色模式支持 */
          @media (prefers-color-scheme: dark) {
            body {
              background: #1f2937;
            }
            .container {
              background: #111827;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            h2 {
              color: #f9fafb;
            }
            .info {
              background: #1f2937;
            }
            .info-item {
              color: #9ca3af;
            }
            .info-item strong {
              color: #f3f4f6;
            }
            .custom-player {
              background: #1f2937;
            }
            .progress-bar {
              background: #374151;
            }
            .volume-slider {
              background: #374151;
            }
            .time-display {
              color: #9ca3af;
            }
            .tip {
              background: #374151;
              border-left-color: #f59e0b;
              color: #fbbf24;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>
            <span class="icon">🎵</span>
            语音播放
          </h2>
          <div class="info">
            ${
              senderName
                ? `<div class="info-item"><strong>发送者：</strong>${senderName}</div>`
                : ""
            }
            ${
              messageTime
                ? `<div class="info-item"><strong>时间：</strong>${messageTime}</div>`
                : ""
            }
            ${
              duration
                ? `<div class="info-item"><strong>时长：</strong>${duration}</div>`
                : ""
            }
          </div>
          <div class="custom-player">
            <div class="player-controls">
              <button id="playBtn" class="play-btn" title="播放/暂停">
                <span id="playIcon">▶</span>
              </button>
              <div class="time-display">
                <span id="currentTime">00:00</span>
                <span>/</span>
                <span id="totalTime">00:00</span>
              </div>
              <div class="progress-container">
                <div id="progressBar" class="progress-bar">
                  <div id="progressFilled" class="progress-filled"></div>
                  <div id="progressHandle" class="progress-handle"></div>
                </div>
              </div>
              <div class="volume-control">
                <span id="volumeIcon" class="volume-icon" title="静音/取消静音">🔊</span>
                <div id="volumeSlider" class="volume-slider">
                  <div id="volumeFilled" class="volume-filled" style="width: 100%;"></div>
                </div>
              </div>
            </div>
          </div>
          <audio id="audioPlayer" preload="metadata">
            <source src="${escapedAudioUrl}" type="audio/mpeg">
            <source src="${escapedAudioUrl}" type="audio/mp3">
            <source src="${escapedAudioUrl}" type="audio/wav">
            <source src="${escapedAudioUrl}" type="audio/ogg">
            <source src="${escapedAudioUrl}">
            您的浏览器不支持音频播放。
          </audio>
          <div id="errorMessage" class="error-message"></div>
          <div class="tip">
            💡 提示：如果无法播放，请尝试<a href="${escapedAudioUrl}" download class="download-link">下载音频</a>后使用其他播放器打开。
            <br><br>
            ⌨️ 快捷键：空格-播放/暂停 | ←/→-后退/前进5秒 | ↑/↓-增加/减少音量 | M-静音
          </div>
        </div>
        <script>
          (function() {
            const audio = document.getElementById('audioPlayer');
            const errorDiv = document.getElementById('errorMessage');
            const playBtn = document.getElementById('playBtn');
            const playIcon = document.getElementById('playIcon');
            const currentTimeEl = document.getElementById('currentTime');
            const totalTimeEl = document.getElementById('totalTime');
            const progressBar = document.getElementById('progressBar');
            const progressFilled = document.getElementById('progressFilled');
            const progressHandle = document.getElementById('progressHandle');
            const volumeIcon = document.getElementById('volumeIcon');
            const volumeSlider = document.getElementById('volumeSlider');
            const volumeFilled = document.getElementById('volumeFilled');

            if (!audio) {
              console.error('找不到音频元素');
              return;
            }

            // 初始化进度条显示
            if (progressFilled) {
              progressFilled.style.width = '0%';
            }
            if (progressHandle) {
              progressHandle.style.left = '0%';
            }

            let isDragging = false;
            let isVolumeDragging = false;

            // 格式化时间
            function formatTime(seconds) {
              if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
              const mins = Math.floor(seconds / 60);
              const secs = Math.floor(seconds % 60);
              return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
            }

            // 更新进度条
            function updateProgress() {
              if (isDragging) return;
              if (!audio.duration || !isFinite(audio.duration)) {
                if (progressFilled) progressFilled.style.width = '0%';
                if (progressHandle) progressHandle.style.left = '0%';
                return;
              }
              const percent = Math.max(0, Math.min(100, (audio.currentTime / audio.duration) * 100));
              if (progressFilled) {
                progressFilled.style.width = percent + '%';
              }
              if (progressHandle) {
                progressHandle.style.left = percent + '%';
              }
              if (currentTimeEl) {
                currentTimeEl.textContent = formatTime(audio.currentTime);
              }
            }

            // 设置进度
            function setProgress(e) {
              if (!progressBar || !audio.duration || !isFinite(audio.duration)) return;
              const rect = progressBar.getBoundingClientRect();
              const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const time = percent * audio.duration;
              if (!isNaN(time) && isFinite(time)) {
                audio.currentTime = time;
                if (progressFilled) {
                  progressFilled.style.width = (percent * 100) + '%';
                }
                if (progressHandle) {
                  progressHandle.style.left = (percent * 100) + '%';
                }
              }
            }

            // 更新音量显示
            function updateVolumeDisplay() {
              const volume = audio.volume;
              volumeFilled.style.width = (volume * 100) + '%';
              if (audio.muted || volume === 0) {
                volumeIcon.textContent = '🔇';
              } else if (volume < 0.5) {
                volumeIcon.textContent = '🔉';
              } else {
                volumeIcon.textContent = '🔊';
              }
            }

            // 设置音量
            function setVolume(e) {
              const rect = volumeSlider.getBoundingClientRect();
              const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              audio.volume = percent;
              audio.muted = false;
              updateVolumeDisplay();
            }

            // 记录错误信息
            function showError(message) {
              console.error('音频播放错误:', message);
              if (errorDiv) {
                errorDiv.textContent = '❌ ' + message;
                errorDiv.classList.add('show');
              }
            }

            // 播放/暂停切换
            playBtn.addEventListener('click', function() {
              if (audio.paused) {
                audio.play().catch(function(err) {
                  showError('播放失败: ' + err.message);
                });
              } else {
                audio.pause();
              }
            });

            // 进度条点击
            progressBar.addEventListener('click', setProgress);

            // 进度条拖动
            progressBar.addEventListener('mousedown', function(e) {
              isDragging = true;
              progressHandle.classList.add('active');
              setProgress(e);
            });

            document.addEventListener('mousemove', function(e) {
              if (isDragging) {
                setProgress(e);
              }
            });

            document.addEventListener('mouseup', function() {
              if (isDragging) {
                isDragging = false;
                progressHandle.classList.remove('active');
              }
            });

            // 音量图标点击切换静音
            volumeIcon.addEventListener('click', function() {
              audio.muted = !audio.muted;
              updateVolumeDisplay();
            });

            // 音量滑块点击
            volumeSlider.addEventListener('click', setVolume);

            // 音量滑块拖动
            volumeSlider.addEventListener('mousedown', function(e) {
              isVolumeDragging = true;
              setVolume(e);
            });

            document.addEventListener('mousemove', function(e) {
              if (isVolumeDragging) {
                setVolume(e);
              }
            });

            document.addEventListener('mouseup', function() {
              if (isVolumeDragging) {
                isVolumeDragging = false;
              }
            });

            // 音频事件监听
            audio.addEventListener('play', function() {
              playIcon.textContent = '⏸';
            });

            audio.addEventListener('pause', function() {
              playIcon.textContent = '▶';
            });

            audio.addEventListener('timeupdate', updateProgress);

            audio.addEventListener('loadedmetadata', function() {
              if (totalTimeEl) {
                totalTimeEl.textContent = formatTime(audio.duration);
              }
              updateVolumeDisplay();
              // 初始化进度条
              updateProgress();
            });

            audio.addEventListener('ended', function() {
              playIcon.textContent = '▶';
              audio.currentTime = 0;
              updateProgress();
            });

            // 监听音频事件
            audio.addEventListener('loadstart', function() {
              console.log('开始加载音频:', '${escapedJsAudioUrl}');
            });

            audio.addEventListener('canplay', function() {
              console.log('音频可以播放');
              if (errorDiv) {
                errorDiv.classList.remove('show');
              }
            });

            audio.addEventListener('error', function(e) {
              const error = audio.error;
              let errorMsg = '未知错误';

              if (error) {
                switch(error.code) {
                  case MediaError.MEDIA_ERR_ABORTED:
                    errorMsg = '用户中止了音频加载';
                    break;
                  case MediaError.MEDIA_ERR_NETWORK:
                    errorMsg = '网络错误，请检查网络连接';
                    break;
                  case MediaError.MEDIA_ERR_DECODE:
                    errorMsg = '音频解码失败，格式可能不支持';
                    break;
                  case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMsg = '音频格式不支持或源文件无法访问';
                    break;
                  default:
                    errorMsg = '播放失败（错误代码: ' + error.code + '）';
                }
              } else {
                errorMsg = '音频加载失败，请检查 URL 是否正确';
              }

              showError(errorMsg);
              console.error('音频错误详情:', error);
            });

            audio.addEventListener('loadend', function() {
              console.log('音频加载完成，readyState:', audio.readyState);
              if (audio.readyState === 0) {
                showError('音频无法加载，可能是网络问题或格式不支持');
              }
            });

            // 监听播放结束，自动关闭
            audio.addEventListener('ended', function() {
              console.log('音频播放结束');
              // 通知父窗口关闭 iframe（如果父窗口有对应的方法）
              try {
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ type: 'audio-ended' }, '*');
                }
              } catch (e) {
                console.log('无法通知父窗口:', e);
              }
            });

            // 监听播放状态变化，通知父窗口
            audio.addEventListener('play', function() {
              try {
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ type: 'audio-playing' }, '*');
                }
              } catch (e) {
                console.log('无法通知父窗口:', e);
              }
            });

            audio.addEventListener('pause', function() {
              try {
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ type: 'audio-paused' }, '*');
                }
              } catch (e) {
                console.log('无法通知父窗口:', e);
              }
            });

            // 监听来自父窗口的消息
            window.addEventListener('message', function(event) {
              // 注意：生产环境应该验证 event.origin
              if (event.data && event.data.type === 'control-audio') {
                const action = event.data.action;
                if (action === 'play') {
                  audio.play().catch(function(error) {
                    console.log('播放失败:', error);
                  });
                } else if (action === 'pause') {
                  audio.pause();
                } else if (action === 'seek' && typeof event.data.time === 'number') {
                  audio.currentTime = event.data.time;
                } else if (action === 'setVolume' && typeof event.data.volume === 'number') {
                  audio.volume = Math.max(0, Math.min(1, event.data.volume));
                  updateVolumeDisplay();
                }
              }
            });

            // 键盘快捷键
            document.addEventListener('keydown', function(e) {
              // 空格键：播放/暂停
              if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
                playBtn.click();
              }
              // 左箭头：后退5秒
              else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                audio.currentTime = Math.max(0, audio.currentTime - 5);
              }
              // 右箭头：前进5秒
              else if (e.code === 'ArrowRight') {
                e.preventDefault();
                audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
              }
              // 上箭头：增加音量
              else if (e.code === 'ArrowUp') {
                e.preventDefault();
                audio.volume = Math.min(1, audio.volume + 0.1);
                audio.muted = false;
                updateVolumeDisplay();
              }
              // 下箭头：减少音量
              else if (e.code === 'ArrowDown') {
                e.preventDefault();
                audio.volume = Math.max(0, audio.volume - 0.1);
                updateVolumeDisplay();
              }
              // M键：静音/取消静音
              else if (e.code === 'KeyM') {
                e.preventDefault();
                volumeIcon.click();
              }
            });

            // 尝试自动播放（如果浏览器允许）
            function tryAutoPlay() {
              if (audio) {
                audio.play()
                  .then(function() {
                    console.log('自动播放成功');
                  })
                  .catch(function(error) {
                    console.log('自动播放被阻止（这是正常的）:', error.message);
                  });
              }
            }

            // 如果 DOM 已加载，立即尝试播放；否则等待 DOMContentLoaded
            if (document.readyState === 'loading') {
              window.addEventListener('DOMContentLoaded', tryAutoPlay);
            } else {
              // DOM 已加载完成，立即尝试播放
              setTimeout(tryAutoPlay, 100);
            }
          })();
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    return URL.createObjectURL(blob);
  };

  /**
   * 关闭 iframe 音频播放器
   */
  const closeAudioPlayerIframe = () => {
    if (audioPlayerIframe.url) {
      URL.revokeObjectURL(audioPlayerIframe.url);
    }
    setAudioPlayerIframe({
      visible: false,
      url: "",
      isPlaying: false,
    });
  };

  /**
   * 控制 iframe 音频播放/暂停
   */
  const toggleIframeAudio = () => {
    if (!iframeRef.current) return;

    const action = audioPlayerIframe.isPlaying ? "pause" : "play";

    // 发送消息到 iframe
    iframeRef.current.contentWindow?.postMessage(
      {
        type: "control-audio",
        action: action,
      },
      "*"
    );
  };


  /**
   * 显示音频错误提示并在 iframe 中播放
   */
  const showAudioErrorMessage = (audioUrl: string) => {
    // 防止重复处理同一个音频 URL
    if (errorHandledUrlsRef.current.has(audioUrl)) {
      console.log("该音频错误已处理，跳过重复打开窗口:", audioUrl);
      return;
    }

    // 标记为已处理
    errorHandledUrlsRef.current.add(audioUrl);

    // 3秒后清除标记，允许重试
    setTimeout(() => {
      errorHandledUrlsRef.current.delete(audioUrl);
    }, 3000);

    // 先停止所有正在播放的音频（包括关闭旧的 iframe）
    stopAllAudio();

    // 查找对应的记录
    const record = records.find(
      (r) =>
        r.recordUrl === audioUrl ||
        r.callFileUrl === audioUrl ||
        r.url === audioUrl
    );

    // 创建音频播放器 HTML 并显示在 iframe 中
    const blobUrl = createAudioPlayerHtml(audioUrl, record);

    // 设置当前播放的音频 ID（用于状态同步）
    if (record?.recordId) {
      setPlayingAudioId(record.recordId);
    }

    setAudioPlayerIframe({
      visible: true,
      url: blobUrl,
      record,
      isPlaying: false,
    });

    // 如果是通话详情弹窗中的音频，更新播放状态
    if (
      phoneDetailModal.visible &&
      phoneDetailModal.record &&
      (record?.recordId === phoneDetailModal.record.recordId ||
        audioUrl === phoneDetailModal.record.recordUrl ||
        audioUrl === phoneDetailModal.record.callFileUrl ||
        audioUrl === phoneDetailModal.record.url)
    ) {
      // iframe 会自动播放，所以设置为 true
      setPhoneDetailModal((prev) => ({ ...prev, isPlaying: true }));
    }
  };

  /**
   * 监听音频播放状态
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => {
        setPlayingAudioId((currentId) => {
          setPhoneDetailModal((prev) => {
            if (prev.visible && prev.record?.recordId === currentId) {
              return { ...prev, isPlaying: false };
            }
            return prev;
          });
          return null;
        });
        setIsAudioPlaying(false);
      };

      const handlePlay = () => {
        setIsAudioPlaying(true);
        setPhoneDetailModal((prev) => {
          if (prev.visible && prev.record) {
            // 检查当前播放的音频是否是通话详情中的音频
            const currentRecordId = audio.src
              ? records.find(
                  (r) =>
                    r.recordUrl === audio.src ||
                    r.callFileUrl === audio.src ||
                    r.url === audio.src
                )?.recordId
              : null;
            if (currentRecordId === prev.record.recordId) {
              return { ...prev, isPlaying: true };
            }
          }
          return prev;
        });
      };

      const handlePause = () => {
        setIsAudioPlaying(false);
        setPhoneDetailModal((prev) => {
          if (prev.visible && prev.record) {
            // 检查当前暂停的音频是否是通话详情中的音频
            const currentRecordId = audio.src
              ? records.find(
                  (r) =>
                    r.recordUrl === audio.src ||
                    r.callFileUrl === audio.src ||
                    r.url === audio.src
                )?.recordId
              : null;
            if (currentRecordId === prev.record.recordId) {
              return { ...prev, isPlaying: false };
            }
          }
          return prev;
        });
      };

      const handleError = (e: Event) => {
        console.error("音频加载失败:", e);
        const currentSrc = audio.src;

        // 只有在有音频源的情况下才显示错误
        if (currentSrc && playingAudioId) {
          const target = e.target as HTMLAudioElement;

          // 检查错误类型，只有真正的格式错误才显示错误提示
          if (target.error) {
            const errorCode = target.error.code;
            const errorMessage = target.error.message;

            console.error("错误代码:", errorCode);
            console.error("错误信息:", errorMessage);

            // MEDIA_ERR_SRC_NOT_SUPPORTED = 4: 格式不支持
            // MEDIA_ERR_DECODE = 3: 解码错误
            // 其他错误可能是网络问题等，不显示错误提示
            if (errorCode === 4 || errorCode === 3) {
              setPlayingAudioId(null);
              setIsAudioPlaying(false);
              // 延迟一点，避免快速切换时重复显示
              setTimeout(() => {
                if (currentSrc === audio.src) {
                  showAudioErrorMessage(currentSrc);
                }
              }, 100);
            } else {
              console.log("音频错误，但不是格式问题，不显示错误提示");
            }
          }
        }
      };

      const handleLoadStart = () => {
        // 音频开始加载
      };

      const handleCanPlay = () => {
        // 音频可以播放
      };

      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("error", handleError);
      audio.addEventListener("loadstart", handleLoadStart);
      audio.addEventListener("canplay", handleCanPlay);

      return () => {
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("error", handleError);
        audio.removeEventListener("loadstart", handleLoadStart);
        audio.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, [playingAudioId, phoneDetailModal.visible, phoneDetailModal.record?.recordId, records]);

  /**
   * 监听来自 iframe 的消息，处理音频播放状态
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "audio-ended") {
        console.log("收到音频播放结束消息，关闭 iframe");
        closeAudioPlayerIframe();
        // 更新通话详情弹窗的播放状态
        setPhoneDetailModal((prev) => ({ ...prev, isPlaying: false }));
      } else if (event.data && event.data.type === "audio-playing") {
        console.log("收到音频播放中消息");
        setAudioPlayerIframe((prev) => ({
          ...prev,
          isPlaying: true,
        }));
        // 更新通话详情弹窗的播放状态
        if (phoneDetailModal.visible && audioPlayerIframe.record?.recordId === phoneDetailModal.record?.recordId) {
          setPhoneDetailModal((prev) => ({ ...prev, isPlaying: true }));
        }
      } else if (event.data && event.data.type === "audio-paused") {
        console.log("收到音频暂停消息");
        setAudioPlayerIframe((prev) => ({
          ...prev,
          isPlaying: false,
        }));
        // 更新通话详情弹窗的播放状态
        if (phoneDetailModal.visible && audioPlayerIframe.record?.recordId === phoneDetailModal.record?.recordId) {
          setPhoneDetailModal((prev) => ({ ...prev, isPlaying: false }));
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // 清理 iframe blob URL
  useEffect(() => {
    return () => {
      if (audioPlayerIframe.url) {
        URL.revokeObjectURL(audioPlayerIframe.url);
      }
    };
  }, [audioPlayerIframe.url]);

  /**
   * 组件卸载时清理播放器
   */
  useEffect(() => {
    return () => {
      // 清理普通音频播放器
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      // 清理 AMR 播放器
      if (amrPlayerRef.current) {
        try {
          amrPlayerRef.current.stop();
        } catch (e) {
          console.error("停止 AMR 播放器时出错:", e);
        }
        amrPlayerRef.current = null;
      }
    };
  }, []);

  /**
   * 自动滚动到底部（最新消息）
   */
  useEffect(() => {
    if (scrollContainerRef.current && records.length > 0) {
      // 使用 setTimeout 确保 DOM 已更新
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [records]);

  /**
   * 获取通话类型文案
   */
  const getCallTypeText = (callType?: CallType) => {
    switch (callType) {
      case 3:
        return "外呼";
      case 4:
        return "接入";
      case 5:
        return "多人通话";
      default:
        return "接待";
    }
  };

  /**
   * 渲染消息内容
   */
  const renderMessageContent = (record: CommunicationRecord) => {
    const isEmployee = record.senderType === "EMPLOYEE";

    // 电话通话记录/接待录音 - 居中显示
    if (
      record.recordType === "PHONE" ||
      record.recordType === "RECEPTION" ||
      record.recordType === "RECEPTION_AUDIO"
    ) {
      const callTypeText = getCallTypeText(record.callType);
      // 确保 callDuration 转换为数字，因为可能是字符串（已经是秒为单位）
      const totalSeconds = Number(record.callDuration) || 0;

      // 格式化时长显示
      let durationText = "0秒";
      if (totalSeconds >= 60) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        durationText =
          seconds > 0 ? `${minutes}分${seconds}秒` : `${minutes}分`;
      } else if (totalSeconds > 0) {
        durationText = `${totalSeconds}秒`;
      }

      return (
        <div className="phone-call-notice">
          <span className="phone-icon">📞</span>
          <span className="phone-text">
            {record?.senderName} 进行了{callTypeText}，时长 {durationText}
          </span>
          <button
            className="phone-detail-btn"
            onClick={() => handleOpenPhoneDetail(record)}
          >
            查看详情
          </button>
        </div>
      );
    }

    // 微信通话记录（recordType="WECHAT" && type=50）- 显示为聊天气泡样式
    if (record.recordType === "WECHAT" && record.type === 50) {
      return (
        <div
          className={`message-bubble wechat-call-bubble ${isEmployee ? "employee" : "customer"}`}
          onClick={() => handleOpenPhoneDetail(record)}
          style={{ cursor: 'pointer' }}
        >
          <PhoneOutlined className="wechat-call-icon" />
          <span className="wechat-call-text">通话时长</span>
          <span className="wechat-call-duration">
            {formatCallDurationMMSS(record.callDuration)}
          </span>
        </div>
      );
    }

    // 文本消息
    if (record.type === 1 && record.content) {
      return (
        <div
          className={`message-bubble ${isEmployee ? "employee" : "customer"}`}
        >
          <div className="message-text">{parseEmoji(record.content)}</div>
        </div>
      );
    }

    // 图片消息（type: 3）
    if (record.type === 3) {
      const isValidImageUrl =
        record.callFileUrl &&
        record.callFileUrl !== "null" &&
        typeof record.callFileUrl === "string" &&
        record.callFileUrl.trim() !== "";

      const imageUrl = record.callFileUrl || "";
      const hasFailed = failedImageUrls.has(imageUrl);

      return (
        <div className={`message-bubble image-bubble ${isEmployee ? "employee" : "customer"}`}>
          {isValidImageUrl && !hasFailed ? (
            <Image
              src={imageUrl}
              alt="图片"
              className="message-image"
              preview={{
                mask: false,
              }}
              onError={() => {
                // 图片加载失败时，添加到失败列表
                setFailedImageUrls((prev) => new Set(prev).add(imageUrl));
              }}
            />
          ) : (
            <div className="image-placeholder">
              <span>暂无图片</span>
            </div>
          )}
        </div>
      );
    }

    // 语音消息（type: 34-短语音, 50-语音通话）
    // 排除 type=3（图片）的情况
    const isVoiceMessage =
      record.type === 34 ||
      record.type === 50 ||
      ((record.callFileUrl || record.url || record.recordUrl) && (record.type as number) !== 3);

    if (isVoiceMessage) {
      // 如果是语音消息但 callFileUrl 为空（包括 null、undefined、空字符串或字符串 "null"），则不显示播放按钮
      const isCallFileUrlEmpty =
        !record.callFileUrl ||
        record.callFileUrl === "null" ||
        (typeof record.callFileUrl === "string" &&
          record.callFileUrl.trim() === "");

      const hasNoAudioUrl =
        (record.type === 34 || record.type === 50) && isCallFileUrlEmpty;

      // 获取有效的音频 URL（排除字符串 "null"）
      const getValidAudioUrl = () => {
        if (
          record.callFileUrl &&
          record.callFileUrl !== "null" &&
          typeof record.callFileUrl === "string" &&
          record.callFileUrl.trim() !== ""
        ) {
          return record.callFileUrl;
        }
        if (
          record.url &&
          record.url !== "null" &&
          typeof record.url === "string" &&
          record.url.trim() !== ""
        ) {
          return record.url;
        }
        if (
          record.recordUrl &&
          record.recordUrl !== "null" &&
          typeof record.recordUrl === "string" &&
          record.recordUrl.trim() !== ""
        ) {
          return record.recordUrl;
        }
        return "";
      };

      const audioUrl = getValidAudioUrl();
      const isCurrentAudio = playingAudioId === record.recordId;
      const showPauseIcon = isCurrentAudio && isAudioPlaying;
      const isWeChatAudio = isWeChatVoice(audioUrl);
      const transcription = transcriptions[record.recordId];
      const isTranscribing = transcribing === record.recordId;

      return (
        <div className="voice-message-wrapper">
          <div
            className={`message-bubble voice-bubble ${
              isEmployee ? "employee" : "customer"
            } ${isCurrentAudio ? "active" : ""} ${
              isWeChatAudio ? "wechat-voice" : ""
            } ${hasNoAudioUrl ? "no-audio" : ""}`}
            onClick={
              hasNoAudioUrl ? undefined : () => handleAudioPlay(record.recordId)
            }
            onContextMenu={
              hasNoAudioUrl
                ? undefined
                : (e) =>
                    handleVoiceContextMenu(
                      e,
                      record.recordId,
                      record.recordType || "PHONE"
                    )
            }
            onMouseDown={
              hasNoAudioUrl
                ? undefined
                : (e) =>
                    handleLongPressStart(
                      e,
                      record.recordId,
                      record.recordType || "PHONE"
                    )
            }
            onMouseUp={hasNoAudioUrl ? undefined : handleLongPressEnd}
            onMouseLeave={hasNoAudioUrl ? undefined : handleLongPressEnd}
            onTouchStart={
              hasNoAudioUrl
                ? undefined
                : (e) =>
                    handleLongPressStart(
                      e,
                      record.recordId,
                      record.recordType || "PHONE"
                    )
            }
            onTouchEnd={hasNoAudioUrl ? undefined : handleLongPressEnd}
            onTouchCancel={hasNoAudioUrl ? undefined : handleLongPressEnd}
            title={
              hasNoAudioUrl
                ? undefined
                : isWeChatAudio
                ? "微信语音（右键转文字）"
                : "点击播放（右键转文字）"
            }
          >
            <span className="voice-duration">
              {formatVoiceDuration(record.callDuration)}
            </span>
            {!hasNoAudioUrl && (
              <>
                {showPauseIcon ? (
                  <VoicePauseIcon className="voice-icon" />
                ) : (
                  <img src={ isEmployee ? chatIcon : darkIcon} alt="播放" className="voice-icon" />
                )}
              </>
            )}
            {!hasNoAudioUrl && isWeChatAudio && (
              <span className="wechat-badge">微信</span>
            )}
          </div>

          {/* 转写文本显示 */}
          {(isTranscribing || transcription) && (
            <div
              className={`transcription-text ${
                isEmployee ? "employee" : "customer"
              } ${isTranscribing ? "loading" : ""}`}
            >
              {isTranscribing ? (
                <div className="transcription-loading">
                  <div className="custom-spinner"></div>
                </div>
              ) : (
                <>
                  {typeof transcription === "string"
                    ? transcription.split("\n").map((line, index, array) => (
                        <span key={index}>
                          {line}
                          {index < array.length - 1 && <br />}
                        </span>
                      ))
                    : String(transcription)}
                </>
              )}
            </div>
          )}
        </div>
      );
    }

    // 电话记录
    if (record.callType) {
      return (
        <div className="message-bubble system-bubble">
          <PhoneOutlined className="phone-icon" />
          <span>
            {getCallTypeText(record.callType)} ·{" "}
            {formatCallDuration(record.callDuration)}
          </span>
          {record.recordUrl && (
            <img
              src={chatIcon}
              alt="播放"
              className="play-icon"
              onClick={() => handleAudioPlay(record.recordId)}
            />
          )}
        </div>
      );
    }

    // 其他类型消息
    if (record.content) {
      return (
        <div
          className={`message-bubble ${isEmployee ? "employee" : "customer"}`}
        >
          <div className="message-text">{record.content}</div>
        </div>
      );
    }

    return null;
  };

  /**
   * 按日期分组记录
   */
  const groupedRecords = records.reduce((groups, record) => {
    const date = record.bizDate || record.messageTime.split(" ")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as Record<string, CommunicationRecord[]>);

  // 对每个日期组内的记录按时间升序排序（最早的在前面，最新的在后面）
  Object.keys(groupedRecords).forEach((date) => {
    groupedRecords[date].sort((a, b) => {
      const timeA = new Date(a.messageTime).getTime();
      const timeB = new Date(b.messageTime).getTime();
      return timeA - timeB; // 升序：最早的在前面
    });
  });

  // 按日期升序排序（最早的日期在前面，最新的日期在后面）
  const sortedDates = Object.keys(groupedRecords).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // 构建右键菜单项
  const contextMenuItems: ContextMenuItem[] = [
    {
      key: "transcription",
      label: transcriptions[contextMenu.recordId]
        ? "收起文字"
        : transcribing === contextMenu.recordId
        ? "转写中..."
        : "语音转文字",
      disabled: transcribing === contextMenu.recordId,
      onClick: () => {
        if (contextMenu.recordId) {
          if (transcriptions[contextMenu.recordId]) {
            // 如果已转写，点击收起
            handleCollapseTranscription(contextMenu.recordId);
          } else {
            // 如果未转写，点击转写
            handleTranscription(contextMenu.recordId, contextMenu.recordType);
          }
        }
      },
    },
  ];

  return (
    <div className={`communication-records ${themeMode} ${records.length === 0 ? 'empty' : ''}`}>
      <audio ref={audioRef} style={{ display: "none" }} preload="metadata" />

      {records.length === 0 ? (
        <EmptyState title="暂无沟通记录" fullHeight={true} />
      ) : (
        <div className="records-container" ref={scrollContainerRef}>
          {sortedDates.map((date) => (
            <div key={date} className="date-group">
              <div className="date-divider">
                <span className="date-text">{date}</span>
              </div>

              {groupedRecords[date].map((record) => {
                const isEmployee = record.senderType === "EMPLOYEE";
                const isPhoneCall =
                  record.recordType === "PHONE" ||
                  record.recordType === "RECEPTION" ||
                  record.recordType === "RECEPTION_AUDIO";

                // 电话通话记录/接待录音 - 居中显示，不需要头像
                if (isPhoneCall) {
                  return (
                    <div
                      key={record.recordId}
                      className="message-item phone-call-item"
                    >
                      {renderMessageContent(record)}
                    </div>
                  );
                }

                // 普通消息 - 左右对齐，带头像
                return (
                  <div
                    key={record.recordId}
                    className={`message-item ${
                      isEmployee ? "employee-message" : "customer-message"
                    }`}
                  >
                    <div className="message-avatar">
                      {(() => {
                        // 获取头像URL，如果是 RECEPTION_AUDIO 且没有头像，尝试从其他文本消息获取
                        const avatarUrl = getFallbackAvatar(record);
                        return isValidAvatarUrl(avatarUrl) ? (
                          <img
                            src={avatarUrl}
                            alt={record.senderName}
                            className="avatar-image"
                            onError={(e) => {
                              // 如果图片加载失败，显示占位符
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const placeholder = target.nextElementSibling as HTMLElement;
                              if (placeholder) {
                                placeholder.style.display = "flex";
                              }
                            }}
                          />
                        ) : null;
                      })()}
                      <div
                        className="avatar-placeholder"
                        style={{
                          display: isValidAvatarUrl(getFallbackAvatar(record))
                            ? "none"
                            : "flex",
                        }}
                      >
                        {isEmployee
                          ? record?.senderName?.charAt(0)
                          : record?.senderName?.charAt(0) || "客"}
                      </div>
                    </div>

                    <div className="message-content-wrapper">
                      <div className="message-header">
                        <span className="sender-name">{record?.senderName}</span>
                        <span className="message-time">
                          {formatTime(record?.messageTime)}
                        </span>
                      </div>

                      {renderMessageContent(record)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* 右键菜单 */}
      <ContextMenu
        visible={contextMenu.visible}
        position={contextMenu.position}
        items={contextMenuItems}
        onClose={closeContextMenu}
      />

      {/* iframe 音频播放器 - 隐藏显示，仅用于后台播放 */}
      {audioPlayerIframe.visible && (
        <>
          <div className="audio-player-overlay" style={{ display: "none" }}>
            <div className="audio-player-container">
              <iframe
                ref={iframeRef}
                src={audioPlayerIframe.url}
                className="audio-player-iframe"
                title="语音播放器"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>

          {/* 播放控制条 */}
          <div className="audio-player-control-bar">
            <div className="audio-player-control-content">
              <div className="audio-player-info">
                <span className="audio-player-icon">🎵</span>
                <span className="audio-player-text">
                  {audioPlayerIframe.record?.senderName || "语音播放"}
                </span>
              </div>
              <div className="audio-player-actions">
                {audioPlayerIframe.isPlaying ? (
                  <PauseCircleOutlined
                    className="audio-player-control-btn"
                    onClick={toggleIframeAudio}
                  />
                ) : (
                  <PlayCircleOutlined
                    className="audio-player-control-btn"
                    onClick={toggleIframeAudio}
                  />
                )}
                <CloseOutlined
                  className="audio-player-close-btn"
                  onClick={closeAudioPlayerIframe}
                />
              </div>
            </div>
          </div>
        </>
      )}


      {/* 电话详情弹窗 */}
      <PremiumModal
        title="详情"
        visible={phoneDetailModal.visible}
        onClose={handleClosePhoneDetail}
        width={800}
        className="phone-detail-modal"
      >
        {phoneDetailModal.record && (
          <div className="phone-detail-content">
            {/* 通话时长 */}
            <div className="phone-detail-item">
              <span className="phone-detail-label">时长：</span>
              <span className="phone-detail-value">
                {formatCallDuration(phoneDetailModal.record.callDuration)}
              </span>
            </div>

            {/* 开始时间 */}
            {phoneDetailModal.record.startTime && (
              <div className="phone-detail-item">
                <span className="phone-detail-label">开始时间：</span>
                <span className="phone-detail-value">
                  {formatDetailTime(phoneDetailModal.record.startTime)}
                </span>
              </div>
            )}

            {/* 结束时间 */}
            {phoneDetailModal.record.endTime && (
              <div className="phone-detail-item">
                <span className="phone-detail-label">结束时间：</span>
                <span className="phone-detail-value">
                  {formatDetailTime(phoneDetailModal.record.endTime)}
                </span>
              </div>
            )}

            {/* 播放按钮 */}
            {(phoneDetailModal.record.recordUrl ||
              phoneDetailModal.record.callFileUrl ||
              phoneDetailModal.record.url) && (
              <div className="phone-detail-item">
                <span className="phone-detail-label">录音：</span>
                {phoneDetailModal.isPlaying ? (
                  <PauseCircleOutlined
                    className="phone-detail-play-btn"
                    onClick={handlePhoneDetailAudioPlay}
                  />
                ) : (
                  <PlayCircleOutlined
                    className="phone-detail-play-btn"
                    onClick={handlePhoneDetailAudioPlay}
                  />
                )}
              </div>
            )}

            {/* 转写内容 */}
            <div className="phone-detail-item phone-detail-transcription">
              <span className="phone-detail-label">转写内容：</span>
              <div className="phone-detail-transcription-text">
                {phoneDetailModal.loading ? (
                  <div className="phone-detail-loading">
                    <div className="custom-spinner"></div>
                    <span>加载中...</span>
                  </div>
                ) : phoneDetailModal.transcription ? (
                  <div className="transcription-content">
                    {phoneDetailModal.transcription.split("\n").map((line, index, array) => (
                      <span key={index}>
                        {line}
                        {index < array.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="no-transcription">暂无转写内容</span>
                )}
              </div>
            </div>
          </div>
        )}
      </PremiumModal>
    </div>
  );
};

export default CommunicationRecords;
