import { Button } from '@tarojs/components';
import type { FGButtonProps } from '@family-growth/shared';
import tokens from '../../shared/ui/tokens.json';
import './FGButton.scss';

export function FGButton({
  label,
  variant = 'secondary',
  disabled = false,
  loading = false,
  onPress,
}: FGButtonProps) {
  const blocked = disabled || loading;
  return (
    <Button
      className={`fg-button fg-button--${variant}${blocked ? ' fg-button--disabled' : ''}`}
      hoverClass={blocked ? 'none' : 'fg-button--pressed'}
      hoverStartTime={0}
      hoverStayTime={tokens.motion.fast}
      disabled={blocked}
      loading={loading}
      onClick={() => {
        if (!blocked) onPress?.();
      }}
    >
      {label}
    </Button>
  );
}
