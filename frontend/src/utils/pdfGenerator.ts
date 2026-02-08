export interface TaskData {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: string;
  category?: string;
  due_date?: string;
  created_at: string;
}

export interface UserStatsData {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  streak_current: number;
  streak_best: number;
}

interface PDFReportOptions {
  title?: string;
  includeTasks?: boolean;
  includeStats?: boolean;
  dateRange?: { start: string; end: string };
}

export async function generateTasksPDF(
  tasks: TaskData[],
  stats: UserStatsData,
  options: PDFReportOptions = {}
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
  const { title = 'Task Report', includeTasks = true, includeStats = true } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setTextColor(249, 115, 22);
  doc.text(title, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });

  let yPos = 40;

  if (includeStats) {
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Statistics Overview', 14, yPos);
    yPos += 8;

    const statsData = [
      ['Total Tasks', stats.total_tasks.toString()],
      ['Completed Tasks', stats.completed_tasks.toString()],
      ['Completion Rate', `${stats.completion_rate}%`],
      ['Current Streak', `${stats.streak_current} days`],
      ['Best Streak', `${stats.streak_best} days`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: statsData,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] },
      margin: { left: 14 },
      tableWidth: 'auto',
    });

    // @ts-expect-error - autoTable types don't match our usage
    yPos = doc.lastAutoTable.finalY + 15;
  }

  if (includeTasks && tasks.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Task List', 14, yPos);
    yPos += 8;

    const taskRows = tasks.map(task => [
      task.title,
      task.priority || '-',
      task.category || '-',
      task.due_date ? new Date(task.due_date).toLocaleDateString() : '-',
      task.completed ? 'Completed' : 'Pending',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Title', 'Priority', 'Category', 'Due Date', 'Status']],
      body: taskRows,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] },
      margin: { left: 14 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
    });

    // @ts-expect-error - autoTable types don't match our usage
    yPos = doc.lastAutoTable.finalY + 10;
  }

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('TaskFlow - Task Management System', 14, doc.internal.pageSize.getHeight() - 10);

  const filename = options.title ? `${options.title.toLowerCase().replace(/\s+/g, '-')}.pdf` : 'task-report.pdf';
  doc.save(filename);
}

export async function generateWeeklyReportPDF(
  stats: UserStatsData,
  weeklyData: Record<string, number>,
  options: PDFReportOptions = {}
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const { title = 'Weekly Productivity Report' } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setTextColor(249, 115, 22);
  doc.text(title, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const dateRange = options.dateRange || {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    end: new Date().toLocaleDateString(),
  };
  doc.text(`Period: ${dateRange.start} - ${dateRange.end}`, pageWidth / 2, 28, { align: 'center' });

  let yPos = 45;

  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Weekly Statistics', 14, yPos);
  yPos += 8;

  const statsData = [
    ['Total Tasks This Week', stats.total_tasks.toString()],
    ['Tasks Completed', stats.completed_tasks.toString()],
    ['Completion Rate', `${stats.completion_rate}%`],
    ['Current Streak', `${stats.streak_current} days`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: statsData,
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22] },
    margin: { left: 14 },
    tableWidth: 'auto',
  });

  // @ts-expect-error - jsPDF-autoTable integration
  yPos = doc.lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Daily Activity', 14, yPos);
  yPos += 8;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activityRows = days.map(day => [
    day,
    (weeklyData[day.toLowerCase()] || 0).toString(),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Day', 'Tasks Completed']],
    body: activityRows,
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22] },
    margin: { left: 14 },
    tableWidth: 'auto',
  });

  const filename = options.title ? `${options.title.toLowerCase().replace(/\s+/g, '-')}.pdf` : 'weekly-report.pdf';
  doc.save(filename);
}

export function downloadPDF(doc: { save: (filename: string) => void }, filename: string): void {
  doc.save(filename);
}
