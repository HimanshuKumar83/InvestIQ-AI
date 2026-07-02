import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import type { InvestmentReport } from './types';

const formatDate = () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const exportReportPdf = (report: InvestmentReport) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = 50;

  // Colors mapping based on Recommendation
  const rec = report.decision.recommendation;
  let recTextColor = [16, 185, 129]; // Green for BUY
  if (rec === 'HOLD') recTextColor = [245, 158, 11]; // Orange
  if (rec === 'PASS') recTextColor = [239, 68, 68]; // Red

  const colors = {
    verdict: { r: 37, g: 99, b: 235 }, // Blue
    sentiment: { r: 249, g: 115, b: 22 }, // Orange
    bull: { r: 16, g: 185, b: 129 }, // Green
    bear: { r: 239, g: 68, b: 68 }, // Red
    risks: { r: 245, g: 158, b: 11 }, // Amber
    catalysts: { r: 37, g: 99, b: 235 }, // Blue
    reasoning: { r: 139, g: 92, b: 246 }, // Purple
    articles: { r: 249, g: 115, b: 22 }, // Orange
    sources: { r: 37, g: 99, b: 235 } // Blue
  };

  const drawFooter = (pageNum: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    
    const footerText1 = `InvestIQ AI · AI-Powered Investment Research · Page ${pageNum}/3`;
    const footerText2 = 'InsideIIM × Altuni AI Labs';
    
    doc.text(footerText1, pageWidth / 2, pageHeight - 30, { align: 'center' });
    doc.text(footerText2, pageWidth / 2, pageHeight - 18, { align: 'center' });
  };

  const drawSectionHeader = (title: string, yPos: number, color: { r: number, g: number, b: number }) => {
    doc.setFillColor(color.r, color.g, color.b);
    doc.rect(40, yPos - 11, 4, 13, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(title, 52, yPos);
  };

  const drawNumberedList = (items: string[], startNum: number) => {
    doc.setTextColor(51, 65, 85); // Slate 700
    items.forEach((item, idx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      const bulletText = `${startNum + idx}. `;
      doc.setFont('helvetica', 'bold');
      doc.text(bulletText, 40, y);
      
      doc.setFont('helvetica', 'normal');
      const itemLines = doc.splitTextToSize(item, pageWidth - margin * 2 - 15);
      doc.text(itemLines, 55, y);
      y += itemLines.length * 12 + 6;
    });
  };

  // ==========================================
  // PAGE 1: Banner, Verdict, Sentiment, Bull Case (pt 1-2)
  // ==========================================
  
  // Blue banner background
  doc.setFillColor(37, 99, 235); // Blue (#2563EB)
  doc.rect(0, 0, pageWidth, 95, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('InvestIQ AI', 40, 42);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('AI-Powered Investment Research Report', 40, 62);

  // Date
  doc.setFontSize(8.5);
  doc.text(`Generated: ${formatDate()}`, 40, 80);

  // Subheader bar just below the banner
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.rect(0, 95, pageWidth, 40, 'F');

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(report.company.name, 40, 120);

  // Ticker and Exchange info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  const exchangeLabel = report.company.companyApiSource || 'NASDAQ';
  const tickerAndExchange = `${report.company.ticker || 'N/A'} · ${exchangeLabel.toUpperCase()}`;
  doc.text(tickerAndExchange, 40 + doc.getTextWidth(report.company.name) + 6, 120);

  y = 165;

  // Verdict Section
  drawSectionHeader('Investment Verdict', y, colors.verdict);
  y += 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(recTextColor[0], recTextColor[1], recTextColor[2]);
  doc.text(rec, 40, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(`Confidence: ${report.decision.confidenceScore}%`, 140, y - 2);
  y += 16;

  doc.setFont('helvetica', 'oblique');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const decisionSummary = report.decision.shortSummary || report.decision.detailedExplanation;
  const decisionSummaryLines = doc.splitTextToSize(decisionSummary, pageWidth - margin * 2);
  doc.text(decisionSummaryLines, 40, y);
  y += decisionSummaryLines.length * 12 + 20;

  // Sentiment Analysis Section
  drawSectionHeader('Sentiment Analysis', y, colors.sentiment);
  y += 20;

  // Overall sentiment indicator
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  const score = report.news.sentimentScore !== undefined ? report.news.sentimentScore : 0.50;
  let overallLabel = `Overall: Neutral (Score: ${score.toFixed(2)})`;
  if (score >= 0.70) overallLabel = `Overall: Bullish (Score: ${score.toFixed(2)})`;
  if (score <= 0.35) overallLabel = `Overall: Bearish (Score: ${score.toFixed(2)})`;
  
  if (score >= 0.70) doc.setTextColor(16, 185, 129);
  else if (score <= 0.35) doc.setTextColor(239, 68, 68);
  else doc.setTextColor(245, 158, 11);
  doc.text(overallLabel, 40, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const sentSummary = report.news.sentimentSummary;
  const sentSummaryLines = doc.splitTextToSize(sentSummary, pageWidth - margin * 2);
  doc.text(sentSummaryLines, 40, y);
  y += sentSummaryLines.length * 12 + 15;

  // Red Flags List
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(239, 68, 68); // Red
  doc.text('Red Flags:', 40, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const negativePills = report.news.negativePills || [];
  negativePills.forEach((pill) => {
    const lines = doc.splitTextToSize(`• ${pill}`, pageWidth - margin * 2 - 10);
    doc.text(lines, 48, y);
    y += lines.length * 11 + 3;
  });
  y += 12;

  // Catalysts List
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129); // Green
  doc.text('Catalysts:', 40, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const positivePills = report.news.positivePills || [];
  positivePills.forEach((pill) => {
    const lines = doc.splitTextToSize(`• ${pill}`, pageWidth - margin * 2 - 10);
    doc.text(lines, 48, y);
    y += lines.length * 11 + 3;
  });
  y += 24;

  // Bull Case (pt 1-2)
  drawSectionHeader('Bull Case', y, colors.bull);
  y += 18;
  drawNumberedList(report.debate.bullCase.arguments.slice(0, 2), 1);

  // Draw Page 1 footer
  drawFooter(1);

  // ==========================================
  // PAGE 2: Bull Case (pt 3-5), Bear Case, Key Risks, Key Catalysts, Full Reasoning (Part 1)
  // ==========================================
  doc.addPage();
  y = 45;

  // Bull Case continued
  drawNumberedList(report.debate.bullCase.arguments.slice(2, 5), 3);
  y += 10;

  // Bear Case
  drawSectionHeader('Bear Case', y, colors.bear);
  y += 18;
  drawNumberedList(report.debate.bearCase.arguments, 1);
  y += 10;

  // Key Risks
  drawSectionHeader('Key Risks', y, colors.risks);
  y += 18;
  drawNumberedList(report.decision.topRisks.slice(0, 3), 1);
  y += 10;

  // Key Catalysts
  drawSectionHeader('Key Catalysts', y, colors.catalysts);
  y += 18;
  if (report.decision.keyCatalysts) {
    drawNumberedList(report.decision.keyCatalysts.slice(0, 3), 1);
  }
  y += 10;

  // Full Reasoning (Part 1)
  drawSectionHeader('Full Reasoning', y, colors.reasoning);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  
  const paragraphs = report.decision.detailedExplanation.split(/\n\n+/);
  
  // Render first two paragraphs on page 2
  const p1Lines = doc.splitTextToSize(paragraphs[0] || '', pageWidth - margin * 2);
  doc.text(p1Lines, 40, y);
  y += p1Lines.length * 12 + 10;
  
  if (paragraphs[1]) {
    const p2Lines = doc.splitTextToSize(paragraphs[1], pageWidth - margin * 2);
    doc.text(p2Lines, 40, y);
    y += p2Lines.length * 12 + 10;
  }

  // Draw Page 2 footer
  drawFooter(2);

  // ==========================================
  // PAGE 3: Full Reasoning (Part 2), News Table, Research Sources
  // ==========================================
  doc.addPage();
  y = 45;

  // Render remaining paragraphs on page 3
  if (paragraphs.slice(2).length > 0) {
    paragraphs.slice(2).forEach((para) => {
      const pLines = doc.splitTextToSize(para, pageWidth - margin * 2);
      doc.text(pLines, 40, y);
      y += pLines.length * 12 + 10;
    });
  }

  // News Articles Analyzed Table
  drawSectionHeader('News Articles Analyzed', y, colors.articles);
  y += 14;

  // Table header banner
  doc.setFillColor(249, 115, 22); // Orange (#F97316)
  doc.rect(40, y, 515, 18, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('#', 45, y + 12);
  doc.text('Title', 65, y + 12);
  doc.text('Source', 350, y + 12);
  doc.text('Sentiment', 475, y + 12);
  
  y += 18;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  report.news.recentNews.slice(0, 10).forEach((news, idx) => {
    // Alternate row bg
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(40, y, 515, 16, 'F');
    }
    
    // Bottom border line
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(1);
    doc.line(40, y + 16, 555, y + 16);
    
    doc.setTextColor(51, 65, 85);
    doc.text(String(idx + 1), 45, y + 11);
    
    const titleStr = news.title.length > 62 ? news.title.slice(0, 59) + '...' : news.title;
    doc.text(titleStr, 65, y + 11);
    
    const domain = news.url ? news.url.replace(/https?:\/\/(www\.)?/, '').split('/')[0] : news.source;
    doc.text(domain.slice(0, 24), 350, y + 11);
    
    const sent = news.sentiment.toUpperCase();
    if (sent === 'POSITIVE') doc.setTextColor(16, 185, 129); // Green
    else if (sent === 'NEGATIVE') doc.setTextColor(239, 68, 68); // Red
    else doc.setTextColor(100, 116, 139); // Slate 400
    
    doc.setFont('helvetica', 'bold');
    doc.text(sent, 475, y + 11);
    doc.setFont('helvetica', 'normal');
    
    y += 16;
  });
  
  y += 24;

  // Research Sources List
  drawSectionHeader('Research Sources', y, colors.sources);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235); // Blue

  const sourcesList = report.decision.sourcesUsed.slice(0, 14);
  sourcesList.forEach((src) => {
    doc.text(src.slice(0, 120), 40, y);
    y += 11;
  });

  // Draw Page 3 footer
  drawFooter(3);

  doc.save(`${report.company.name.replace(/\s+/g, '-').toLowerCase()}-equity-research-report.pdf`);
};

export const exportReportDocx = async (report: InvestmentReport) => {
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Metric Category', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Score', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Metric Category', bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Score', bold: true, size: 20 })] })] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Growth Potential', size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.financials.scores.growth}/100`, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Moat Strength', size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.financials.scores.marketPosition}/100`, size: 20 })] })] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Profitability Score', size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.financials.scores.profitability}/100`, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Risk Quotient', size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.risks.riskScore}/100`, size: 20 })] })] }),
      ],
    }),
  ];

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: 'InvestIQ AI Institutional Research Report', bold: true, size: 36, color: '0F172A' })] }),
        new Paragraph({ children: [new TextRun({ text: `Target Company: ${report.company.name} (${report.company.ticker || 'N/A'})`, size: 22, color: '64748B' })] }),
        new Paragraph({ children: [new TextRun({ text: `Date Generated: ${formatDate()} • Sector: ${report.company.industry}`, size: 20, color: '64748B' })] }),
        new Paragraph({ children: [new TextRun({ text: '' })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '1. Final Recommendation Verdict', color: '1E3A8A' })] }),
        new Paragraph({ children: [new TextRun({ text: `RECOMMENDATION: ${report.decision.recommendation} (Score: ${report.decision.finalScore}/100, Confidence: ${report.decision.confidenceScore}%)`, bold: true, size: 24, color: '10B981' })] }),
        new Paragraph({ children: [new TextRun({ text: report.decision.shortSummary, italics: true, size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: '' })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '2. Metric Breakdown Matrix', color: '1E3A8A' })] }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
        }),
        new Paragraph({ children: [new TextRun({ text: '' })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '3. Detailed Bull & Bear Scenarios', color: '1E3A8A' })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: 'Bull Case Points', color: '10B981' })] }),
        ...report.debate.bullCase.arguments.map((arg) => new Paragraph({ children: [new TextRun({ text: `• ${arg}`, size: 20 })] })),
        new Paragraph({ children: [new TextRun({ text: '' })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: 'Bear Case Points', color: 'EF4444' })] }),
        ...report.debate.bearCase.arguments.map((arg) => new Paragraph({ children: [new TextRun({ text: `• ${arg}`, size: 20 })] })),
        new Paragraph({ children: [new TextRun({ text: '' })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '4. Key Risks & Catalysts', color: '1E3A8A' })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: 'Catalysts for growth', color: '6366F1' })] }),
        ...(report.decision.keyCatalysts || []).map((cat) => new Paragraph({ children: [new TextRun({ text: `• ${cat}`, size: 20 })] })),
        new Paragraph({ children: [new TextRun({ text: '' })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: 'Threats & Risks', color: 'F59E0B' })] }),
        ...report.decision.topRisks.map((risk) => new Paragraph({ children: [new TextRun({ text: `• ${risk}`, size: 20 })] })),
        new Paragraph({ children: [new TextRun({ text: '' })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '5. Methodology and Investment Thesis', color: '1E3A8A' })] }),
        new Paragraph({ children: [new TextRun({ text: report.decision.detailedExplanation, size: 20 })] }),
        new Paragraph({ children: [new TextRun({ text: '' })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: '6. Research Sources Used', color: '1E3A8A' })] }),
        ...report.decision.sourcesUsed.map((src) => new Paragraph({ children: [new TextRun({ text: `• ${src}`, size: 18, color: '64748B' })] })),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.company.name.replace(/\s+/g, '-').toLowerCase()}-research-report.docx`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportJson = (report: InvestmentReport) => {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.company.name.replace(/\s+/g, '-').toLowerCase()}-research-report.json`;
  link.click();
  URL.revokeObjectURL(url);
};
