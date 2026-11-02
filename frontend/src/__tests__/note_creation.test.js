import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
});

describe('NoteCreation Component', () => {
  test('renders correctly', () => {
    render(<NoteCreation />);
    expect(screen.getByTestId('note_creation-container')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your note here...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    const mockCreateNote = jest.fn().mockResolvedValue({ ok: true });
    global.fetch.mockImplementation(mockCreateNote);

    render(<NoteCreation />);
    const inputField = screen.getByPlaceholderText('Enter your note here...');
    const createButton = screen.getByRole('button', { name: /create/i });

    userEvent.type(inputField, 'This is a new note');
    userEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalledWith(
        'https://api.ainative.studio/api/v1/notes',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': expect.any(String),
          }),
          body: JSON.stringify({ content: 'This is a new note' }),
        })
      );
    });
  });

  test('shows loading state', async () => {
    const mockCreateNote = jest.fn().mockImplementation(() => new Promise(() => {}));
    global.fetch.mockImplementation(mockCreateNote);

    render(<NoteCreation />);
    const inputField = screen.getByPlaceholderText('Enter your note here...');
    const createButton = screen.getByRole('button', { name: /create/i });

    userEvent.type(inputField, 'Loading note');
    userEvent.click(createButton);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('handles API errors', async () => {
    const mockCreateNote = jest.fn().mockResolvedValue({ ok: false, statusText: 'Failed to create note' });
    global.fetch.mockImplementation(mockCreateNote);

    render(<NoteCreation />);
    const inputField = screen.getByPlaceholderText('Enter your note here...');
    const createButton = screen.getByRole('button', { name: /create/i });

    userEvent.type(inputField, 'Error note');
    userEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create note/i)).toBeInTheDocument();
    });
  });

  test('is accessible', () => {
    const { container } = render(<NoteCreation />);
    expect(container).toHaveAccessibleName(/create a new note/i);
    expect(screen.getByPlaceholderText('Enter your note here...')).toBeRequired();
    expect(screen.getByRole('button', { name: /create/i })).toBeEnabled();
  });
});