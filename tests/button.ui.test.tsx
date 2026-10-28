import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { FGButton as MiniButton } from '../miniprogram/ui/FGButton';
import { FGButton as WebButton } from '../web-admin/src/ui/FGButton';

afterEach(cleanup);
describe.each([
  ['Taro unit host', MiniButton],
  ['Ant Design', WebButton],
] as const)('%s FGButton', (_name, Component) => {
  test('emits exactly one payload-free intent per press', () => {
    const onPress = jest.fn();
    render(<Component label="向伙伴打招呼" variant="primary" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: '向伙伴打招呼' }));
    expect(onPress.mock.calls).toEqual([[]]);
  });
  test.each([{ disabled: true }, { loading: true }, { disabled: true, loading: true }])(
    'suppresses presses for %j',
    (state) => {
      const onPress = jest.fn();
      render(<Component label="稍等一下" {...state} onPress={onPress} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(onPress).not.toHaveBeenCalled();
    },
  );
  test.each(['secondary', 'danger', 'text'] as const)(
    'supports %s and an optional handler',
    (variant) => {
      render(
        <Component
          label="这是一段较长的中文按钮文字，用来检查窄屏换行和触控区域"
          variant={variant}
        />,
      );
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('button')).toHaveTextContent('中文按钮文字');
    },
  );
});

test('Taro default/pressed/disabled classes use native touch feedback', () => {
  const { rerender } = render(<MiniButton label="伙伴" />);
  expect(screen.getByRole('button')).toHaveClass('fg-button--secondary');
  expect(screen.getByRole('button')).toHaveAttribute('data-hover-class', 'fg-button--pressed');
  rerender(<MiniButton label="伙伴" disabled />);
  expect(screen.getByRole('button')).toHaveAttribute('data-hover-class', 'none');
});
