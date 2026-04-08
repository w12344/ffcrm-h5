import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Toast } from '@arco-design/mobile-react';
import './index.less';

interface SurveyDetailData {
  id: number;
  studentName: string;
  contactPhone: string;
  travelMode: string;
  isMeetPrincipal: string;
  childAttending: boolean;
  appointmentTime: string;
  weekendTimeSlot: string;
  customTimeSlot?: string;
  assessmentMethod: string;
  assessmentMethods: string[];
  appointmentType: string;
  subject: string;
  subjects: string[];
  learningFocus: string[];
  customLearningFocus?: string;
  advisorName: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

const ReviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [surveyDetail, setSurveyDetail] = useState<SurveyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [floatingButtonPosition, setFloatingButtonPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);


  const getLearningFocusText = (focusArray: string[]) => {
    const focusMap: { [key: string]: string } = {
      'education_philosophy': '教育理念',
      'education_process': '教育流程',
      'teaching_precision': '教学精度',
      'faculty_situation': '师资情况',
      'other': '其他'
    };
    
    if (!focusArray || focusArray.length === 0) {
      return '未设置';
    }
    
    return focusArray.map(focus => focusMap[focus] || focus).join('、');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '已通过';
      case 'rejected': return '已拒绝';
      default: return '未知';
    }
  };

  // 测评方式中文映射（兼容历史与新字段）
  const getAssessmentMethodText = (method?: string) => {
    if (!method) return '未设置';
    switch (method) {
      case 'online':
        return '线上测评';
      case 'offline':
        return '线下测评';
      case 'math_calculation':
        return '数学计算力测试';
      case 'math_45min':
        return '数学45分钟快速测试';
      case 'no_appointment':
        return '不预约测评';
      case 'chinese':
        return '语文';
      case 'math':
        return '数学';
      case 'english':
        return '英语';
      case 'japanese':
        return '日语';
      case 'politics':
        return '政治';
      case 'history':
        return '历史';
      case 'geography':
        return '地理';
      case 'physics':
        return '物理';
      case 'chemistry':
        return '化学';
      case 'biology':
        return '生物';
      case 'technology':
        return '技术';
      default:
        return method;
    }
  };

  // 出行方式中文映射
  const getTravelModeText = (mode?: string) => {
    switch (mode) {
      case 'parent_only': return '家长单独上门';
      case 'student_only': return '学生单独上门';
      case 'both_together': return '家长和孩子一同上门';
      default: return mode || '未设置';
    }
  };

  // 是否参与校长见面中文映射
  const getMeetPrincipalText = (value?: string) => {
    if (value == '1' ) return '是';
    if (value == '0' ) return '否';
    return value || '未设置';
  };

  // 获取多选测评内容的显示文本
  const getAssessmentMethodsText = (methods?: string[]) => {
    if (!methods || methods.length === 0) return '未设置';
    return methods.map(method => getAssessmentMethodText(method)).join('、');
  };

  // 获取多选学科的显示文本  
  const getSubjectsText = (subjects?: string[]) => {
    if (!subjects || subjects.length === 0) return '未设置';
    return subjects.map(subject => getAssessmentMethodText(subject)).join('、');
  };

  // 处理浮动按钮拖拽
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const rect = (e.target as Element).getBoundingClientRect();
    const newX = touch.clientX - rect.width / 2;
    const newY = touch.clientY - rect.height / 2;
    
    // 限制在屏幕范围内
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;
    
    setFloatingButtonPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleFloatingButtonClick = () => {
    if (!isDragging) {
      navigate('/review');
    }
  };



  // 从localStorage获取详情数据（临时方案，实际应该调用API）
  useEffect(() => {
    if (id) {
      const storedSurveys = localStorage.getItem('review_surveys');
      if (storedSurveys) {
        try {
          const surveys: SurveyDetailData[] = JSON.parse(storedSurveys);
          const survey = surveys.find(s => s.id === parseInt(id));
          if (survey) {
            setSurveyDetail(survey);
          } else {
            Toast.error('未找到该审核记录');
            navigate('/review');
          }
        } catch (error) {
          console.error('解析审核数据失败:', error);
          Toast.error('数据解析失败');
          navigate('/review');
        }
      } else {
        Toast.error('未找到审核数据');
        navigate('/review');
      }
    }
    setLoading(false);
  }, [id, navigate]);


  if (loading) {
    return (
      <div className="review-detail-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!surveyDetail) {
    return (
      <div className="review-detail-page">
        <div className="error">未找到审核详情</div>
      </div>
    );
  }

  return (
    <div className="review-detail-page">
      {/* 可拖拽的浮动返回按钮 */}
      <div 
        className={`floating-back-button ${isDragging ? 'dragging' : ''}`}
        style={{
          left: `${floatingButtonPosition.x}px`,
          top: `${floatingButtonPosition.y}px`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleFloatingButtonClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="review-detail-content">
        {/* 基本信息卡片 */}
        <div className="info-card">
          <div className="card-header">
            <div className="header-left">
              <span className="icon">👤</span>
              <span>基本信息</span>
            </div>
            <div 
              className={`status-badge ${surveyDetail.status}`}
            >
              {getStatusText(surveyDetail.status)}
            </div>
          </div>
          <div className="card-content">
            <div className="info-item">
              <div className="label">学员姓名</div>
              <div className="value">{surveyDetail.studentName}</div>
            </div>
            <div className="info-item">
              <div className="label">联系电话</div>
              <div className="value">{surveyDetail.contactPhone}</div>
            </div>
            <div className="info-item">
              <div className="label">出行方式</div>
              <div className="value">{getTravelModeText(surveyDetail.travelMode)}</div>
            </div>
            <div className="info-item">
              <div className="label">是否参与校长见面</div>
              <div className="value">{getMeetPrincipalText(surveyDetail.isMeetPrincipal)}</div>
            </div>
            <div className="info-item">
              <div className="label">孩子是否到场</div>
              <div className="value">{surveyDetail.childAttending ? '是' : '否'}</div>
            </div>
            <div className="info-item">
              <div className="label">创建时间</div>
              <div className="value">{surveyDetail.createdAt?.split('T')[0]}</div>
            </div>
          </div>
        </div>

        {/* 预约信息卡片 */}
        <div className="info-card">
          <div className="card-header">
            <div className="header-left">
              <span className="icon">📅</span>
              <span>预约信息</span>
            </div>
          </div>
          <div className="card-content">
            <div className="info-item">
              <div className="label">预约时间</div>
              <div className="value">{surveyDetail.appointmentTime}</div>
            </div>
            <div className="info-item">
              <div className="label">周末时间段</div>
              <div className="value">{surveyDetail.weekendTimeSlot || '未设置'}</div>
            </div>
            {surveyDetail.customTimeSlot && (
              <div className="info-item">
                <div className="label">自定义时间</div>
                <div className="value">{surveyDetail.customTimeSlot}</div>
              </div>
            )}
            <div className="info-item">
              <div className="label">测评内容（多选）</div>
              <div className="value">
                {getAssessmentMethodsText(surveyDetail.assessmentMethods)}
              </div>
            </div>
            <div className="info-item">
              <div className="label">测评方式（主要）</div>
              <div className="value">
                {getAssessmentMethodText(surveyDetail.assessmentMethod)}
              </div>
            </div>
            <div className="info-item">
              <div className="label">预约类型</div>
              <div className="value">
                {surveyDetail.appointmentType === 'english_diagnostic' ? '英语诊断' :
                 surveyDetail.appointmentType === 'math_diagnostic' ? '数学诊断' :
                 surveyDetail.appointmentType === 'comprehensive_diagnostic' ? '综合诊断' :
                 surveyDetail.appointmentType === 'english' ? '英语诊断' :
                 surveyDetail.appointmentType === 'math' ? '数学诊断' :
                 surveyDetail.appointmentType === 'comprehensive' ? '综合诊断' :
                 surveyDetail.appointmentType || '未设置'}
              </div>
            </div>
            <div className="info-item">
              <div className="label">学科（多选）</div>
              <div className="value">
                {getSubjectsText(surveyDetail.subjects)}
              </div>
            </div>
            <div className="info-item">
              <div className="label">主要学科</div>
              <div className="value">
                {getAssessmentMethodText(surveyDetail.subject)}
              </div>
            </div>
            <div className="info-item">
              <div className="label">关注重点</div>
              <div className="value">
                {getLearningFocusText(surveyDetail.learningFocus)}
                {surveyDetail.customLearningFocus && (
                  <span>、{surveyDetail.customLearningFocus}</span>
                )}
              </div>
            </div>
            <div className="info-item">
              <div className="label">顾问姓名</div>
              <div className="value">{surveyDetail.advisorName}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ReviewDetailPage;
