import type { ThemeConfig } from 'antd';
import tokens from '../../../shared/ui/tokens.json';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: tokens.color.primary.default,
    colorSuccess: tokens.color.status.success,
    colorWarning: tokens.color.status.warning,
    colorError: tokens.color.status.error,
    colorText: tokens.color.text.body,
    colorTextHeading: tokens.color.text.heading,
    colorBgBase: tokens.color.background.page,
    colorBgContainer: tokens.color.background.content,
    colorBorder: tokens.color.border.default,
    colorTextDisabled: tokens.color.text.disabled,
    colorBgContainerDisabled: tokens.color.background.disabled,
    fontFamily: tokens.font.family,
    fontSize: tokens.font.size.body,
    borderRadius: tokens.radius.base,
    controlHeight: tokens.control.minTouchSize,
    lineWidth: tokens.border.width.default,
    motionDurationFast: `${tokens.motion.fast / 1000}s`,
    motionDurationMid: `${tokens.motion.default / 1000}s`,
    motionDurationSlow: `${tokens.motion.slow / 1000}s`,
    motionEaseInOut: tokens.motion.easing,
  },
  components: {
    Button: {
      borderRadius: tokens.radius.pill,
      primaryColor: tokens.color.text.onPrimary,
      primaryShadow: tokens.shadow.button.primary,
    },
  },
};
