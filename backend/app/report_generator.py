"""
PDF Report Generator for SentinelAI
Generates executive-ready audit reports
"""
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, Image
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.graphics.shapes import Drawing, Circle, Rect
from reportlab.graphics.charts.piecharts import Pie

from app.config import REPORTS_DIR

# Custom colors matching the UI theme
NAVY = colors.HexColor("#0A0E1A")
TEAL = colors.HexColor("#00D9B5")
EMERALD = colors.HexColor("#059669")
WHITE = colors.white
GRAY = colors.HexColor("#6B7280")
LIGHT_GRAY = colors.HexColor("#F3F4F6")

def get_status_color(status: str) -> colors.Color:
    """Get color based on risk status"""
    if status == "PASS":
        return EMERALD
    elif status == "WARNING":
        return colors.HexColor("#F59E0B")
    else:
        return colors.HexColor("#EF4444")

def create_styles() -> Dict[str, ParagraphStyle]:
    """Create custom paragraph styles"""
    styles = getSampleStyleSheet()
    
    custom_styles = {
        "Title": ParagraphStyle(
            "CustomTitle",
            parent=styles["Title"],
            fontSize=28,
            textColor=NAVY,
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName="Helvetica-Bold"
        ),
        "Subtitle": ParagraphStyle(
            "CustomSubtitle",
            parent=styles["Normal"],
            fontSize=14,
            textColor=GRAY,
            spaceAfter=20,
            alignment=TA_CENTER
        ),
        "Heading1": ParagraphStyle(
            "CustomH1",
            parent=styles["Heading1"],
            fontSize=18,
            textColor=NAVY,
            spaceBefore=20,
            spaceAfter=12,
            fontName="Helvetica-Bold"
        ),
        "Heading2": ParagraphStyle(
            "CustomH2",
            parent=styles["Heading2"],
            fontSize=14,
            textColor=NAVY,
            spaceBefore=15,
            spaceAfter=8,
            fontName="Helvetica-Bold"
        ),
        "Body": ParagraphStyle(
            "CustomBody",
            parent=styles["Normal"],
            fontSize=11,
            textColor=NAVY,
            spaceAfter=8,
            leading=14
        ),
        "Metric": ParagraphStyle(
            "Metric",
            parent=styles["Normal"],
            fontSize=24,
            textColor=TEAL,
            alignment=TA_CENTER,
            fontName="Helvetica-Bold"
        ),
        "MetricLabel": ParagraphStyle(
            "MetricLabel",
            parent=styles["Normal"],
            fontSize=10,
            textColor=GRAY,
            alignment=TA_CENTER
        ),
        "Critical": ParagraphStyle(
            "Critical",
            parent=styles["Normal"],
            fontSize=11,
            textColor=colors.HexColor("#EF4444"),
            fontName="Helvetica-Bold"
        ),
        "Warning": ParagraphStyle(
            "Warning",
            parent=styles["Normal"],
            fontSize=11,
            textColor=colors.HexColor("#F59E0B"),
            fontName="Helvetica-Bold"
        ),
        "Footer": ParagraphStyle(
            "Footer",
            parent=styles["Normal"],
            fontSize=8,
            textColor=GRAY,
            alignment=TA_CENTER
        )
    }
    
    return custom_styles

def generate_audit_report(audit_result: Dict[str, Any]) -> bytes:
    """
    Generate PDF audit report
    Returns PDF as bytes
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )
    
    styles = create_styles()
    story = []
    
    # ========== HEADER ==========
    story.append(Paragraph("SentinelAI", styles["Title"]))
    story.append(Paragraph("AI Governance Audit Report", styles["Subtitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=TEAL))
    story.append(Spacer(1, 20))
    
    # ========== AUDIT METADATA ==========
    metadata_data = [
        ["Audit ID:", audit_result["audit_id"]],
        ["Timestamp:", audit_result["timestamp"]],
        ["Dataset Mode:", audit_result["dataset_mode"].title()],
        ["Records Analyzed:", str(audit_result["dataset_stats"]["total_records"])]
    ]
    
    metadata_table = Table(metadata_data, colWidths=[1.5*inch, 4*inch])
    metadata_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (-1, -1), NAVY),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(metadata_table)
    story.append(Spacer(1, 30))
    
    # ========== EXECUTIVE SUMMARY ==========
    story.append(Paragraph("Executive Summary", styles["Heading1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
    story.append(Spacer(1, 10))
    
    # Risk Score Box
    status = audit_result["risk_status"]
    score = audit_result["ai_risk_score"]
    status_color = get_status_color(status)
    
    score_text = f"AI Risk Score: {score:.0f} — {status}"
    status_style = ParagraphStyle(
        "StatusStyle",
        fontSize=20,
        textColor=status_color,
        alignment=TA_CENTER,
        fontName="Helvetica-Bold",
        spaceBefore=10,
        spaceAfter=10
    )
    
    story.append(Paragraph(score_text, status_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph(audit_result["executive_summary"], styles["Body"]))
    story.append(Spacer(1, 20))
    
    # ========== RISK COMPONENT SCORES ==========
    story.append(Paragraph("Risk Component Breakdown", styles["Heading1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
    story.append(Spacer(1, 15))
    
    # Scores table
    scores_data = [
        ["Component", "Score", "Contribution", "Status"],
        [
            "Bias Risk",
            f"{audit_result['bias_risk_score']:.1f}",
            f"{audit_result['risk_components']['bias_contribution']:.1f}",
            "High" if audit_result['bias_risk_score'] > 50 else "Low"
        ],
        [
            "Drift Risk",
            f"{audit_result['drift_risk_score']:.1f}",
            f"{audit_result['risk_components']['drift_contribution']:.1f}",
            "High" if audit_result['drift_risk_score'] > 50 else "Low"
        ],
        [
            "Explainability Gap",
            f"{100 - audit_result['explainability_score']:.1f}",
            f"{audit_result['risk_components']['explainability_contribution']:.1f}",
            "High" if audit_result['explainability_score'] < 60 else "Low"
        ]
    ]
    
    scores_table = Table(scores_data, colWidths=[2*inch, 1.2*inch, 1.5*inch, 1*inch])
    scores_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_GRAY])
    ]))
    story.append(scores_table)
    story.append(Spacer(1, 30))
    
    # ========== BIAS ANALYSIS ==========
    story.append(Paragraph("Bias Analysis", styles["Heading1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
    story.append(Spacer(1, 10))
    
    bias_details = audit_result["bias_details"]
    story.append(Paragraph(bias_details["explanation"], styles["Body"]))
    story.append(Spacer(1, 10))
    
    # Gender DI metrics
    gender_di = bias_details["gender_di"]
    di_data = [
        ["Metric", "Value"],
        ["Disparate Impact Ratio", f"{gender_di['di_ratio']:.3f}"],
        ["Male Approval Rate", f"{gender_di['privileged_rate']:.1%}"],
        ["Female Approval Rate", f"{gender_di['unprivileged_rate']:.1%}"],
        ["Threshold (80% Rule)", f"{gender_di['threshold']:.1%}"],
        ["Violation", "Yes" if gender_di['violation'] else "No"]
    ]
    
    di_table = Table(di_data, colWidths=[2.5*inch, 2*inch])
    di_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
    ]))
    story.append(di_table)
    story.append(Spacer(1, 20))
    
    # ========== DRIFT ANALYSIS ==========
    story.append(Paragraph("Drift Analysis", styles["Heading1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
    story.append(Spacer(1, 10))
    
    drift_details = audit_result["drift_details"]
    story.append(Paragraph(drift_details["explanation"], styles["Body"]))
    story.append(Spacer(1, 10))
    
    accuracy = drift_details["accuracy_drift"]
    drift_data = [
        ["Metric", "Value"],
        ["Baseline Accuracy", f"{accuracy['baseline_accuracy']:.1%}"],
        ["Current Accuracy", f"{accuracy['current_accuracy']:.1%}"],
        ["Accuracy Drop", f"{accuracy['accuracy_drop_percent']:.1f}%"],
        ["Drift Severity", drift_details["severity"]],
        ["Features Drifted", str(len(drift_details.get("drifted_features", [])))]
    ]
    
    drift_table = Table(drift_data, colWidths=[2.5*inch, 2*inch])
    drift_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
    ]))
    story.append(drift_table)
    story.append(Spacer(1, 20))
    
    # ========== RECOMMENDATIONS ==========
    story.append(PageBreak())
    story.append(Paragraph("Recommendations", styles["Heading1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
    story.append(Spacer(1, 15))
    
    recommendations = audit_result["recommendations"]
    
    if recommendations:
        for i, rec in enumerate(recommendations[:6], 1):  # Limit to top 6
            severity = rec["severity"]
            if severity == "Critical":
                severity_style = styles["Critical"]
            elif severity in ["High", "Moderate"]:
                severity_style = styles["Warning"]
            else:
                severity_style = styles["Body"]
            
            story.append(Paragraph(f"{i}. [{severity}] {rec['title']}", severity_style))
            story.append(Paragraph(rec["description"], styles["Body"]))
            story.append(Paragraph(f"<b>Action:</b> {rec['action']}", styles["Body"]))
            story.append(Spacer(1, 10))
    else:
        story.append(Paragraph("No recommendations at this time. Model performance is within acceptable parameters.", styles["Body"]))
    
    # ========== FOOTER ==========
    story.append(Spacer(1, 40))
    story.append(HRFlowable(width="100%", thickness=1, color=GRAY))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        f"Generated by SentinelAI • {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} • Confidential",
        styles["Footer"]
    ))
    story.append(Paragraph(
        "This report is for compliance and governance purposes. Do not distribute without authorization.",
        styles["Footer"]
    ))
    
    # Build PDF
    doc.build(story)
    
    return buffer.getvalue()

def save_report(audit_result: Dict[str, Any]) -> Path:
    """Generate and save PDF report to file"""
    pdf_bytes = generate_audit_report(audit_result)
    
    filename = f"audit_report_{audit_result['audit_id']}.pdf"
    filepath = REPORTS_DIR / filename
    
    with open(filepath, "wb") as f:
        f.write(pdf_bytes)
    
    return filepath
