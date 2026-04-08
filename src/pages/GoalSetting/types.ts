export interface ItemType {
  id: string;
  name: string; // The short name/status like 休息, 方宁
  group: string; // The full name string like 优坊-星黛露-姚丽萍
  tag?: string;
  avatar: string;
  targetAmount: number;
  targetEnrollment: number;
  targetLeads: number;
  remark: string;
  tier: 'A' | 'B' | 'C' | 'D';
  statusColor?: string; // Add color for the dot
}

export interface GoalMetrics {
  totalGoal: number;
  totalEnrollmentGoal: number;
  totalLeadsGoal: number;
  
  assignedAmount: number;
  assignedEnrollment: number;
  assignedLeads: number;
  
  assignedCount: number;
  coverageRate: number;
  coverageRateEnrollment: number;
  coverageRateLeads: number;
  
  avgGoal: number;
  avgEnrollmentGoal: number;
  avgLeadsGoal: number;
}
