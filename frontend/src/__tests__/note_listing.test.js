import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteListing from '../components/NoteListing';

const mockNotes = [
  { id: 1, title: 'Note 1', content: 'This is the first note' },
  { id: 2, title: 'Note 2', content: 'This is the second note' },
];

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch.mockReset();
  delete global.fetch;
});

test('renders correctly with notes', async () => {
  global.fetch.mockResolvedValue({
    json: jest.fn().mockResolvedValue(mockNotes),
    ok: true,
  });

  render(<NoteListing />);
  await waitFor(() => expect(screen.getByTestId('note_listing-container')).toBeInTheDocument());

  expect(screen.getByText(/Note 1/i)).toBeInTheDocument();
  expect(screen.getByText(/Note 2/i)).toBeInTheDocument();
});

test('shows loading state while fetching notes', () => {
  render(<NoteListing />);
  expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
});

test('handles API errors by showing error message', async () => {
  global.fetch.mockResolvedValue({
    json: jest.fn().mockResolvedValue({ error: 'Failed to fetch notes' }),
    ok: false,
  });

  render(<NoteListing />);
  await waitFor(() => expect(screen.getByText(/Failed to fetch notes/i)).toBeInTheDocument());
});

test('deletes a note when delete button is clicked', async () => {
  global.fetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue(mockNotes),
    ok: true,
  }).mockResolvedValueOnce({
    ok: true,
  });

  render(<NoteListing />);
  await waitFor(() => expect(screen.getByText(/Note 1/i)).toBeInTheDocument());

  const deleteButton = screen.getAllByRole('button', { name: /Delete/i })[0];
  userEvent.click(deleteButton);

  await waitFor(() => expect(screen.queryByText(/Note 1/i)).not.toBeInTheDocument());
});

test('is accessible', async () => {
  global.fetch.mockResolvedValue({
    json: jest.fn().mockResolvedValue(mockNotes),
    ok: true,
  });

  render(<NoteListing />);
  await waitFor(() => expect(screen.getByTestId('note_listing-container')).toBeInTheDocument());

  expect(screen.getByText(/Note 1/i)).toHaveAttribute('aria-label', 'Note 1');
  expect(screen.getByText(/Note 2/i)).toHaveAttribute('aria-label', 'Note 2');
});