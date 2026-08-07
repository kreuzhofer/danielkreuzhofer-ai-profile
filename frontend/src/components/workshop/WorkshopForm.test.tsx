import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkshopForm } from './WorkshopForm';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe('WorkshopForm', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders all required form sections', () => {
    render(<WorkshopForm slug="ki-souveraenitaet" />);
    expect(screen.getByText(/Anmeldende Person/)).toBeInTheDocument();
    expect(screen.getByText(/Rechnungsempfänger/)).toBeInTheDocument();
    expect(screen.getByText(/Zahlung \+ Newsletter/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Platz reservieren/ })).toBeInTheDocument();
  });

  it('shows USt-IdNr field when not Kleinunternehmer', () => {
    render(<WorkshopForm slug="ki-souveraenitaet" />);
    expect(screen.getByLabelText(/USt-IdNr.*Format/)).toBeInTheDocument();
  });

  it('hides USt-IdNr field when Kleinunternehmer checkbox is checked', () => {
    render(<WorkshopForm slug="ki-souveraenitaet" />);
    const checkbox = screen.getByLabelText(/Kleinunternehmer/);
    fireEvent.click(checkbox);
    expect(screen.queryByLabelText(/USt-IdNr.*Format/)).not.toBeInTheDocument();
  });

  it('shows inline „Schau in Dein Postfach" after successful submit', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: true }),
    });
    render(<WorkshopForm slug="ki-souveraenitaet" />);

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Vorname/), { target: { value: 'Max' } });
    fireEvent.change(screen.getByLabelText(/Nachname/), { target: { value: 'Mustermann' } });
    fireEvent.change(screen.getByLabelText(/^E-Mail \*/), { target: { value: 'max@firma.de' } });
    fireEvent.change(screen.getByLabelText(/^Firma \*/), { target: { value: 'Mustermann GmbH' } });
    fireEvent.change(screen.getByLabelText(/Firmenname/), { target: { value: 'Mustermann GmbH' } });
    fireEvent.change(screen.getByLabelText(/Ansprechpartner/), { target: { value: 'Max Mustermann' } });
    fireEvent.change(screen.getByLabelText(/E-Mail für Rechnung/), { target: { value: 'max@firma.de' } });
    fireEvent.change(screen.getByLabelText(/Straße/), { target: { value: 'Hauptstr. 1' } });
    fireEvent.change(screen.getByLabelText(/PLZ/), { target: { value: '10115' } });
    fireEvent.change(screen.getByLabelText(/Ort/), { target: { value: 'Berlin' } });
    fireEvent.change(screen.getByLabelText(/USt-IdNr.*Format/), { target: { value: 'DE123456789' } });

    fireEvent.click(screen.getByRole('button', { name: /Platz reservieren/ }));

    await waitFor(() => {
      expect(screen.getByText(/Schau in Dein Postfach/)).toBeInTheDocument();
    });
  });

  it('shows SOLD_OUT error message when API returns SOLD_OUT', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: false, code: 'SOLD_OUT' }),
    });
    render(<WorkshopForm slug="ki-souveraenitaet" />);

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Vorname/), { target: { value: 'Max' } });
    fireEvent.change(screen.getByLabelText(/Nachname/), { target: { value: 'Mustermann' } });
    fireEvent.change(screen.getByLabelText(/^E-Mail \*/), { target: { value: 'max@firma.de' } });
    fireEvent.change(screen.getByLabelText(/^Firma \*/), { target: { value: 'Mustermann GmbH' } });
    fireEvent.change(screen.getByLabelText(/Firmenname/), { target: { value: 'Mustermann GmbH' } });
    fireEvent.change(screen.getByLabelText(/Ansprechpartner/), { target: { value: 'Max Mustermann' } });
    fireEvent.change(screen.getByLabelText(/E-Mail für Rechnung/), { target: { value: 'max@firma.de' } });
    fireEvent.change(screen.getByLabelText(/Straße/), { target: { value: 'Hauptstr. 1' } });
    fireEvent.change(screen.getByLabelText(/PLZ/), { target: { value: '10115' } });
    fireEvent.change(screen.getByLabelText(/Ort/), { target: { value: 'Berlin' } });
    fireEvent.change(screen.getByLabelText(/USt-IdNr.*Format/), { target: { value: 'DE123456789' } });

    fireEvent.click(screen.getByRole('button', { name: /Platz reservieren/ }));

    await waitFor(() => {
      expect(screen.getByText(/Alle Plätze sind belegt/)).toBeInTheDocument();
    });
  });
});
