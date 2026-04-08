/**
 * 主題演示頁面
 */
import React from 'react'
import { useTheme, useThemeColors } from '../../hooks/useTheme'
import ThemeToggle from '../../components/ThemeToggle'
import './index.less'

const ThemeDemo: React.FC = () => {
  const { currentTheme, themeConfig } = useTheme()
  const colors = useThemeColors()
  return (
    <div className="theme-demo">
      <div className="theme-demo-header">
        <h1>主題系統演示</h1>
        <div className="theme-controls">
          <ThemeToggle />
        </div>
      </div>

      <div className="theme-demo-content">
        {/* 當前主題信息 */}
        <div className="theme-info-card">
          <h2>當前主題信息</h2>
          <div className="theme-info">
            <p><strong>主題名稱：</strong>{themeConfig.name}</p>
            <p><strong>主題類型：</strong>{currentTheme}</p>
            <p><strong>是否深色：</strong>{currentTheme === 'dark' ? '是' : '否'}</p>
          </div>
        </div>

        {/* 顏色展示 */}
        <div className="color-showcase">
          <h2>主題顏色</h2>
          <div className="color-grid">
            <div className="color-item">
              <div 
                className="color-swatch" 
                style={{ backgroundColor: colors.primary }}
              ></div>
              <span className="color-name">主色調</span>
              <span className="color-value">{colors.primary}</span>
            </div>
            <div className="color-item">
              <div 
                className="color-swatch" 
                style={{ backgroundColor: colors.success }}
              ></div>
              <span className="color-name">成功色</span>
              <span className="color-value">{colors.success}</span>
            </div>
            <div className="color-item">
              <div 
                className="color-swatch" 
                style={{ backgroundColor: colors.warning }}
              ></div>
              <span className="color-name">警告色</span>
              <span className="color-value">{colors.warning}</span>
            </div>
            <div className="color-item">
              <div 
                className="color-swatch" 
                style={{ backgroundColor: colors.error }}
              ></div>
              <span className="color-name">錯誤色</span>
              <span className="color-value">{colors.error}</span>
            </div>
          </div>
        </div>

        {/* 組件展示 */}
        <div className="component-showcase">
          <h2>組件展示</h2>
          <div className="component-grid">
            {/* 按鈕組件 */}
            <div className="component-section">
              <h3>按鈕</h3>
              <div className="button-group">
                <button className="btn btn-primary">主要按鈕</button>
                <button className="btn btn-success">成功按鈕</button>
                <button className="btn btn-warning">警告按鈕</button>
                <button className="btn btn-error">錯誤按鈕</button>
              </div>
            </div>

            {/* 卡片組件 */}
            <div className="component-section">
              <h3>卡片</h3>
              <div className="card">
                <div className="card-header">
                  <h4>卡片標題</h4>
                </div>
                <div className="card-body">
                  <p>這是一個使用主題顏色的卡片組件。</p>
                  <p>背景色和文字顏色會根據當前主題自動調整。</p>
                </div>
                <div className="card-footer">
                  <button className="btn btn-primary">操作</button>
                </div>
              </div>
            </div>

            {/* 表單組件 */}
            <div className="component-section">
              <h3>表單</h3>
              <div className="form-group">
                <label>輸入框</label>
                <input type="text" placeholder="請輸入內容" />
              </div>
              <div className="form-group">
                <label>選擇框</label>
                <select>
                  <option>選項1</option>
                  <option>選項2</option>
                  <option>選項3</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 漸變色展示 */}
        <div className="gradient-showcase">
          <h2>漸變色</h2>
          <div className="gradient-grid">
            <div 
              className="gradient-item"
              style={{ 
                background: `linear-gradient(45deg, ${colors.gradient1}, ${colors.gradient2})` 
              }}
            >
              漸變1
            </div>
            <div 
              className="gradient-item"
              style={{ 
                background: `linear-gradient(45deg, ${colors.gradient2}, ${colors.gradient3})` 
              }}
            >
              漸變2
            </div>
            <div 
              className="gradient-item"
              style={{ 
                background: `linear-gradient(45deg, ${colors.gradient3}, ${colors.gradient4})` 
              }}
            >
              漸變3
            </div>
            <div 
              className="gradient-item"
              style={{ 
                background: `linear-gradient(45deg, ${colors.gradient4}, ${colors.gradient5})` 
              }}
            >
              漸變4
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeDemo
