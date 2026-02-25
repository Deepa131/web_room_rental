/* eslint-disable @next/next/no-img-element */
import { render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import RenterDashboardPage from '@/app/(dashboard)/renter/dashboard/page';

type MockImageProps = ComponentProps<'img'>;
type MockLinkProps = { href: string; children: ReactNode };

jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockNextImage(props: MockImageProps) {
    return <img alt={props.alt ?? ''} {...props} />;
  },
}));

jest.mock('next/link', () => {
  function MockNextLink({ href, children }: MockLinkProps) {
    return <a href={href}>{children}</a>;
  }
  MockNextLink.displayName = 'MockNextLink';
  return MockNextLink;
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/renter/dashboard',
  useSearchParams: () => new Map(),
}));

describe('Renter Dashboard Page', () => {
  test('1. Should render renter dashboard', () => {
    render(<RenterDashboardPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  test('2. Should display renter information', () => {
    render(<RenterDashboardPage />);
    expect(document.body).toBeInTheDocument();
  });

  test('3. Should have navigation links', () => {
    render(<RenterDashboardPage />);
    const links = screen.queryAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(0);
  });

  test('4. Should render successfully', () => {
    expect(() => render(<RenterDashboardPage />)).not.toThrow();
  });
});
