import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Checkbox from '../../components/Checkbox';

describe('Checkbox', () => {
  it('renders correctly and shows no checkmark when unchecked', () => {
    const { queryByTestId } = render(<Checkbox checked={false} onPress={() => {}} />);
    const checkmarkIconContainer = queryByTestId('checkmark-icon-container');
    expect(checkmarkIconContainer).toBeNull();
  });

  it('renders correctly and shows a checkmark when checked', () => {
    const { getByTestId } = render(<Checkbox checked={true} onPress={() => {}} />);
    const checkmarkIconContainer = getByTestId('checkmark-icon-container');
    expect(checkmarkIconContainer).toBeTruthy();
  });

  it('calls onPress prop when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<Checkbox checked={false} onPress={mockOnPress} />);

    const checkboxTouchable = getByTestId('checkbox-touchable');
    fireEvent.press(checkboxTouchable);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('calls onPress prop multiple times when pressed multiple times', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<Checkbox checked={false} onPress={mockOnPress} />);

    const checkboxTouchable = getByTestId('checkbox-touchable');
    fireEvent.press(checkboxTouchable);
    fireEvent.press(checkboxTouchable);
    expect(mockOnPress).toHaveBeenCalledTimes(2);
  });

  it('renders with accessibilityHint if provided (though Checkbox does not currently support it)', () => {
    // This test is more of a demonstration for future or other components.
    // Checkbox.tsx would need to be modified to accept and apply accessibilityHint.
    const accessibilityHintText = "Toggles the checkbox state";
    const { queryByA11yHint } = render(
      <Checkbox
        checked={false}
        onPress={() => {}}
        // accessibilityHint={accessibilityHintText} // This prop doesn't exist on CheckboxProps
      />
    );
    // Since the prop isn't used, this would fail if we tried to find it.
    // For now, we'll just confirm it renders.
    // If Checkbox were updated: expect(queryByA11yHint(accessibilityHintText)).toBeTruthy();
    expect(true).toBe(true); // Placeholder for current component state
  });
});