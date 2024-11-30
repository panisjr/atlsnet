import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest'; 
import DataTable from '../src/screens/account/DataTable';

describe('DataTable', () => {
  it('calls onEdit when the edit button is clicked', async () => {
    const mockHandlers = {
      onEdit: vi.fn(), 
      onDelete: vi.fn(),
      onActivate: vi.fn(),
      onDeactivate: vi.fn(),
    };

    render(<DataTable users={[{ user_id: 1, firstname: 'John', lastname: 'Doe', middlename: 'A', email: 'john@example.com', contact: '123456789', address: '123 Main St', role: 'Admin', status: 'Active' }]} {...mockHandlers} />);

    // Log the DOM to check if the button is rendered
    screen.debug();

    // Wait for the edit button to appear and click it
    const editButton = await screen.findByText(/edit/i); // Use getByText for exact match
    fireEvent.click(editButton);

    // Assert that the onEdit mock function was called
    expect(mockHandlers.onEdit).toHaveBeenCalled();
  });
});
