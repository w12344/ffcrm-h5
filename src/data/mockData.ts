import { 
  Advisor, 
  SurveyRecord, 
  TimeSlot,
  SurveyStatus,
  AssessmentMethod,
  AppointmentType,
  Subject
} from '../types';

// 模拟顾问数据
export const mockAdvisors: Advisor[] = [
  {
    name: '张老师',
    mobile: '13812345678',
    token: 'ABC123DEF456',
    employeeLink: 'https://jsj.top/f/CUwLZn?advisorName=张老师&token=ABC123DEF456'
  },
  {
    name: '李老师',
    mobile: '13987654321',
    token: 'GHI789JKL012',
    employeeLink: 'https://jsj.top/f/CUwLZn?advisorName=李老师&token=GHI789JKL012'
  },
  {
    name: '王老师',
    mobile: '13611223344',
    token: 'MNO345PQR678',
    employeeLink: 'https://jsj.top/f/CUwLZn?advisorName=王老师&token=MNO345PQR678'
  },
  {
    name: '陈老师',
    mobile: '13755667788',
    token: 'STU901VWX234',
    employeeLink: 'https://jsj.top/f/CUwLZn?advisorName=陈老师&token=STU901VWX234'
  },
  {
    name: '刘老师',
    mobile: '13899001122',
    token: 'YZA567BCD890',
    employeeLink: 'https://jsj.top/f/CUwLZn?advisorName=刘老师&token=YZA567BCD890'
  }
];

// 生成未来7天的时间段数据
const generateTimeSlots = (): TimeSlot[] => {
  const timeSlots: TimeSlot[] = [];
  const today = new Date();
  
  // 时间段选项
  const timeRanges = [
    '09:00-10:00',
    '10:00-11:00', 
    '11:00-12:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '19:00-20:00'
  ];

  // 生成未来7天的时间段
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    timeRanges.forEach((timeRange, index) => {
      timeSlots.push({
        id: `${dateStr}-${index}`,
        date: dateStr,
        timeRange,
        display: `${month}月${day}日 ${timeRange}`
      });
    });
  }
  
  return timeSlots;
};

export const mockTimeSlots: TimeSlot[] = generateTimeSlots();

// 模拟调查问卷记录数据
export const mockSurveyRecords: SurveyRecord[] = [
  {
    id: 'survey-001',
    studentName: '小明',
    contactPhone: '13812345678',
    childAttending: true,
    appointmentTime: mockTimeSlots[0],
    assessmentMethod: AssessmentMethod.ONLINE,
    appointmentType: AppointmentType.ENGLISH_DIAGNOSTIC,
    subject: Subject.ENGLISH,
    advisorName: '张老师',
    advisorToken: 'ABC123DEF456',
    submitTime: '2024-01-15 10:30:00',
    status: SurveyStatus.APPROVED,
    approvalTime: '2024-01-15 11:00:00'
  },
  {
    id: 'survey-002', 
    studentName: '小红',
    contactPhone: '13987654321',
    childAttending: false,
    appointmentTime: mockTimeSlots[8],
    assessmentMethod: AssessmentMethod.OFFLINE,
    appointmentType: AppointmentType.PARENT_MEETING,
    subject: Subject.MATH,
    advisorName: '李老师',
    advisorToken: 'GHI789JKL012',
    submitTime: '2024-01-15 14:20:00',
    status: SurveyStatus.PENDING
  },
  {
    id: 'survey-003',
    studentName: '小刚',
    contactPhone: '13611223344',
    childAttending: true,
    appointmentTime: mockTimeSlots[16],
    assessmentMethod: AssessmentMethod.ONLINE,
    appointmentType: AppointmentType.BOTH,
    subject: Subject.PHYSICS,
    advisorName: '王老师',
    advisorToken: 'MNO345PQR678',
    submitTime: '2024-01-15 16:45:00',
    status: SurveyStatus.PENDING
  }
];

// 辅助函数：获取状态标签
export const getSurveyStatusLabel = (status: SurveyStatus): string => {
  switch (status) {
    case SurveyStatus.PENDING:
      return '待审核';
    case SurveyStatus.APPROVED:
      return '已通过';
    default:
      return '未知';
  }
};

// 辅助函数：获取测评方式标签
export const getAssessmentMethodLabel = (method: AssessmentMethod): string => {
  switch (method) {
    case AssessmentMethod.ONLINE:
      return '线上测评';
    case AssessmentMethod.OFFLINE:
      return '线下测评';
    default:
      return '未知';
  }
};

// 辅助函数：获取预约类型标签
export const getAppointmentTypeLabel = (type: AppointmentType): string => {
  switch (type) {
    case AppointmentType.ENGLISH_DIAGNOSTIC:
      return '英语诊断';
    case AppointmentType.PARENT_MEETING:
      return '家长会';
    case AppointmentType.BOTH:
      return '英语诊断+家长会';
    default:
      return '未知';
  }
};

// 辅助函数：获取学科标签
export const getSubjectLabel = (subject: Subject): string => {
  switch (subject) {
    case Subject.ENGLISH:
      return '英语';
    case Subject.MATH:
      return '数学';
    case Subject.PHYSICS:
      return '物理';
    case Subject.CHEMISTRY:
      return '化学';
    default:
      return '未知';
  }
};