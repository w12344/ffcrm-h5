import {
  Advisor,
  SurveyRecord,
  TimeSlot,
  ApiResponse,
  PaginationData,
} from "../types";
import { mockAdvisors, mockTimeSlots } from "../data/mockData";
import { http } from "../utils/request";

// API基础配置由 http 封装统一处理

// 模拟API延迟
const mockDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// 模拟存储（实际项目中应该是真实的数据库操作）
let advisors = [...mockAdvisors];
const timeSlots = [...mockTimeSlots];

// 顾问相关API
export const advisorApi = {
  // 获取顾问列表（分页）
  async getAdvisors(
    pageNumber: number = 1,
    pageSize: number = 10,
    name?: string
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
      });
      if (name && name.trim()) {
        params.append("name", name);
      }
      const response = await http.get<PaginationData<Advisor>>(
        `/reception/employees?${params.toString()}`
      );
      return response.data as unknown as ApiResponse<PaginationData<Advisor>>;
    } catch (error) {
      console.warn("使用mock数据作为降级方案:", name);
      // 返回错误响应对象而不是undefined
      return {
        code: 500,
        message: error instanceof Error ? error.message : '获取顾问列表失败，请重试',
        data: null
      };
    }
  },

  // 根据token获取顾问信息
  async getAdvisorByToken(token: string): Promise<ApiResponse<Advisor | null>> {
    await mockDelay();
    const advisor = advisors.find((a) => a.token === token);
    return {
      code: advisor ? 200 : 404,
      message: advisor ? "获取顾问信息成功" : "未找到对应顾问",
      data: advisor || null,
    };
  },
};

// 时间段相关API
export const timeSlotApi = {
  // 获取所有可用时间段
  async getTimeSlots(): Promise<ApiResponse<TimeSlot[]>> {
    await mockDelay();
    return {
      code: 200,
      message: "获取时间段成功",
      data: timeSlots,
    };
  },

  // 根据ID获取时间段
  async getTimeSlotById(id: string): Promise<ApiResponse<TimeSlot | null>> {
    await mockDelay();
    const timeSlot = timeSlots.find((t) => t.id === id);
    return {
      code: timeSlot ? 200 : 404,
      message: timeSlot ? "获取时间段成功" : "未找到对应时间段",
      data: timeSlot || null,
    };
  },
};

// 调查问卷相关API
export const surveyApi = {
  // 提交调查问卷
  async submitSurvey(formData: any): Promise<any> {
    try {
      // 构建提交数据，按照新的API格式
      const submitData = {
        token: formData.advisorToken,
        name: formData.studentName,
        mobile: formData.contactPhone,
        appointmentForm: {
          childAttending: formData.childAttending,
          appointmentTime: formData.appointmentTime,
          assessmentMethod: formData.assessmentMethod,
          appointmentType: formData.appointmentType,
          subject: formData.subject,
          ...formData
        },
      };

      // 调用新的API接口
      const response = await http.post<{ id: string }>(
        `/reception/submit`,
        submitData
      );
      return response.data as unknown as ApiResponse<{ id: string }>;
    } catch (error) {
      console.warn("API调用失败，使用mock数据作为降级方案:", error);
      // 返回错误响应对象而不是undefined
      return {
        code: 500,
        message: error instanceof Error ? error.message : '提交失败，请重试',
        data: null
      };
    }
  },

  // 获取问卷审核列表（支持姓名搜索和状态筛选）
  async getReceptionList(
    name?: string,
    state?: number,
    page: number = 1,
    pageSize: number = 10,
    deliveryState?: number
  ): Promise<any> {
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      if (name) {
        params.append("name", name);
      }
      if (state !== undefined) {
        params.append("state", state.toString());
      }
      if (deliveryState !== undefined) {
        params.append("deliveryState", deliveryState.toString());
      }
      params.append("page", page.toString());
      params.append("pageSize", pageSize.toString());
      const response = await http.get<PaginationData<SurveyRecord>>(
        `/reception/list?${params.toString()}`
      );
      return response.data as unknown as ApiResponse<
        PaginationData<SurveyRecord>
      >;
    } catch (error) {
      console.warn("使用mock数据作为降级方案:", error);
      // 返回错误响应对象而不是undefined
      return {
        code: 500,
        message: error instanceof Error ? error.message : '获取数据失败，请重试',
        data: null
      };
    }
  },
};

// 审核接待（通过/拒绝）
export const approveReception = async (
  id: string | number,
  state: number, // 1=通过, -1=拒绝
  reason?: string
): Promise<any> => {
  try {
    const response = await http.post<{ success: boolean }>(
      `/reception/approve`,
      { id, state, reason }
    );
    return response.data as unknown as ApiResponse<{ success: boolean }>;
  } catch (error) {
    console.error('审核接待失败:', error);
    // 返回错误响应对象而不是undefined
    return {
      code: 500,
      message: error instanceof Error ? error.message : '审核失败，请重试',
      data: null
    };
  }
};

// 交付通过（交付/拒绝）
export const deliveryReception = async (
  id: string | number,
  deliveryState: number // 1=交付, 0=拒绝交付
): Promise<any> => {
  try {
    const response = await http.post<{ success: boolean }>(
      `/reception/delivery`,
      { id, deliveryState }
    );
    return response.data as unknown as ApiResponse<{ success: boolean }>;
  } catch (error) {
    console.error('交付通过失败:', error);
    throw error;
  }
};
