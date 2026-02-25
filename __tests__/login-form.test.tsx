import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LoginForm from '@/app/(auth)/_components/LoginForm';
import { handleLogin } from '@/lib/actions/auth-action';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/lib/actions/auth-action', () => ({
  handleLogin: jest.fn(),
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
    handleLogin.mockClear();
    localStorage.clear();
  });

  test('1. Should render email and password input fields', () => {
    render(<LoginForm />);
    
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  test('2. Should render login button', () => {
    render(<LoginForm />);
    
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('3. Should render forgot password link', () => {
    render(<LoginForm />);
    
    const forgotLink = screen.getByText('Forgot password?');
    expect(forgotLink).toBeInTheDocument();
  });

  test('4. Should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: '' });
    
    expect(passwordInput.type).toBe('password');
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('text');
  });

});

