import React from "react";
import UniversalCircularChart from "@/components/UniversalCircularChart";

interface EnrollmentProgressChartProps {
  totalProgress: number; // 总进度百分比
  signedProgress: number; // 第一个子指标进度百分比
  enrolledProgress: number; // 第二个子指标进度百分比
  title?: string; // 中心标题文字，默认为"招生完成度"
  colorTheme?: 'default' | 'orange'; // Added colorTheme
  outerLabel?: string;
  innerLabel?: string;
}

const EnrollmentProgressChart: React.FC<EnrollmentProgressChartProps> = ({
  totalProgress,
  signedProgress,
  enrolledProgress,
  title = "招生完成度",
  colorTheme = 'default',
  outerLabel,
  innerLabel
}) => {
  return (
    <div className="chart-container">
      <div className="circular-chart">
        <UniversalCircularChart
          mode="concentric"
          totalProgress={totalProgress}
          signedProgress={signedProgress}
          enrolledProgress={enrolledProgress}
          title={title}
          colorTheme={colorTheme}
          outerLabel={outerLabel}
          innerLabel={innerLabel}
        />
      </div>
    </div>
  );
};

export default EnrollmentProgressChart;
