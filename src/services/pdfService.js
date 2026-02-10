import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { evaluationCriteria } from '../constants/evaluationCriteria';
import { AmharicFontBase64 } from '../constants/AmharicFont';

export const generateEvaluationPDF = (evaluationData) => {
    const doc = new jsPDF();

    // Register Amharic Font
    // Register Amharic Font (Reuse regular font for bold/italic to avoid missing glyphs)
    doc.addFileToVFS('AbyssinicaSIL-Regular.ttf', AmharicFontBase64);
    doc.addFont('AbyssinicaSIL-Regular.ttf', 'AbyssinicaSIL', 'normal');
    doc.addFont('AbyssinicaSIL-Regular.ttf', 'AbyssinicaSIL', 'bold');
    doc.addFont('AbyssinicaSIL-Regular.ttf', 'AbyssinicaSIL', 'italic');
    doc.setFont('AbyssinicaSIL');

    const pageWidth = doc.internal.pageSize.width;

    // Helper for centered text
    const centerText = (text, y) => {
        const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, y);
    };

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    centerText('Employee Performance Evaluation', 20);



    // Employee Info Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.rect(14, 35, pageWidth - 28, 35, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    const leftColX = 20;
    const rightColX = 110;
    let currentY = 45;
    const lineHeight = 8;

    // Row 1
    doc.setFont('AbyssinicaSIL', 'bold');
    doc.text('Employee Name:', leftColX, currentY);
    doc.setFont('AbyssinicaSIL', 'normal');
    doc.text(evaluationData.employeeName || '-', leftColX + 35, currentY);

    doc.setFont('AbyssinicaSIL', 'bold');
    doc.text('Job Title:', rightColX, currentY);
    doc.setFont('AbyssinicaSIL', 'normal');
    doc.text(evaluationData.jobTitle || '-', rightColX + 25, currentY);

    currentY += lineHeight;

    // Row 2
    doc.setFont('AbyssinicaSIL', 'bold');
    doc.text('Department:', leftColX, currentY);
    doc.setFont('AbyssinicaSIL', 'normal');
    doc.text(evaluationData.department || '-', leftColX + 35, currentY);

    doc.setFont('AbyssinicaSIL', 'bold');
    doc.text('Period:', rightColX, currentY);
    doc.setFont('AbyssinicaSIL', 'normal');
    doc.text(`${evaluationData.periodFrom || '-'} to ${evaluationData.periodTo || '-'}`, rightColX + 25, currentY);

    currentY += lineHeight;

    // Row 3
    doc.setFont('AbyssinicaSIL', 'bold');
    doc.text('Status:', leftColX, currentY);
    doc.setFont('AbyssinicaSIL', 'normal');
    doc.text('Completed', leftColX + 35, currentY);

    // Evaluation Content
    let tableY = 80;

    // Flatten data for table
    const tableRows = [];
    let totalScore = 0;

    evaluationCriteria.forEach(cat => {
        // Category Header Row
        const catName = `${cat.name.toUpperCase()} / ${cat.nameAm || ''}`;
        tableRows.push([{ content: catName, colSpan: 4, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);

        cat.subcriteria.forEach(item => {
            const rating = evaluationData.ratings?.[item.id] || 0;
            const score = rating * item.multiplier;
            totalScore += score;

            const itemName = `${item.name} / ${item.nameAm || ''}`;
            tableRows.push([
                itemName,
                item.weight,
                rating || '-',
                score.toFixed(1)
            ]);
        });
    });

    autoTable(doc, {
        startY: tableY,
        head: [['Criteria', 'Weight', 'Rating', 'Score']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: 255, font: 'AbyssinicaSIL' }, // Indigo-600
        styles: { fontSize: 9, cellPadding: 3, font: 'AbyssinicaSIL' },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' }
        }
    });

    // Total Score
    const finalY = doc.lastAutoTable.finalY + 10;

    // Performance Level Logic
    const getPerformanceLevel = (s) => {
       if (s >= 90) return 'Excellent / እጅግ በጣም ጥሩ';
    if (s >= 70) return 'Very Good / በጣም ጥሩ';
    if (s >= 50) return 'Good / ጥሩ';
    if (s >= 30) return 'Low / ዝቅተኛ';
    if (s >= 20) return 'Very Low / በጣም ዝቅተኛ';
    return 'Unsatisfactory / በቂ ያልሆነ';
    };

    const performance = getPerformanceLevel(totalScore);

    doc.setFillColor(245, 247, 255);
    doc.setDrawColor(79, 70, 229);
    doc.roundedRect(14, finalY, pageWidth - 28, 25, 3, 3, 'FD');

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.setFont('AbyssinicaSIL', 'bold');
    doc.text(`Total Score: ${totalScore.toFixed(1)} / 100`, 20, finalY + 10);

    doc.setFontSize(11);
    doc.text(`Performance Level: ${performance}`, 20, finalY + 18);

    // Page Break for Signatures if needed, or just continue
    if (finalY > 200) {
        doc.addPage();
        currentY = 20;
    } else {
        currentY = finalY + 35;
    }

    // Comments Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Comments & Feedback', 14, currentY);
    currentY += 10;

    doc.setFontSize(10);
    doc.setFont('AbyssinicaSIL', 'bold');
    doc.text('Supervisor Comments:', 14, currentY);
    currentY += 6;
    doc.setFont('AbyssinicaSIL', 'normal');

    const splitSupervisorComments = doc.splitTextToSize(evaluationData.supervisorComments || 'No comments provided.', pageWidth - 28);
    doc.text(splitSupervisorComments, 14, currentY);
    currentY += (splitSupervisorComments.length * 5) + 10;

    doc.setFont('AbyssinicaSIL', 'bold');
    doc.text('Employee Comments:', 14, currentY);
    currentY += 6;
    doc.setFont('AbyssinicaSIL', 'normal');
    doc.text(`Agreement: ${evaluationData.employeeAgreement === 'agree' ? 'Agreed' : evaluationData.employeeAgreement === 'disagree' ? 'Disagreed' : 'Not specified'}`, 14, currentY);
    currentY += 6;

    const splitEmployeeComments = doc.splitTextToSize(evaluationData.employeeComments || 'No comments provided.', pageWidth - 28);
    doc.text(splitEmployeeComments, 14, currentY);
    currentY += (splitEmployeeComments.length * 5) + 20;

    // Signatures
    // Check if we need a new page for signatures
    if (currentY > 250) {
        doc.addPage();
        currentY = 20;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(14, currentY, pageWidth - 14, currentY);
    currentY += 10;

    const sigY = currentY;

    // Supervisor Sig
    doc.setFont('AbyssinicaSIL', 'bold');
    doc.text('Supervisor Signature', 30, sigY);
    if (evaluationData.signatures?.supervisor) {
        try {
            doc.addImage(evaluationData.signatures.supervisor, 'PNG', 30, sigY + 5, 40, 20);
            doc.setFontSize(8);
            doc.setFont('AbyssinicaSIL', 'normal');
            doc.text(`Date: ${new Date(evaluationData.signatures.supervisorTimestamp).toLocaleDateString()}`, 30, sigY + 30);
        } catch (e) {
            console.error('Error adding supervisor signature', e);
        }
    } else {
        doc.setFont('AbyssinicaSIL', 'italic');
        doc.text('(Not Signed)', 30, sigY + 15);
    }

    // Employee Sig
    doc.setFontSize(10);
    doc.setFont('AbyssinicaSIL', 'bold');
    doc.text('Employee Signature', 120, sigY);
    if (evaluationData.signatures?.employee) {
        try {
            doc.addImage(evaluationData.signatures.employee, 'PNG', 120, sigY + 5, 40, 20);
            doc.setFontSize(8);
            doc.setFont('AbyssinicaSIL', 'normal');
            doc.text(`Date: ${new Date(evaluationData.signatures.employeeTimestamp).toLocaleDateString()}`, 120, sigY + 30);
        } catch (e) {
            console.error('Error adding employee signature', e);
        }
    } else {
        doc.setFont('AbyssinicaSIL', 'italic');
        doc.text('(Not Signed)', 120, sigY + 15);
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10, { align: 'right' });
        doc.text(`Generated on ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`Evaluation_${evaluationData.employeeName.replace(/\s+/g, '_')}_${evaluationData.periodTo}.pdf`);
};
