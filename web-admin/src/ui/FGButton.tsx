import { Button } from 'antd';
import type { FGButtonProps } from '@family-growth/shared';

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
      className="fg-button"
      type={variant === 'primary' ? 'primary' : variant === 'text' ? 'text' : 'default'}
      danger={variant === 'danger'}
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
