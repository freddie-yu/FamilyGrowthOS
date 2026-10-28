/** Project-owned adapter contract, UI_CONTRACT v1.1. No framework or platform event types. */
export type FGButtonVariant = 'primary' | 'secondary' | 'danger' | 'text';

export interface FGButtonProps {
  label: string;
  variant?: FGButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
}
