import { HashRouter as Router } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./router";
import "./App.css";
import "./styles/variables.css";

// 设置 dayjs 全局使用中文
dayjs.locale("zh-cn");

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <ThemeProvider>
        <AuthProvider>
          <div className="App">
            <Router>
              <AppRoutes />
            </Router>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;
