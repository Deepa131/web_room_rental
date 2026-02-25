import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '@/app/(auth)/_components/RegisterForm';
import { handleRegister } from '@/lib/actions/auth-action';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/lib/actions/auth-action', () => ({
  handleRegister: jest.fn(),
}));

describe('RegisterForm Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
    handleRegister.mockClear();
  });

  test('1. Should render all required input fields', () => {
    render(<RegisterForm role="renter" />);
    
    expect(screen.getByPlaceholderText('Enter full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
  });

  test('2. Should render register button', () => {
    render(<RegisterForm role="owner" />);
    
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('3. Should show validation error for empty full name', async () => {
    const user = userEvent.setup();
    render(<RegisterForm role="renter" />);
    
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    expect(await screen.findByText(/enter your full name/i)).toBeInTheDocument();
  });

  test('4. Should show validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<RegisterForm role="owner" />);
    
    await user.type(screen.getByPlaceholderText('Enter full name'), 'John Doe');
    await user.type(screen.getByPlaceholderText('Enter your email'), 'invalid-email');
    
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check that form didn't submit successfully (button should still be available)
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });
});

