import React from 'react';
import { message } from 'antd';
import './index.less';

const BossDailyReportCard: React.FC = () => {
  return (
    <div className="boss-daily-report-card">
      <div className="card-header">
        <div className="title">每日高管日报</div>
        <div className="greeting">昨日团队运转数据概览</div>
      </div>
      
      <div className="card-section">
        <div className="section-title">
          <span className="icon">🏆</span>
          <span className="text">【业绩标杆 TOP 3】</span>
        </div>
        <div className="section-content top-list">
          <div className="list-item">
            <div className="item-left">
              <span className="medal">🥇</span>
              <span className="name">张莹</span>
            </div>
            <div className="item-right">
              <span className="amount">1066.9万</span>
              <span className="progress">(进度 <span className="grade a">A级</span> 114%)</span>
            </div>
          </div>
          <div className="list-item">
            <div className="item-left">
              <span className="medal">🥈</span>
              <span className="name">吴亚丽</span>
            </div>
            <div className="item-right">
              <span className="amount">962.6万</span>
              <span className="progress">(进度 <span className="grade a">A级</span> 106%)</span>
            </div>
          </div>
          <div className="list-item">
            <div className="item-left">
              <span className="medal">🥉</span>
              <span className="name">金雷拉</span>
            </div>
            <div className="item-right">
              <span className="amount">926.5万</span>
              <span className="progress">(进度 <span className="grade a">A级</span> 105%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-section">
        <div className="section-title">
          <span className="icon">⚠️</span>
          <span className="text warning">【红线违规预警】</span>
        </div>
        <div className="section-content warning-list">
          <div className="list-item">
            <span className="dot">🔴</span>
            <span className="warning-type">业绩严重滞后(D级):</span>
            <span className="warning-desc" title="刘祥宇(仅44%)、陈孟丽(仅47%)">刘祥宇(仅44%)、陈孟丽(仅47%)</span>
          </div>
          <div className="list-item">
            <span className="dot">🔴</span>
            <span className="warning-type">资源浪费(建联率&lt;60%):</span>
            <span className="warning-desc" title="廖正凯(建联率仅41%)">廖正凯(建联率仅41%)</span>
          </div>
          <div className="list-item">
            <span className="dot">🔴</span>
            <span className="warning-type">下周断粮(激活数极低):</span>
            <span className="warning-desc" title="龙青(仅9个，低于安全线)">龙青(仅9个，低于安全线)</span>
          </div>
          <div className="list-item">
            <span className="dot">🔴</span>
            <span className="warning-type">沉睡线索(超7天未跟进):</span>
            <span className="warning-desc" title="赵菲菲(21个高优客户流失)">赵菲菲(21个高优客户流失)</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="footer-title">
          <span className="icon">🔨</span>
          <span className="text">一键管理指令</span>
        </div>
        <div className="action-buttons">
          <button className="action-btn praise" onClick={() => {
            message.success('已一键全员群发战报与表扬！');
          }}>
            <span className="icon"></span> <span>群发战报与表扬</span>
          </button>
          <button className="action-btn punish" onClick={() => {
            message.warning('已向所有预警员工发出大弹窗强提醒！');
          }}>
            <span className="icon"></span> <span>预警员工强提醒</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BossDailyReportCard;