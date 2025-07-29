import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFAssessmentData {
  study: {
    id: number;
    site: string;
    sponsor: string;
    protocol: string;
    studytypetext: string;
    description: string;
    status: string;
    phase: string;
    monitoring_schedule: string;
  };
  assessment: {
    id: number;
    assessment_date: string;
    next_review_date?: string;
    status: string;
    overall_risk_score: number;
    overall_risk_level: string;
    conducted_by_name: string;
    reviewed_by_name?: string;
    approved_by_name?: string;
    rejected_by_name?: string;
    created_at: string;
    updated_at: string;
  };
  riskData: {
    [sectionKey: string]: Array<{
      risk_factor_text: string;
      severity: string;
      likelihood: string;
      mitigation: string;
      custom_notes: string;
    }>;
  };
  sectionComments: { [sectionKey: string]: string };
  riskMitigationPlans: Array<{
    risk_item: string;
    responsible_person: string;
    mitigation_strategy: string;
    target_date: string;
    status: string;
  }>;
  riskDashboard: {
    total_risks: number;
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
    total_score: number;
    overall_risk_level: string;
  };
  summaryCommentText: string;
}

export class PDFService {
  static generateAssessmentReport(data: PDFAssessmentData): void {
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `Risk Assessment Report - ${data.study.protocol}`,
      subject: 'Clinical Study Risk Assessment',
      author: data.assessment.conducted_by_name,
      creator: 'Flourish Risk Assessment System'
    });

    // Add header
    this.addHeader(doc, data);
    
    // Add study information
    this.addStudyInformation(doc, data);
    
    // Add assessment summary
    this.addAssessmentSummary(doc, data);
    
    // Add risk assessment details
    this.addRiskAssessmentDetails(doc, data);
    
    // Add risk mitigation plans
    this.addRiskMitigationPlans(doc, data);
    
    // Add risk dashboard
    this.addRiskDashboard(doc, data);
    
    // Add summary comments
    this.addSummaryComments(doc, data);
    
    // Add footer
    this.addFooter(doc, data);
    
    // Generate filename
    const filename = `Risk_Assessment_${data.study.protocol}_${data.assessment.assessment_date}.pdf`;
    
    // Save the PDF
    doc.save(filename);
  }

  private static addHeader(doc: jsPDF, data: PDFAssessmentData): void {
    // Add logo/company name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Flourish Risk Assessment System', 105, 20, { align: 'center' });
    
    // Add report title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Clinical Study Risk Assessment Report', 105, 35, { align: 'center' });
    
    // Add study protocol
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Protocol: ${data.study.protocol}`, 105, 45, { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 105, 55, { align: 'center' });
    
    // Add line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 65, 190, 65);
  }

  private static addStudyInformation(doc: jsPDF, data: PDFAssessmentData): void {
    let yPosition = 80;
    
    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Study Information', 20, yPosition);
    yPosition += 10;
    
    // Study details table
    const studyData = [
      ['Site', data.study.site],
      ['Sponsor', data.study.sponsor],
      ['Protocol', data.study.protocol],
      ['Study Type', data.study.studytypetext],
      ['Description', data.study.description],
      ['Study Status', data.study.status],
      ['Phase', data.study.phase],
      ['Monitoring Schedule', data.study.monitoring_schedule]
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Field', 'Value']],
      body: studyData,
      theme: 'grid',
      headStyles: { fillColor: [70, 130, 180], textColor: 255 },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 120 }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
    return yPosition;
  }

  private static addAssessmentSummary(doc: jsPDF, data: PDFAssessmentData): void {
    let yPosition = (doc as any).lastAutoTable.finalY + 20;
    
    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Assessment Summary', 20, yPosition);
    yPosition += 10;
    
    // Assessment details table
    const assessmentData = [
      ['Assessment Date', data.assessment.assessment_date],
      ['Next Review Date', data.assessment.next_review_date || 'Not specified'],
      ['Assessment Status', data.assessment.status],
      ['Overall Risk Score', data.assessment.overall_risk_score.toString()],
      ['Overall Risk Level', data.assessment.overall_risk_level],
      ['Conducted By', data.assessment.conducted_by_name],
      ['Reviewed By', data.assessment.reviewed_by_name || 'Not reviewed'],
      ['Approved By', data.assessment.approved_by_name || 'Not approved'],
      ['Rejected By', data.assessment.rejected_by_name || 'Not rejected']
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Field', 'Value']],
      body: assessmentData,
      theme: 'grid',
      headStyles: { fillColor: [70, 130, 180], textColor: 255 },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 120 }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
    return yPosition;
  }

  private static addRiskAssessmentDetails(doc: jsPDF, data: PDFAssessmentData): void {
    let yPosition = (doc as any).lastAutoTable.finalY + 20;
    
    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Risk Assessment Details', 20, yPosition);
    yPosition += 10;
    
    // Define section titles
    const sectionTitles: { [key: string]: string } = {
      'regulatory': '3.1 Regulatory & Compliance Risks',
      'data-quality': '3.2 Data Quality & Management Risks',
      'patient-safety': '3.3 Patient Safety & Recruitment Risks',
      'compliance': '3.4 Patient Compliance & Recruitment Risks',
      'site-operations': '3.5 Site Operations & Resource Risks'
    };
    
    Object.entries(data.riskData).forEach(([sectionKey, risks], index) => {
      const sectionTitle = sectionTitles[sectionKey] || `3.${index + 1} ${sectionKey.replace('-', ' ').toUpperCase()}`;
      
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Section subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(sectionTitle, 20, yPosition);
      yPosition += 8;
      
      // Section comments if available
      if (data.sectionComments[sectionKey]) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(`Comments: ${data.sectionComments[sectionKey]}`, 25, yPosition);
        yPosition += 8;
      }
      
      // Risk factors table
      if (risks.length > 0) {
        const riskTableData = risks.map(risk => [
          risk.risk_factor_text,
          risk.severity || '-',
          risk.likelihood || '-',
          (risk.severity && risk.likelihood) ? (parseInt(risk.severity) * parseInt(risk.likelihood)).toString() : '-',
          risk.mitigation || '-',
          risk.custom_notes || '-'
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Risk Factor', 'Severity', 'Likelihood', 'Score', 'Mitigation', 'Comments']],
          body: riskTableData,
          theme: 'grid',
          headStyles: { fillColor: [100, 100, 100], textColor: 255, fontSize: 9 },
          styles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 40 },
            5: { cellWidth: 30 }
          }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
    });
  }

  private static addRiskMitigationPlans(doc: jsPDF, data: PDFAssessmentData): void {
    let yPosition = (doc as any).lastAutoTable.finalY + 20;
    
    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Risk Mitigation Plans', 20, yPosition);
    yPosition += 10;
    
    // Filter plans with data
    const plansWithData = data.riskMitigationPlans.filter(plan => 
      plan.risk_item.trim() !== '' || 
      plan.responsible_person.trim() !== '' || 
      plan.mitigation_strategy.trim() !== ''
    );
    
    if (plansWithData.length > 0) {
      const planTableData = plansWithData.map(plan => [
        plan.risk_item || '-',
        plan.responsible_person || '-',
        plan.mitigation_strategy || '-',
        plan.target_date || '-',
        plan.status || '-'
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Risk Item', 'Responsible Person', 'Mitigation Strategy', 'Target Date', 'Status']],
        body: planTableData,
        theme: 'grid',
        headStyles: { fillColor: [70, 130, 180], textColor: 255 },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 35 },
          2: { cellWidth: 50 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('No risk mitigation plans defined.', 20, yPosition);
      yPosition += 10;
    }
  }

  private static addRiskDashboard(doc: jsPDF, data: PDFAssessmentData): void {
    let yPosition = (doc as any).lastAutoTable.finalY + 20;
    
    // Check if we need a new page
    if (yPosition > 150) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('5. Risk Dashboard Summary', 20, yPosition);
    yPosition += 10;
    
    // Risk dashboard table
    const dashboardData = [
      ['Total Risks', data.riskDashboard.total_risks.toString()],
      ['High Risk Count', data.riskDashboard.high_risk_count.toString()],
      ['Medium Risk Count', data.riskDashboard.medium_risk_count.toString()],
      ['Low Risk Count', data.riskDashboard.low_risk_count.toString()],
      ['Total Score', data.riskDashboard.total_score.toString()],
      ['Overall Risk Level', data.riskDashboard.overall_risk_level]
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: dashboardData,
      theme: 'grid',
      headStyles: { fillColor: [70, 130, 180], textColor: 255 },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 40, halign: 'center' }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  private static addSummaryComments(doc: jsPDF, data: PDFAssessmentData): void {
    let yPosition = (doc as any).lastAutoTable.finalY + 20;
    
    // Check if we need a new page
    if (yPosition > 100) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('6. Summary Comments', 20, yPosition);
    yPosition += 10;
    
    // Summary comments
    if (data.summaryCommentText && data.summaryCommentText.trim()) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Split text into lines that fit the page width
      const maxWidth = 170;
      const lines = doc.splitTextToSize(data.summaryCommentText, maxWidth);
      
      lines.forEach((line: string) => {
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('No summary comments provided.', 20, yPosition);
    }
  }

  private static addFooter(doc: jsPDF, data: PDFAssessmentData): void {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Add page number
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${pageCount}`, 105, 280, { align: 'center' });
      
      // Add footer line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 275, 190, 275);
      
      // Add generation info
      doc.setFontSize(8);
      doc.text(`Generated on ${new Date().toLocaleString()} by ${data.assessment.conducted_by_name}`, 20, 285);
      doc.text(`Protocol: ${data.study.protocol}`, 150, 285);
    }
  }
}

export default PDFService; 