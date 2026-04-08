import React, { useState, useEffect } from "react";
import {
  Radio,
  Button,
  Toast,
  Checkbox,
  DatePicker,
} from "@arco-design/mobile-react";
import { SurveyFormData, ExperienceProject } from "../../types";
import { surveyApi } from "../../services/api";
import { parseUrlParams } from "../../utils";
import "./index.less";
import CustomModal from "../../components/CustomModal";
import ExperienceProjectSelector from "../../components/ExperienceProjectSelector/index";

// 本地存储键名
const LOCAL_STORAGE_KEY = "survey_form_data";

// 图标组件
const UserIcon = () => (
  <svg
    className="input-icon"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    className="input-icon"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);

const SurveyForm: React.FC = () => {
  // 表单字段，匹配表格要求
  const [formData, setFormData] = useState({
    studentName: "",
    contactPhone: "",
    travelMode: "", // 出行方式
    isMeetPrincipal: null as number | null, // 是否参与校长见面
    appointmentDate: "", // 预约日期
    assessmentMethods: [] as string[], // 选择所需要的测评内容（多选）
    learningFocus: [] as string[], // 你最看重高三学习时需要具备什么（多选）
    customLearningFocus: "", // 自定义学习关注点
    subjects: [] as string[], // 学科（多选）
    experienceProjects: [] as ExperienceProject[], // 想要体验的项目
    materials: [] as string[], // 领取的物料（多选）
  });
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // 日期选择器状态
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState<number>(Date.now()); // 控制错误提示显示
  const [advisorInfo, setAdvisorInfo] = useState<{
    advisorName?: string;
    token?: string;
  }>({});
  const [savedFormData, setSavedFormData] = useState<any>(null); // 保存的表单数据
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // 本地存储工具函数
  const saveToLocalStorage = (data: typeof formData) => {
    try {
      const dataWithTimestamp = {
        ...data,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(dataWithTimestamp)
      );
    } catch (error) {
      console.warn("保存到本地存储失败:", error);
    }
  };

  const getFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // 检查数据是否有效（不超过7天）
        const savedAt = new Date(data.savedAt);
        const now = new Date();
        const daysDiff =
          (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff <= 7) {
          // 移除时间戳字段
          const { savedAt: _, ...formData } = data;
          return formData;
        } else {
          // 数据过期，清除
          clearLocalStorage();
        }
      }
    } catch (error) {
      console.warn("从本地存储读取失败:", error);
    }
    return null;
  };

  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.warn("清除本地存储失败:", error);
    }
  };

  // 实时保存（去除防抖）
  const saveImmediatelyIfHasContent = (data: typeof formData) => {
    const hasContent =
      data.studentName.trim() ||
      data.contactPhone.trim() ||
      data.travelMode ||
      data.isMeetPrincipal !== null ||
      data.appointmentDate ||
      data.assessmentMethods.length > 0 ||
      data.learningFocus.length > 0 ||
      data.customLearningFocus ||
      data.subjects.length > 0 ||
      data.experienceProjects.length > 0 ||
      data.materials.length > 0;
    if (hasContent) {
      saveToLocalStorage(data);
    }
  };

  // 检查是否有表单数据且不为空
  const hasFormData = (data: any): boolean => {
    if (!data) return false;

    return (
      data.studentName?.trim() ||
      data.contactPhone?.trim() ||
      data.travelMode ||
      data.isMeetPrincipal !== null ||
      data.appointmentDate ||
      (data.assessmentMethods && data.assessmentMethods.length > 0) ||
      (data.learningFocus && data.learningFocus.length > 0) ||
      data.customLearningFocus ||
      (data.subjects && data.subjects.length > 0) ||
      (data.experienceProjects && data.experienceProjects.length > 0) ||
      (data.materials && data.materials.length > 0)
    );
  };

  // 初始化表单数据
  useEffect(() => {
    // 解析URL参数获取顾问信息和token
    const urlParams = parseUrlParams();

    // token是必需的参数
    if (urlParams.token) {
      setAdvisorInfo({
        advisorName: urlParams.advisorName, // 可选参数
        token: urlParams.token,
      });
    } else {
      // 如果没有token，显示错误提示
      Toast.error("缺少必要的token参数，请通过正确的链接访问");
    }

    // 检查本地存储中是否有保存的表单数据
    const savedData = getFromLocalStorage();
    console.log(savedData, "savedData");
    if (hasFormData(savedData)) {
      setSavedFormData(savedData);
      console.log("BBB");
      setTimeout(() => {
        setShowRestoreModal(true);
      }, 300);
    }
  }, []);

  // 移除原先的防抖保存与清理逻辑

  // 滚动到指定元素
  const scrollToElement = (elementId: string) => {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        // 添加高亮效果
        element.style.transition = "all 0.3s ease";
        element.style.backgroundColor = "#fff2f0";
        element.style.borderColor = "#ff4d4f";
        setTimeout(() => {
          element.style.backgroundColor = "";
          element.style.borderColor = "";
        }, 2000);
      }
    }, 100);
  };

  // 表单验证
  const validateForm = (): boolean => {
    if (!formData.studentName.trim()) {
      Toast.error("请输入学生姓名");
      scrollToElement("student-name-field");
      return false;
    }
    if (!formData.contactPhone.trim()) {
      Toast.error("请输入联系电话");
      scrollToElement("contact-phone-field");
      return false;
    }
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.contactPhone.trim())) {
      Toast.error("请输入正确的手机号码");
      scrollToElement("contact-phone-field");
      return false;
    }
    if (!formData.travelMode) {
      Toast.error("请选择出行方式");
      scrollToElement("travel-mode-field");
      return false;
    }
    if (formData.isMeetPrincipal === null) {
      Toast.error("请选择是否参与校长见面");
      scrollToElement("meet-principal-field");
      return false;
    }
    if (!formData.appointmentDate) {
      Toast.error("请选择预约日期");
      scrollToElement("appointment-date-field");
      return false;
    }
    if (!formData.assessmentMethods.length) {
      Toast.error("请选择选择所需要的测评内容");
      scrollToElement("assessment-methods-field");
      return false;
    }
    if (!formData.learningFocus.length) {
      Toast.error("请选择最看重的高三学习能力");
      scrollToElement("learning-focus-field");
      return false;
    }
    if (
      formData.learningFocus.includes("other") &&
      !formData.customLearningFocus.trim()
    ) {
      Toast.error("请输入具体关注点");
      scrollToElement("learning-focus-field");
      return false;
    }
    if (!formData.experienceProjects.length) {
      Toast.error("请选择想要体验的项目");
      scrollToElement("experience-projects-field");
      return false;
    }
    // 验证每个体验项目都选择了学科
    for (const project of formData.experienceProjects) {
      if (!project.subjects.length) {
        Toast.error("请为每个体验项目选择至少一个学科");
        scrollToElement("experience-projects-field");
        return false;
      }
    }
    if (!formData.materials.length) {
      Toast.error("请选择要领取的物料");
      scrollToElement("materials-field");
      return false;
    }
    // 检查token是否存在
    if (!advisorInfo.token) {
      Toast.error("缺少token信息，请通过正确的链接访问");
      return false;
    }
    return true;
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      setShowErrors(true); // 显示错误提示
      if (!validateForm()) {
        return;
      }

      if (!advisorInfo.token) {
        Toast.error("缺少token信息，请通过正确的链接访问");
        return;
      }

      setSubmitting(true);

      const submitData: SurveyFormData = {
        studentName: formData.studentName,
        contactPhone: formData.contactPhone,
        travelMode: formData.travelMode,
        isMeetPrincipal: formData.isMeetPrincipal?.toString() || "",
        childAttending: formData.travelMode === "both_together",
        appointmentTime: formData.appointmentDate,
        weekendTimeSlot: formData.appointmentDate,
        customTimeSlot: formData.appointmentDate,
        assessmentMethod: formData.assessmentMethods[0] || "",
        assessmentMethods: formData.assessmentMethods,
        subject: formData.subjects[0] || "",
        subjects: formData.subjects,
        learningFocus: formData.learningFocus.includes("other")
          ? [
              ...formData.learningFocus.filter((item) => item !== "other"),
              formData.customLearningFocus,
            ]
          : formData.learningFocus,
        customLearningFocus: formData.customLearningFocus,
        experienceProjects: formData.experienceProjects,
        materials: formData.materials,
        advisorName: advisorInfo.advisorName,
        advisorToken: advisorInfo.token,
      };

      const response = await surveyApi.submitSurvey(submitData);

      if (response.code === 200) {
        Toast.success("预约提交成功，请等待顾问审核");
        // 清除本地存储
        clearLocalStorage();
        // 重置表单和错误提示状态
        setFormData({
          studentName: "",
          contactPhone: "",
          travelMode: "",
          isMeetPrincipal: null,
          appointmentDate: "",
          assessmentMethods: [],
          learningFocus: [],
          customLearningFocus: "",
          subjects: [],
          experienceProjects: [],
          materials: [],
        });
        setShowErrors(false); // 重置错误提示状态，不再显示验证错误
      } else {
        // 显示错误信息
        Toast.error(response.message || "提交失败");
      }
    } catch (error) {
      console.error("提交错误:", error);
      Toast.error("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  // 恢复保存的表单数据
  const handleRestoreData = (data?: any) => {
    const dataToRestore = data || savedFormData;
    if (dataToRestore) {
      setFormData(dataToRestore);
      setShowRestoreModal(false);
    }
  };

  // 放弃保存的数据，重新开始
  const handleDiscardData = () => {
    clearLocalStorage();
    setSavedFormData(null);
    setShowRestoreModal(false);
  };

  // 表单字段更新处理
  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      saveImmediatelyIfHasContent(next);
      return next;
    });
  };

  // 多选字段处理
  const handleMultiSelectChange = (
    field: keyof typeof formData,
    selectedValues: string[]
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: selectedValues };
      saveImmediatelyIfHasContent(next);
      return next;
    });
  };

  // 选项配置
  const travelModeOptions = [
    { label: "家长单独上门", value: "parent_only" },
    { label: "学生单独上门", value: "student_only" },
    { label: "家长和孩子一同上门", value: "both_together" },
  ];

  const meetPrincipalOptions = [
    { label: "是", value: 1 },
    { label: "否", value: 0 },
  ];

  const assessmentMethodOptions = [
    { label: "不预约测评", value: "no_appointment" },
    { label: "语文", value: "chinese" },
    { label: "数学", value: "math" },
    { label: "英语", value: "english" },
    { label: "日语", value: "japanese" },
    { label: "政治", value: "politics" },
    { label: "历史", value: "history" },
    { label: "地理", value: "geography" },
    { label: "物理", value: "physics" },
    { label: "化学", value: "chemistry" },
    { label: "生物", value: "biology" },
    { label: "技术", value: "technology" },
  ];

  const learningFocusOptions = [
    { label: "教育理念", value: "education_philosophy" },
    { label: "教育流程", value: "education_process" },
    { label: "教学精度", value: "teaching_precision" },
    { label: "师资情况", value: "faculty_situation" },
  ];

  return (
    <div className="survey-form">
      <div className="survey-form-content">
        {/* 头部信息 */}
        <div className="header">
          <div className="welcome-badge">
            🎓 欢迎填写我们的校园非凡教育上门预约单！
          </div>

          <div className="description">
            <p>本次活动旨在为同学们提供专业的学科能力评估和个性化学习建议。</p>

            <div className="notes">
              <div className="note-title">📝 活动说明：</div>
              <ul>
                <li>请如实填写个人信息</li>
                <li>我们将安排专业的学科诊断</li>
                <li>所有信息严格保密</li>
              </ul>
            </div>
          </div>

          {advisorInfo.advisorName && (
            <div className="advisor-info">
              <span>🎯 您的专属顾问：{advisorInfo.advisorName}</span>
            </div>
          )}
        </div>

        {/* 表单 */}
        <div className="survey-form-container">
          <div className="form-item" id="student-name-field">
            <div className="form-label">学生姓名</div>
            <div className="input-wrapper">
              <UserIcon />
              <input
                placeholder="请输入学生姓名"
                value={formData.studentName}
                onChange={(e) => {
                  handleFieldChange("studentName", e.target.value);
                }}
              />
            </div>
            {showErrors && !formData.studentName.trim() && (
              <div className="error-hint">请填写此项</div>
            )}
          </div>

          <div className="form-item" id="contact-phone-field">
            <div className="form-label">联系电话</div>
            <div className="input-wrapper">
              <PhoneIcon />
              <input
                placeholder="请输入联系电话"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => {
                  handleFieldChange("contactPhone", e.target.value);
                }}
              />
            </div>
            {showErrors && !formData.contactPhone.trim() && (
              <div className="error-hint">请填写此项</div>
            )}
          </div>

          <div className="form-item" id="travel-mode-field">
            <div className="form-label">出行方式</div>
            <div className="radio-wrapper">
              <Radio.Group
                options={travelModeOptions}
                value={formData.travelMode}
                onChange={(value) => handleFieldChange("travelMode", value)}
              />
            </div>
            {showErrors && !formData.travelMode && (
              <div className="error-hint">请选择此项</div>
            )}
          </div>

          <div className="form-item" id="meet-principal-field">
            <div className="form-label">是否参与校长见面</div>
            <div className="radio-wrapper">
              <Radio.Group
                options={meetPrincipalOptions}
                value={formData.isMeetPrincipal}
                onChange={(value) =>
                  handleFieldChange("isMeetPrincipal", value)
                }
              />
            </div>
            {showErrors && formData.isMeetPrincipal === null && (
              <div className="error-hint">请选择此项</div>
            )}
          </div>

          <div className="form-item" id="appointment-date-field">
            <div className="form-label">预约日期</div>
            <div className="date-picker-wrapper">
              <div
                className="date-input-trigger"
                onClick={() => setDatePickerVisible(true)}
              >
                {formData.appointmentDate
                  ? new Date(formData.appointmentDate).toLocaleDateString(
                      "zh-CN",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }
                    )
                  : "请选择预约日期"}
              </div>

              <DatePicker
                visible={datePickerVisible}
                mode="date"
                maskClosable
                disabled={false}
                currentTs={datePickerValue}
                minTs={Date.now()}
                title="选择预约日期"
                onHide={() => {
                  setDatePickerVisible(false);
                }}
                onChange={(timestamp) => {
                  const timestampValue = Array.isArray(timestamp)
                    ? timestamp[0]
                    : timestamp;
                  setDatePickerValue(timestampValue);
                  const date = new Date(timestampValue);
                  const dateString = date.toISOString().split("T")[0];
                  handleFieldChange("appointmentDate", dateString);
                }}
                onOk={() => {
                  setDatePickerVisible(false);
                }}
                formatter={(value, type) => {
                  if (type === "year") {
                    return `${value}年`;
                  } else if (type === "month") {
                    return `${value}月`;
                  } else if (type === "date") {
                    return `${value}日`;
                  }
                  return `${value}`;
                }}
              />
            </div>
            {showErrors && !formData.appointmentDate && (
              <div className="error-hint">请选择预约日期</div>
            )}
          </div>

          <div className="form-item" id="experience-projects-field">
            <div className="form-label">想要体验的项目</div>
            <div className="experience-projects-wrapper">
              <ExperienceProjectSelector
                value={formData.experienceProjects}
                onChange={(value) =>
                  handleFieldChange("experienceProjects", value)
                }
                showErrors={showErrors}
              />
            </div>
          </div>

          <div className="form-item" id="assessment-methods-field">
            <div className="form-label">选择所需要的测评内容</div>
            <div className="checkbox-wrapper">
              <Checkbox.Group
                options={assessmentMethodOptions}
                value={formData.assessmentMethods}
                onChange={(value) =>
                  handleMultiSelectChange(
                    "assessmentMethods",
                    value.map((v) => String(v))
                  )
                }
              />
            </div>
            {showErrors && !formData.assessmentMethods.length && (
              <div className="error-hint">请选择测评方式</div>
            )}
          </div>

          <div className="form-item" id="learning-focus-field">
            <div className="form-label">你最看重高三学习时需要具备什么</div>
            <div className="checkbox-wrapper">
              <Checkbox.Group
                options={learningFocusOptions}
                value={formData.learningFocus.filter((v) => v !== "other")}
                onChange={(value) => {
                  const stringValues = value.map((v) => String(v));
                  const newValues = formData.learningFocus.includes("other")
                    ? [...stringValues, "other"]
                    : stringValues;
                  handleMultiSelectChange("learningFocus", newValues);
                }}
              />

              {/* 单独的"其他"选项卡片 */}
              <div
                className={`other-option-card ${
                  formData.learningFocus.includes("other") ? "selected" : ""
                }`}
              >
                <div
                  className="other-option-header"
                  onClick={() => {
                    const newValues = formData.learningFocus.includes("other")
                      ? formData.learningFocus.filter((v) => v !== "other")
                      : [...formData.learningFocus, "other"];
                    handleMultiSelectChange("learningFocus", newValues);
                    if (!newValues.includes("other")) {
                      handleFieldChange("customLearningFocus", "");
                    }
                  }}
                >
                  <Checkbox
                    checked={formData.learningFocus.includes("other")}
                    value="other"
                  >
                    其他
                  </Checkbox>
                </div>
                {formData.learningFocus.includes("other") && (
                  <div className="other-input-container">
                    <input
                      placeholder="请输入补充信息"
                      value={formData.customLearningFocus}
                      onChange={(e) =>
                        handleFieldChange("customLearningFocus", e.target.value)
                      }
                      className="other-input"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            </div>
            {showErrors && !formData.learningFocus.length && (
              <div className="error-hint">请选择学习能力</div>
            )}
            {showErrors &&
              formData.learningFocus.includes("other") &&
              !formData.customLearningFocus.trim() && (
                <div className="error-hint">请输入具体关注点</div>
              )}
          </div>

          <div className="form-item" id="materials-field">
            <div className="form-label">领取的物料</div>
            <div className="checkbox-wrapper">
              <Checkbox.Group
                options={[
                  { label: "专业白皮书", value: "white_paper" },
                  { label: "学科记背资料", value: "subject_materials" },
                  { label: "盒子课", value: "box_course" },
                ]}
                value={formData.materials}
                onChange={(value) =>
                  handleMultiSelectChange(
                    "materials",
                    value.map((v) => String(v))
                  )
                }
              />
            </div>
            {showErrors && !formData.materials.length && (
              <div className="error-hint">请选择要领取的物料</div>
            )}
          </div>

          {/* 联系的非凡顾问老师 - 自动填充显示 */}
          {advisorInfo.advisorName && (
            <div className="form-item">
              <div className="form-label">联系的非凡顾问老师</div>
              <div className="advisor-display">{advisorInfo.advisorName}</div>
            </div>
          )}

          <div className="submit-container">
            <Button
              type="primary"
              size="large"
              className="submit-button"
              loading={submitting}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "提交中..." : "提交"}
            </Button>
          </div>
          <CustomModal
            visible={showRestoreModal}
            title="发现未完成的填写"
            okText="继续填写"
            cancelText="重新开始"
            onOk={() => handleRestoreData(savedFormData)}
            onCancel={handleDiscardData}
          >
            您之前已填写过部分内容，是否继续填写？
          </CustomModal>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
