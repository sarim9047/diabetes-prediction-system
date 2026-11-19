import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from app.models.prediction import Prediction
from app.models.user import User

def generate_prediction_pdf(prediction: Prediction, user: User) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom palette
    navy = colors.HexColor("#0f2a4a")
    teal = colors.HexColor("#0891b2")
    light_bg = colors.HexColor("#f8fafc")
    border_color = colors.HexColor("#cbd5e1")
    danger_color = colors.HexColor("#dc2626")
    safe_color = colors.HexColor("#059669")
    gray_text = colors.HexColor("#475569")

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=navy
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=teal
    )
    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=gray_text
    )
    section_heading = ParagraphStyle(
        'SecHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=navy
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b")
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1e293b")
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=navy
    )
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#475569")
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("DIABETES PREDICTION SYSTEM", title_style),
            Paragraph(f"<b>REPORT ID:</b> DPA-2026-{prediction.id:05d}<br/><b>DATE:</b> {prediction.created_at.strftime('%Y-%m-%d %H:%M UTC')}", meta_style)
        ],
        [
            Paragraph("Automated Machine Learning Health Risk Assessment Report", subtitle_style),
            Paragraph(f"<b>PATIENT:</b> {user.full_name}<br/><b>ACCOUNT:</b> {user.email}", meta_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[3.8 * inch, 3.4 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=teal, spaceBefore=4, spaceAfter=14))

    # 2. Executive Classification Card
    is_positive = (prediction.prediction_result == 1)
    status_bg = colors.HexColor("#fee2e2") if is_positive else colors.HexColor("#ecfdf5")
    status_text_color = danger_color if is_positive else safe_color
    status_title = "MODEL INDICATION: POSITIVE CLASSIFICATION (ELEVATED RISK)" if is_positive else "MODEL INDICATION: NEGATIVE CLASSIFICATION (NORMAL PROFILE)"
    
    status_explanation = (
        "The algorithmic machine learning classifier identified predictive biomarker patterns "
        "frequently associated with elevated diabetes risk profiles in the PIMA research cohort. "
        "This is an automated research screening assessment and NOT a medical diagnostic finding."
        if is_positive else
        "The algorithmic machine learning classifier did not detect strong predictive patterns of diabetes "
        "based on the submitted clinical biomarkers. This represents an automated screening indicator, "
        "not a clinical exclusion or definitive health guarantee."
    )

    card_content = [
        [Paragraph(f"<b>{status_title}</b>", ParagraphStyle('StatusHead', fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=status_text_color))],
        [Spacer(1, 4)],
        [Paragraph(status_explanation, body_style)],
        [Spacer(1, 4)],
        [Paragraph(f"<b>Algorithm:</b> {prediction.model_name} (v{prediction.model_version}) &nbsp;&nbsp;|&nbsp;&nbsp; <b>Confidence Score:</b> {prediction.risk_score:.2%}" if prediction.risk_score else f"<b>Algorithm:</b> {prediction.model_name}", meta_style)]
    ]
    card_table = Table(card_content, colWidths=[7.2 * inch])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), status_bg),
        ('BOX', (0, 0), (-1, -1), 1.2, status_text_color),
        ('PADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(card_table)
    story.append(Spacer(1, 16))

    # 3. Clinical Parameters Table
    story.append(Paragraph("Patient Biomarker Summary", section_heading))
    story.append(Spacer(1, 6))

    param_rows = [
        [Paragraph("Parameter", table_cell_bold), Paragraph("Submitted Value", table_cell_bold), Paragraph("Standard Clinical Reference", table_cell_bold), Paragraph("Measurement Unit", table_cell_bold)],
        [Paragraph("Glucose", table_cell), Paragraph(f"<b>{prediction.glucose:.1f}</b>", table_cell), Paragraph("70 – 99 (Normal Fasting), < 140 (2h Post-prandial)", table_cell), Paragraph("mg/dL", table_cell)],
        [Paragraph("Blood Pressure", table_cell), Paragraph(f"<b>{prediction.blood_pressure:.1f}</b>", table_cell), Paragraph("60 – 80 (Normal Diastolic)", table_cell), Paragraph("mmHg", table_cell)],
        [Paragraph("Body Mass Index (BMI)", table_cell), Paragraph(f"<b>{prediction.bmi:.1f}</b>", table_cell), Paragraph("18.5 – 24.9 (Normal Range)", table_cell), Paragraph("kg/m²", table_cell)],
        [Paragraph("Insulin Level", table_cell), Paragraph(f"<b>{prediction.insulin:.1f}</b>", table_cell), Paragraph("16 – 166 (2h Post-prandial Reference)", table_cell), Paragraph("μU/mL", table_cell)],
        [Paragraph("Skinfold Thickness", table_cell), Paragraph(f"<b>{prediction.skin_thickness:.1f}</b>", table_cell), Paragraph("10 – 30 (Normal Adult Range)", table_cell), Paragraph("mm", table_cell)],
        [Paragraph("Diabetes Pedigree Func.", table_cell), Paragraph(f"<b>{prediction.diabetes_pedigree_function:.3f}</b>", table_cell), Paragraph("0.08 – 0.50 (Average Genetic Risk)", table_cell), Paragraph("Ratio / Score", table_cell)],
        [Paragraph("Age", table_cell), Paragraph(f"<b>{prediction.age}</b>", table_cell), Paragraph("Adult Screening Benchmark", table_cell), Paragraph("Years", table_cell)],
        [Paragraph("Pregnancies", table_cell), Paragraph(f"<b>{prediction.pregnancies}</b>", table_cell), Paragraph("Obstetric History Record", table_cell), Paragraph("Count", table_cell)],
    ]

    param_table = Table(param_rows, colWidths=[2.2 * inch, 1.4 * inch, 2.5 * inch, 1.1 * inch])
    param_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, light_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(param_table)
    story.append(Spacer(1, 16))

    # 4. Clinical Guidance & Advisory
    story.append(Paragraph("Health Insights & Clinical Recommendations", section_heading))
    story.append(Spacer(1, 6))
    
    guidance_bullets = (
        "• <b>Comprehensive Consultation:</b> Schedule an appointment with a licensed endocrinologist or primary care physician for diagnostic confirmation (e.g., HbA1c, Fasting Blood Glucose, OGTT).<br/>"
        "• <b>Glycemic Monitoring:</b> Track daily post-meal and fasting glucose fluctuations with an approved glucometer.<br/>"
        "• <b>Nutritional Optimization:</b> Emphasize low glycemic-index carbohydrates, lean proteins, high dietary fiber, and adequate hydration.<br/>"
        "• <b>Physical Conditioning:</b> Target 150 minutes per week of moderate-intensity aerobic physical activity."
        if is_positive else
        "• <b>Routine Health Screening:</b> Continue annual preventative health checkups and routine blood panels with your primary care provider.<br/>"
        "• <b>Balanced Lifestyle:</b> Maintain a nutritious diet rich in whole foods, leafy greens, and lean proteins while minimizing ultra-processed sugars.<br/>"
        "• <b>Weight Management:</b> Sustain an active lifestyle to preserve a healthy BMI and cardiovascular fitness.<br/>"
        "• <b>Vigilance:</b> Monitor for any emerging symptoms such as unusual thirst, frequent urination, or unexplained fatigue."
    )
    story.append(Paragraph(guidance_bullets, body_style))
    story.append(Spacer(1, 18))

    # 5. Mandatory Medical Disclaimer & University Attributions
    disclaimer_box = [
        [Paragraph("<b>IMPORTANT MEDICAL DISCLAIMER & ACADEMIC NOTICE</b>", ParagraphStyle('DiscHead', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=danger_color))],
        [Spacer(1, 2)],
        [Paragraph(
            "This document is generated by the <b>Diabetes Prediction & Health Risk Assessment System</b>, an academic machine learning research project developed for 7th Semester Major Project evaluation. "
            "This software is <b>NOT a clinically certified diagnostic device</b> and does not constitute medical advice, medical diagnosis, or treatment planning. "
            "Machine learning outputs are statistical screening estimates based on historical cohort patterns. Never initiate, alter, or discontinue any medical medication, diet, or treatment based on this document. "
            "Always consult a qualified, licensed medical physician for professional health assessment.",
            disclaimer_style
        )]
    ]
    disc_table = Table(disclaimer_box, colWidths=[7.2 * inch])
    disc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#fef2f2")),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#fca5a5")),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(disc_table)

    # Build PDF document
    doc.build(story)
    buffer.seek(0)
    return buffer
