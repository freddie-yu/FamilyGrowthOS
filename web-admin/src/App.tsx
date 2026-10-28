import { useState } from 'react';
import { ConfigProvider, Typography } from 'antd';
import { FGButton } from './ui/FGButton';
import { theme } from './ui/theme';

export default function App() {
  const [presses, setPresses] = useState(0);
  return (
    <ConfigProvider theme={theme}>
      <main className="sample">
        <Typography.Title level={1}>一起看见每一点进步</Typography.Title>
        <Typography.Paragraph>组件适配样例 · 已回应 {presses} 次</Typography.Paragraph>
        <FGButton
          label="记录一次回应"
          variant="primary"
          onPress={() => setPresses((value) => value + 1)}
        />
        <FGButton label="这是一段较长的中文按钮文字，用来检查窄屏换行和触控区域" />
        <FGButton label="暂时休息（已禁用）" disabled />
        <FGButton label="正在准备" loading />
      </main>
    </ConfigProvider>
  );
}
