import type { PropsWithChildren } from 'react';

/** Unit-test host only; this is not a weapp runtime or device verification. */
export function Button({
  children,
  className,
  hoverClass,
  disabled,
  loading,
  onClick,
}: PropsWithChildren<{
  className: string;
  hoverClass: string;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      className={className}
      data-hover-class={hoverClass}
      data-loading={loading}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
