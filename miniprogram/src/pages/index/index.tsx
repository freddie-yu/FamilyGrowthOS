import { useState } from 'react';
import { Text, View } from '@tarojs/components';
import { FGButton } from '../../../ui';
import type { PublicAppConfig } from '@family-growth/shared';
import './index.scss';

const config: PublicAppConfig = {
  environment: __FG_ENVIRONMENT__,
  apiBaseUrl: __FG_API_BASE_URL__,
};

export default function Index() {
  const [presses, setPresses] = useState(0);
  return (
    <View className="sample">
      <Text className="sample__title">和伙伴一起，慢慢向前</Text>
      <Text>已回应 {presses} 次</Text>
      <FGButton
        label="向伙伴打招呼"
        variant="primary"
        onPress={() => setPresses((value) => value + 1)}
      />
      <FGButton label="这是一段较长的中文按钮文字，用来检查窄屏换行和触控区域" />
      <FGButton label="暂时休息（已禁用）" disabled />
      <FGButton label="正在准备" loading />
      <Text className="sample__note">组件样例 · {config.environment}</Text>
    </View>
  );
}
