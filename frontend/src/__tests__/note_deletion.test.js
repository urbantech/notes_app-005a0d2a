import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('../components/NoteDeletion.js', () => {
  return function NoteDeletion({ onDelete }) {
    return (
      <div data-testid="note_deletion-container">
        <button data-testid="delete-button" onClick={onDelete}>
          Delete Note
        </button>
      </div>
    );
  };
});

describe('NoteDeletion Component', () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
      })
    );
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it('renders correctly', () => {
    render(<NoteDeletion onDelete={() => {}} />);
    expect(screen.getByTestId('note_deletion-container')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const onDelete = jest.fn();
    render(<NoteDeletion onDelete={onDelete} />);
    userEvent.click(screen.getByTestId('delete-button'));
    await waitFor(() => expect(onDelete).toHaveBeenCalled());
  });

  it('shows loading state while deleting', async () => {
    mockFetch.mockImplementationOnce(() =>
      new Promise((resolve) => setTimeout(resolve, 200))
    );

    render(
      <NoteDeletion
        onDelete={() => fetch('https://api.ainative.studio/notes/1')}
      />
    );
    userEvent.click(screen.getByTestId('delete-button'));

    // Assuming loading state is shown with a specific test id or text
    expect(await screen.findByText(/Deleting.../i)).toBeInTheDocument();
  });

  it('handles API errors', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: 'Failed to delete note' }),
        ok: false,
      })
    );

    render(
      <NoteDeletion
        onDelete={() => fetch('https://api.ainative.studio/notes/1')}
      />
    );
    userEvent.click(screen.getByTestId('delete-button'));

    await waitFor(() =>
      expect(screen.getByText(/Failed to delete note/i)).toBeInTheDocument()
    );
  });

  it('is accessible', () => {
    render(<NoteDeletion onDelete={() => {}} />);
    const button = screen.getByTestId('delete-button');
    expect(button).toHaveAttribute('aria-label', 'Delete Note');
  });
});