import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from './page';

// Mock the ConnectRPC client
jest.mock('./gen/calculator/calculator_connect', () => ({
  CalculatorService: {
    get name() {
      return 'CalculatorService';
    },
  },
}));

jest.mock('@connectrpc/connect-web', () => ({
  createPromiseClient: jest.fn(() => ({
    calculate: jest.fn((request) => {
      const { num1, num2, operation } = request;
      let result;
      
      switch (operation) {
        case '+':
          result = num1 + num2;
          break;
        case '-':
          result = num1 - num2;
          break;
        case '*':
          result = num1 * num2;
          break;
        case '/':
          if (num2 === 0) throw new Error('division by zero');
          result = num1 / num2;
          break;
        default:
          throw new Error('invalid operation');
      }
      
      return Promise.resolve({ result });
    }),
  })),
  createConnectTransport: jest.fn(),
}));

describe('Calculator Page', () => {
  beforeEach(() => {
    render(<Page />);
  });

  it('renders the calculator form', () => {
    expect(screen.getByText('Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText('First Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Operation')).toBeInTheDocument();
    expect(screen.getByLabelText('Second Number')).toBeInTheDocument();
    expect(screen.getByText('Calculate')).toBeInTheDocument();
  });

  it('performs addition correctly', async () => {
    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText('First Number'), '5');
    await user.selectOptions(screen.getByLabelText('Operation'), '+');
    await user.type(screen.getByLabelText('Second Number'), '3');
    await user.click(screen.getByText('Calculate'));
    
    await waitFor(() => {
      expect(screen.getByText('Result: 8')).toBeInTheDocument();
    });
  });

  it('performs division correctly', async () => {
    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText('First Number'), '6');
    await user.selectOptions(screen.getByLabelText('Operation'), '/');
    await user.type(screen.getByLabelText('Second Number'), '3');
    await user.click(screen.getByText('Calculate'));
    
    await waitFor(() => {
      expect(screen.getByText('Result: 2')).toBeInTheDocument();
    });
  });

  it('shows error for division by zero', async () => {
    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText('First Number'), '5');
    await user.selectOptions(screen.getByLabelText('Operation'), '/');
    await user.type(screen.getByLabelText('Second Number'), '0');
    await user.click(screen.getByText('Calculate'));
    
    await waitFor(() => {
      expect(screen.getByText(/division by zero/i)).toBeInTheDocument();
    });
  });

  it('updates UI when inputs change', async () => {
    const num1Input = screen.getByLabelText('First Number') as HTMLInputElement;
    const num2Input = screen.getByLabelText('Second Number') as HTMLInputElement;
    const operationSelect = screen.getByLabelText('Operation') as HTMLSelectElement;
    
    fireEvent.change(num1Input, { target: { value: '10' } });
    fireEvent.change(num2Input, { target: { value: '2' } });
    fireEvent.change(operationSelect, { target: { value: '*' } });
    
    expect(num1Input.value).toBe('10');
    expect(num2Input.value).toBe('2');
    expect(operationSelect.value).toBe('*');
  });
});
