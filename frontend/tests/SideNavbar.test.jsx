// SideNavbar.test.jsx
import { render, fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SideNavbar from '../src/screens/SideNavbar'; // Adjust the import if necessary
describe('SideNavbar', () => {
    test('sets the correct active class based on the active prop', () => {
      // Render the component with 'accounts' as the active section
      render(<SideNavbar active="accounts" handleClick={vi.fn()} />);
      
      // Check if the "Accounts" button div has the active class
      const accountsButton = screen.getByText('Accounts').closest('div'); // Find the parent div element
      expect(accountsButton).toHaveClass('active');
      
      // Check if other buttons' div elements do not have the active class
      const dashboardButton = screen.getByText('Dashboard').closest('div');
      expect(dashboardButton).not.toHaveClass('active');
      
      const monitoringButton = screen.getByText('Monitoring').closest('div');
      expect(monitoringButton).not.toHaveClass('active');
    });
  });