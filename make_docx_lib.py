import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, color_hex):
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}>'
                      f'<w:top w:w="{top}" w:type="dxa"/>'
                      f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
                      f'<w:left w:w="{left}" w:type="dxa"/>'
                      f'<w:right w:w="{right}" w:type="dxa"/>'
                      f'</w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'<w:tblBorders {nsdecls("w")}>'
                        f'<w:top w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
                        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
                        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
                        f'<w:insideV w:val="none"/>'
                        f'<w:left w:val="none"/>'
                        f'<w:right w:val="none"/>'
                        f'</w:tblBorders>')
    tblPr.append(borders)

def add_placeholder_box(doc, text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "FFF9E6") # Warm amber background
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}>'
                          f'<w:top w:val="dashed" w:sz="8" w:space="0" w:color="E6A100"/>'
                          f'<w:bottom w:val="dashed" w:sz="8" w:space="0" w:color="E6A100"/>'
                          f'<w:left w:val="dashed" w:sz="8" w:space="0" w:color="E6A100"/>'
                          f'<w:right w:val="dashed" w:sz="8" w:space="0" w:color="E6A100"/>'
                          f'</w:tcBorders>')
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(f"📷  [{text}]")
    run.bold = True
    run.font.name = "Times New Roman"
    run.font.size = Pt(11)
    run.font.color.rgb = RGBColor(180, 100, 0)
    
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(4)

def format_cell_text(cell, text, bold=False, italic=False, color_rgb=None, size_pt=11, align=WD_ALIGN_PARAGRAPH.LEFT):
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    if color_rgb:
        run.font.color.rgb = color_rgb
    return p

def create_key_value_table(doc, data, col1_w=Inches(2.2), col2_w=Inches(4.3)):
    table = doc.add_table(rows=len(data), cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table, "CCCCCC")
    
    for idx, (k, v) in enumerate(data):
        row = table.rows[idx]
        cell_k, cell_v = row.cells[0], row.cells[1]
        cell_k.width = col1_w
        cell_v.width = col2_w
        
        set_cell_background(cell_k, "F2F5F8")
        set_cell_margins(cell_k, top=80, bottom=80, left=120, right=120)
        set_cell_margins(cell_v, top=80, bottom=80, left=120, right=120)
        
        format_cell_text(cell_k, k, bold=True, size_pt=10.5, color_rgb=RGBColor(0, 51, 102))
        format_cell_text(cell_v, v, size_pt=10.5)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def create_event_table(doc, events, col1_w=Inches(0.6), col2_w=Inches(2.9), col3_w=Inches(3.0)):
    table = doc.add_table(rows=len(events) + 1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table, "CCCCCC")
    
    # Header
    hdr = table.rows[0]
    for c, w, t, al in zip(hdr.cells, [col1_w, col2_w, col3_w], 
                           ["Bước", "Hành động của Tác nhân (Actor Action)", "Phản hồi của Hệ thống (System Response)"],
                           [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]):
        c.width = w
        set_cell_background(c, "003366")
        set_cell_margins(c, top=100, bottom=100, left=100, right=100)
        format_cell_text(c, t, bold=True, color_rgb=RGBColor(255, 255, 255), size_pt=10, align=al)
        
    for idx, (step, actor_act, sys_resp) in enumerate(events, start=1):
        row = table.rows[idx]
        for c, w, t, al in zip(row.cells, [col1_w, col2_w, col3_w], [step, actor_act, sys_resp],
                               [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]):
            c.width = w
            if idx % 2 == 1:
                set_cell_background(c, "FAFCFD")
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
            format_cell_text(c, t, size_pt=10, align=al)
            
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

print("Setup completed successfully.")
