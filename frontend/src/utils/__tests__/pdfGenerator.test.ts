"""
Test PDF generation utility.
"""
import { jest } from '@jest/globals';

const mockSave = jest.fn();
const mockSetFontSize = jest.fn();
const mockSetTextColor = jest.fn();
const mockText = jest.fn();
const mockInternal = {
  pageSize: {
    getWidth: () => 210,
    getHeight: () => 297,
  },
};
const mockLastAutoTable = { finalY: 100 };

jest.unstable_mockModule('jspdf', () => ({
  default: jest.fn().mockImplementation(() => ({
    setFontSize: mockSetFontSize,
    setTextColor: mockSetTextColor,
    text: mockText,
    internal: mockInternal,
    save: mockSave,
    lastAutoTable: mockLastAutoTable,
  })),
}));

jest.unstable_mockModule('jspdf-autotable', () => ({
  default: jest.fn(),
}));

describe('PDF Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be importable', async () => {
    const { generateTasksPDF } = await import('@/utils/pdfGenerator');
    expect(typeof generateTasksPDF).toBe('function');
  });

  it('should generate PDF with stats', async () => {
    const { generateTasksPDF } = await import('@/utils/pdfGenerator');

    const stats = {
      total_tasks: 10,
      completed_tasks: 5,
      completion_rate: 50,
      streak_current: 3,
      streak_best: 7,
    };

    const tasks: any[] = [];

    generateTasksPDF(tasks, stats, { title: 'Test Report' });

    expect(mockSetFontSize).toHaveBeenCalledWith(20);
    expect(mockText).toHaveBeenCalled();
  });
});
