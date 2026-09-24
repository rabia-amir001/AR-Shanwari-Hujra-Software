/**
 * ReceiptDesigner.jsx
 * Complete thermal receipt designer — header to footer.
 * Changes here affect both the live preview AND the actual thermal print.
 * Uses receiptGenerator.js as the single renderer for both.
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  GripVertical, Eye, EyeOff, ChevronDown, ChevronRight,
  Upload, X, Printer, Save, RotateCcw, Plus, Copy, Trash2,
  AlignLeft, AlignCenter, AlignRight, Settings2,
  QrCode, Image, FileText, Layers, CreditCard, Palette, Type
} from 'lucide-react';
import {
  THERMAL_FONT_OPTIONS,
  DEFAULT_SECTION_ORDER,
  DEFAULT_TEMPLATE,
  getReceiptStyles,
  getReceiptInnerHtml
} from '../utils/receiptGenerator';

const SECTION_META = {
  logo:              { label: 'Logo',              color: '#8B4513' },
  restaurant_name:   { label: 'Restaurant Name',   color: '#1565C0' },
  header_info:       { label: 'Header Info',       color: '#2E7D32' },
  invoice_meta:      { label: 'Order Information', color: '#E65100' },
  items_table:       { label: 'Products',          color: '#6A1B9A' },
  totals_table:      { label: 'Totals',            color: '#00695C' },
  payment_breakdown: { label: 'Payment',           color: '#C62828' },
  qr_code:           { label: 'QR Code',           color: '#1565C0' },
  footer_message:    { label: 'Footer',            color: '#37474F' }
};

const DIVIDER_STYLES = ['dashed', 'solid', 'dotted', 'double', 'none'];
const PAPER_SIZES    = ['58mm', '80mm', 'Custom'];

/* ─── Reusable micro-components ──────────────────────────────────────────── */

const Toggle = ({ checked, onChange, label, small }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: small ? 6 : 8, cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}>
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: small ? 32 : 38, height: small ? 18 : 22, borderRadius: 99,
        backgroundColor: checked ? '#2E7D32' : '#CCC', position: 'relative', flexShrink: 0, cursor: 'pointer'
      }}
    >
      <div style={{
        position: 'absolute', top: small ? 2 : 3, left: checked ? (small ? 16 : 18) : 3,
        width: small ? 14 : 16, height: small ? 14 : 16, borderRadius: '50%',
        backgroundColor: '#fff', transition: 'left 0.18s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }} />
    </div>
    {label && <span style={{ fontSize: 13, color: '#1F130B', fontWeight: 500 }}>{label}</span>}
  </label>
);

const AlignPicker = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[['left', <AlignLeft size={13} />], ['center', <AlignCenter size={13} />], ['right', <AlignRight size={13} />]].map(([v, ico]) => (
      <button key={v} type="button" onClick={() => onChange(v)} style={{
        padding: '5px 10px', border: '1px solid', borderRadius: 7, cursor: 'pointer',
        borderColor: value === v ? '#8B4513' : '#DDD',
        backgroundColor: value === v ? '#FFF8F0' : '#F9F9F9',
        color: value === v ? '#8B4513' : '#666', display: 'flex', alignItems: 'center'
      }}>{ico}</button>
    ))}
  </div>
);

const NumInput = ({ label, value, onChange, min = 0, max = 999, step = 1, unit = '', width = 72 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    {label && <span style={{ fontSize: 11, color: '#7A695E', fontWeight: 600 }}>{label}</span>}
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <input type="number" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={{ width, padding: '5px 8px', border: '1px solid #DDD', borderRadius: 7, fontSize: 13, background: '#fff' }} />
      {unit && <span style={{ fontSize: 11, color: '#7A695E' }}>{unit}</span>}
    </div>
  </div>
);

const TxtInput = ({ label, value, onChange, placeholder = '', full }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: full ? '100%' : undefined }}>
    {label && <span style={{ fontSize: 11, color: '#7A695E', fontWeight: 600 }}>{label}</span>}
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ padding: '6px 10px', border: '1px solid #DDD', borderRadius: 7, fontSize: 13, background: '#fff', width: full ? '100%' : undefined, boxSizing: 'border-box' }} />
  </div>
);

const TxtArea = ({ label, value, onChange, placeholder = '', rows = 2 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
    {label && <span style={{ fontSize: 11, color: '#7A695E', fontWeight: 600 }}>{label}</span>}
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ padding: '6px 10px', border: '1px solid #DDD', borderRadius: 7, fontSize: 13, resize: 'vertical', width: '100%', boxSizing: 'border-box', background: '#fff' }} />
  </div>
);

const Accord = ({ title, iconColor = '#8B4513', children, open: forceOpen }) => {
  const [open, setOpen] = useState(forceOpen !== undefined ? forceOpen : false);
  return (
    <div style={{ border: '1px solid #EFE6DA', borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: open ? '#FFF8F2' : '#FDFAF6', border: 'none', cursor: 'pointer' }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#1F130B', flex: 1 }}>{title}</span>
        {open ? <ChevronDown size={14} color="#7A695E" /> : <ChevronRight size={14} color="#7A695E" />}
      </button>
      {open && (
        <div style={{ padding: '14px 16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
      )}
    </div>
  );
};

const Row = ({ children, gap = 12 }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap, flexWrap: 'wrap' }}>{children}</div>
);

const SLbl = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#7A695E', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>{children}</div>
);

/* ─── Mock receipt for live preview ────────────────────────────────────────── */
const MOCK = {
  id: '1082', date: new Date().toLocaleString(), order_type: 'Dine-In', table_name: 'Table 4',
  customer_name: 'Tariq Mahmood', customer_phone: '0300-8451299',
  delivery_address: 'House 12, Street 4, Phase 2', rider_name: 'Asif Khan', created_by: 'Admin',
  subtotal: 3950, tax_rate: 16.0, tax_amount: 632, service_charges: 0, delivery_charges: 150,
  discount_amount: 200, total: 4532, payment_method: 'Cash', received_amount: 5000, change_returned: 468,
  items: [
    { name: 'Shinwari Mutton Karahi Full', price: 2800, quantity: 1, subtotal: 2800, urdu: 'شنواری مٹن کڑاہی فل', unit: 'Full' },
    { name: 'Chicken Seekh Kabab (4Pc)',  price: 300,  quantity: 2, subtotal: 600,  urdu: 'چکن سیخ کباب',       unit: 'Piece' },
    { name: 'Sajji Half + Rice',          price: 450,  quantity: 1, subtotal: 450,  urdu: 'سجی ہاف + چاول',      unit: 'Half' },
    { name: 'Fresh Green Salad',          price: 100,  quantity: 1, subtotal: 100,  urdu: 'سلاد',                unit: 'Bowl' }
  ]
};

/* ─── Visibility helpers ─────────────────────────────────────────────────── */
function getVis(key, t) {
  const h = t.header || {}, c = t.codes || {}, f = t.footer || {};
  if (key === 'logo')              return h.show_logo !== false && !!h.logo;
  if (key === 'restaurant_name')   return h.show_name !== false;
  if (key === 'header_info')       return h.show_address !== false || h.show_phone !== false;
  if (key === 'payment_breakdown') return (t.totals || {}).show_payment_method !== false;
  if (key === 'qr_code')           return !!c.show_qr;
  if (key === 'footer_message')    return f.show_footer !== false;
  return true;
}
function toggleVis(key, vis, updateT) {
  if (key === 'logo')              { updateT('header.show_logo', !vis); return; }
  if (key === 'restaurant_name')   { updateT('header.show_name', !vis); return; }
  if (key === 'header_info')       { updateT('header.show_address', !vis); return; }
  if (key === 'payment_breakdown') { updateT('totals.show_payment_method', !vis); return; }
  if (key === 'qr_code')           { updateT('codes.show_qr', !vis); return; }
  if (key === 'footer_message')    { updateT('footer.show_footer', !vis); return; }
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ReceiptDesigner({
  templates, setTemplates,
  activeTemplateId, setActiveTemplateId,
  orderTypeTemplates, setOrderTypeTemplates,
  paperWidth, setPaperWidth,
  customWidth, setCustomWidth,
  topMargin, setTopMargin,
  bottomMargin, setBottomMargin,
  leftMargin, setLeftMargin,
  rightMargin, setRightMargin,
  paddingLeftRight, setPaddingLeftRight,
  onSave, onTestPrint, onDirty, showToast
}) {
  const [dragSrc,  setDragSrc]  = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const logoRef = useRef(null);
  const qrRef   = useRef(null);

  const tpl = templates.find(t => t.id === activeTemplateId) || templates[0] || DEFAULT_TEMPLATE;

  /* deep-path updater */
  const updateT = useCallback((path, value) => {
    onDirty();
    setTemplates(prev => prev.map(t => {
      if (t.id !== activeTemplateId) return t;
      const parts   = path.split('.');
      const updated = JSON.parse(JSON.stringify(t));
      let obj = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      updated.last_edited = new Date().toISOString();
      return updated;
    }));
  }, [activeTemplateId, onDirty, setTemplates]);

  const hdr  = tpl.header    || {};
  const typo = tpl.typography || {};
  const cod  = tpl.codes     || {};
  const inv  = tpl.invoice   || {};
  const itm  = tpl.items     || {};
  const tot  = tpl.totals    || {};
  const ftr  = tpl.footer    || {};
  const div  = tpl.dividers  || {};
  const ssp  = tpl.section_spacing || {};
  const ord  = tpl.section_order   || [...DEFAULT_SECTION_ORDER];

  /* drag-and-drop */
  const dStart = (e, i) => { setDragSrc(i); e.dataTransfer.effectAllowed = 'move'; };
  const dOver  = (e, i) => { e.preventDefault(); setDragOver(i); };
  const dDrop  = (e, i) => {
    e.preventDefault();
    if (dragSrc === null || dragSrc === i) { setDragSrc(null); setDragOver(null); return; }
    const next = [...ord]; const [m] = next.splice(dragSrc, 1); next.splice(i, 0, m);
    updateT('section_order', next); setDragSrc(null); setDragOver(null);
  };
  const dEnd = () => { setDragSrc(null); setDragOver(null); };

  const imgUp = (file, field) => {
    if (!file) return;
    const r = new FileReader(); r.onload = e => updateT(field, e.target.result); r.readAsDataURL(file);
  };

  /* template actions */
  const newTpl = () => {
    const name = window.prompt('New template name:');
    if (!name || !name.trim()) return;
    const b = JSON.parse(JSON.stringify(tpl));
    b.id = 'tpl_' + Date.now(); b.name = name.trim(); b.is_default = false; b.last_edited = new Date().toISOString();
    setTemplates(p => [...p, b]); setActiveTemplateId(b.id); onDirty();
    showToast('Template created: ' + b.name, 'success');
  };
  const dupTpl = () => {
    const b = JSON.parse(JSON.stringify(tpl));
    b.id = 'tpl_' + Date.now(); b.name = tpl.name + ' (Copy)'; b.is_default = false; b.last_edited = new Date().toISOString();
    setTemplates(p => [...p, b]); setActiveTemplateId(b.id); onDirty();
    showToast('Duplicated: ' + b.name, 'success');
  };
  const delTpl = () => {
    if (templates.length <= 1) return showToast('At least one template required.', 'warning');
    if (!window.confirm('Delete template "' + tpl.name + '"?')) return;
    const rem = templates.filter(t => t.id !== activeTemplateId);
    if (tpl.is_default && rem.length > 0) rem[0].is_default = true;
    setTemplates(rem); setActiveTemplateId(rem[0].id); onDirty();
  };
  const setDef = () => { setTemplates(p => p.map(t => ({ ...t, is_default: t.id === activeTemplateId }))); onDirty(); showToast('Default updated.', 'success'); };
  const resetTpl = () => {
    if (!window.confirm('Reset to factory defaults?')) return;
    const f = JSON.parse(JSON.stringify(DEFAULT_TEMPLATE));
    f.id = activeTemplateId; f.name = tpl.name; f.is_default = tpl.is_default; f.last_edited = new Date().toISOString();
    setTemplates(p => p.map(t => t.id === activeTemplateId ? f : t)); onDirty();
    showToast('Reset to defaults.', 'info');
  };

  /* live preview */
  const ps  = { top_margin: topMargin, bottom_margin: bottomMargin, left_margin: leftMargin, right_margin: rightMargin, padding_left_right: paddingLeftRight, custom_width: customWidth };
  const pxW = paperWidth === '58mm' ? 220 : paperWidth === '80mm' ? 302 : ((customWidth || 72) * 3.78);
  const previewCss  = getReceiptStyles(paperWidth, false, ps, tpl);
  const previewHtml = getReceiptInnerHtml(MOCK, ps, paperWidth, tpl);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 390px)', gap: 20, alignItems: 'start' }}>

      {/* ═══ LEFT: SETTINGS PANEL ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Template Bar */}
        <div style={D.card}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <span style={D.ttl}>Receipt Templates</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button type="button" onClick={newTpl} style={D.pill}><Plus size={13} /> New</button>
              <button type="button" onClick={dupTpl} style={D.pill}><Copy size={13} /> Duplicate</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            {templates.map(t => (
              <div key={t.id}
                style={{ ...D.tRow, borderColor: t.id === activeTemplateId ? '#8B4513' : '#EFE6DA', background: t.id === activeTemplateId ? '#FFF8F0' : '#FDFAF6' }}
                onClick={() => setActiveTemplateId(t.id)}>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{t.name}</span>
                {t.is_default && <span style={D.badge}>Default</span>}
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  {!t.is_default && t.id === activeTemplateId && <button type="button" onClick={setDef} style={D.micro}>Set Default</button>}
                  {templates.length > 1 && t.id === activeTemplateId && <button type="button" onClick={delTpl} style={{ ...D.ico, color: '#C62828' }}><Trash2 size={12} /></button>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #EFE6DA', paddingTop: 12 }}>
            <SLbl>Assign Templates to Order Types</SLbl>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {['Dine-In', 'Takeaway', 'Delivery'].map(ot => (
                <div key={ot} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, width: 80 }}>{ot}</span>
                  <select value={orderTypeTemplates[ot] || templates[0]?.id || ''}
                    onChange={e => { setOrderTypeTemplates(p => ({ ...p, [ot]: e.target.value })); onDirty(); }}
                    style={D.sel}>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Reorder */}
        <div style={D.card}>
          <span style={{ ...D.ttl, display: 'block', marginBottom: 8 }}>Section Order &amp; Visibility</span>
          <p style={{ fontSize: 12, color: '#7A695E', marginBottom: 12 }}>Drag ⠿ to reorder. Toggle eye to show/hide sections on receipt.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ord.map((key, i) => {
              const meta = SECTION_META[key] || { label: key, color: '#666' };
              const vis  = getVis(key, tpl);
              return (
                <div key={key} draggable
                  onDragStart={e => dStart(e, i)} onDragOver={e => dOver(e, i)}
                  onDrop={e => dDrop(e, i)}       onDragEnd={dEnd}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9,
                    border: '1px solid ' + (dragOver === i ? '#8B4513' : '#EFE6DA'),
                    background: dragSrc === i ? '#FFF8F0' : dragOver === i ? '#FFF3E8' : '#FDFAF6',
                    cursor: 'grab', opacity: dragSrc === i ? 0.5 : 1
                  }}>
                  <GripVertical size={14} color="#AAA" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: meta.color, flex: 1 }}>{meta.label}</span>
                  <span style={{ fontSize: 10, color: '#AAA', fontFamily: 'monospace' }}>{i + 1}</span>
                  <button type="button" onClick={() => toggleVis(key, vis, updateT)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: vis ? '#2E7D32' : '#CCC' }}
                    title={vis ? 'Hide' : 'Show'}>
                    {vis ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* HEADER */}
        <Accord title="Header" open>
          {/* Logo */}
          <div>
            <SLbl>Logo</SLbl>
            <Toggle checked={hdr.show_logo !== false} onChange={v => updateT('header.show_logo', v)} label="Show Logo" />
            {hdr.show_logo !== false && (<>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="button" onClick={() => logoRef.current?.click()} style={D.up}><Upload size={13} /> Upload Logo</button>
                {hdr.logo && <button type="button" onClick={() => updateT('header.logo', '')} style={D.danger}><X size={12} /> Remove</button>}
              </div>
              <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }}
                onChange={e => imgUp(e.target.files[0], 'header.logo')} />
              {hdr.logo && <img src={hdr.logo} alt="Logo" style={{ marginTop: 8, maxHeight: 60, maxWidth: 180, objectFit: 'contain', borderRadius: 6, border: '1px solid #EFE6DA' }} />}
              <Row style={{ marginTop: 8 }}>
                <NumInput label="Width (px)" value={hdr.logo_width || 100} onChange={v => updateT('header.logo_width', v)} min={20} max={300} />
                <NumInput label="Max Height (px)" value={hdr.logo_height || 50} onChange={v => updateT('header.logo_height', v)} min={20} max={200} />
              </Row>
              <div style={{ marginTop: 8 }}><SLbl>Logo Alignment</SLbl><AlignPicker value={hdr.logo_align || 'center'} onChange={v => updateT('header.logo_align', v)} /></div>
            </>)}
          </div>

          {/* Name / Subtitle */}
          <div>
            <SLbl>Restaurant Name &amp; Subtitle</SLbl>
            <Row gap={16}>
              <Toggle checked={hdr.show_name !== false} onChange={v => updateT('header.show_name', v)} label="Show Name" />
              <Toggle checked={hdr.show_subtitle !== false} onChange={v => updateT('header.show_subtitle', v)} label="Show Subtitle" />
            </Row>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <TxtInput label="Restaurant Name" value={hdr.restaurant_name || ''} onChange={v => updateT('header.restaurant_name', v)} placeholder="e.g. AR Shinwari Hujra" full />
              <TxtInput label="Subtitle" value={hdr.subtitle || ''} onChange={v => updateT('header.subtitle', v)} placeholder="e.g. Authentic Shinwari BBQ" full />
            </div>
            <div style={{ marginTop: 8 }}><SLbl>Header Alignment</SLbl><AlignPicker value={typo.header_align || 'center'} onChange={v => updateT('typography.header_align', v)} /></div>
          </div>

          {/* Contact */}
          <div>
            <SLbl>Contact Information</SLbl>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Toggle small checked={hdr.show_address !== false} onChange={v => updateT('header.show_address', v)} label="Address" />
              {hdr.show_address !== false && <TxtInput value={hdr.address || ''} onChange={v => updateT('header.address', v)} placeholder="Restaurant address" full />}
              <Toggle small checked={hdr.show_phone !== false} onChange={v => updateT('header.show_phone', v)} label="Phone" />
              {hdr.show_phone !== false && <TxtInput value={hdr.phone || ''} onChange={v => updateT('header.phone', v)} placeholder="0300-0000000" full />}
              <Toggle small checked={hdr.show_delivery_phone !== false} onChange={v => updateT('header.show_delivery_phone', v)} label="Delivery / Helpline Phone" />
              {hdr.show_delivery_phone !== false && <TxtInput value={hdr.delivery_phone || ''} onChange={v => updateT('header.delivery_phone', v)} placeholder="Delivery helpline" full />}
              <Toggle small checked={!!hdr.show_website} onChange={v => updateT('header.show_website', v)} label="Website" />
              {hdr.show_website && <TxtInput value={hdr.website || ''} onChange={v => updateT('header.website', v)} placeholder="www.example.com" full />}
              <Toggle small checked={!!hdr.show_email} onChange={v => updateT('header.show_email', v)} label="Email" />
              {hdr.show_email && <TxtInput value={hdr.email || ''} onChange={v => updateT('header.email', v)} placeholder="contact@example.com" full />}
            </div>
          </div>

          {/* Custom header text */}
          <div>
            <Toggle small checked={!!hdr.show_custom_header_text} onChange={v => updateT('header.show_custom_header_text', v)} label="Custom Header Text Block" />
            {hdr.show_custom_header_text && <TxtArea value={hdr.custom_header_text || ''} onChange={v => updateT('header.custom_header_text', v)} placeholder="e.g. All prices inclusive of tax." rows={2} />}
          </div>
          <Row>
            <NumInput label="Header Top Spacing" value={hdr.header_top_spacing || 0} onChange={v => updateT('header.header_top_spacing', v)} unit="px" />
            <NumInput label="Header Bottom Spacing" value={hdr.header_bottom_spacing || 4} onChange={v => updateT('header.header_bottom_spacing', v)} unit="px" />
          </Row>
        </Accord>

        {/* ORDER INFO */}
        <Accord title="Order Information">
          <SLbl>Show / Hide Fields</SLbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['show_invoice_no','Invoice / Order Number'],['show_date','Date'],['show_time','Time'],['show_order_type','Order Type'],
              ['show_cashier','Cashier / Staff'],['show_table','Table Number'],['show_customer_name','Customer Name'],
              ['show_customer_phone','Customer Phone'],['show_delivery_address','Delivery Address'],['show_rider','Rider Name']
            ].map(([k, l]) => <Toggle key={k} small checked={inv[k] !== false} onChange={v => updateT('invoice.' + k, v)} label={l} />)}
          </div>
          <TxtInput label="Invoice Prefix" value={inv.prefix !== undefined ? inv.prefix : '#'} onChange={v => updateT('invoice.prefix', v)} placeholder="e.g. # or INV-" />
          <div>
            <SLbl>Custom Label Overrides (blank = use defaults)</SLbl>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
              {[['invoice','Invoice Label','e.g. Bill No'],['table','Table Label','e.g. Meiz'],['cashier','Cashier Label','e.g. Served By']].map(([k, l, ph]) => (
                <TxtInput key={k} label={l} value={(inv.custom_labels || {})[k] || ''}
                  onChange={v => updateT('invoice.custom_labels', { ...(inv.custom_labels || {}), [k]: v })} placeholder={ph} full />
              ))}
            </div>
          </div>
        </Accord>

        {/* PRODUCTS */}
        <Accord title="Products / Items">
          <SLbl>Show / Hide Columns</SLbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['show_name','Product Name'],['show_urdu','Urdu / Secondary Name'],['show_qty','Quantity'],
              ['show_price_each','Unit Price'],['show_subtotal','Line Total'],['show_unit','Unit'],['show_item_code','Item Code']
            ].map(([k, l]) => <Toggle key={k} small checked={itm[k] !== false} onChange={v => updateT('items.' + k, v)} label={l} />)}
          </div>
          <div>
            <SLbl>Column Widths (total should be 100%)</SLbl>
            <Row>
              <NumInput label="Name %" value={itm.col_name_width || 58} onChange={v => updateT('items.col_name_width', v)} min={20} max={80} unit="%" />
              <NumInput label="Qty %" value={itm.col_qty_width || 15} onChange={v => updateT('items.col_qty_width', v)} min={8} max={30} unit="%" />
              <NumInput label="Total %" value={itm.col_total_width || 27} onChange={v => updateT('items.col_total_width', v)} min={10} max={40} unit="%" />
            </Row>
            <p style={{ fontSize: 11, color: '#7A695E', marginTop: 4 }}>Sum: {(itm.col_name_width || 58) + (itm.col_qty_width || 15) + (itm.col_total_width || 27)}%</p>
          </div>
          <div>
            <SLbl>Column Header Text</SLbl>
            <Row>
              <TxtInput label="Item Col" value={itm.header_text_item || 'Item'} onChange={v => updateT('items.header_text_item', v)} />
              <TxtInput label="Qty Col" value={itm.header_text_qty || 'Qty'} onChange={v => updateT('items.header_text_qty', v)} />
              <TxtInput label="Total Col" value={itm.header_text_total || 'Amount'} onChange={v => updateT('items.header_text_total', v)} />
            </Row>
          </div>
          <Row>
            <NumInput label="Item Font Size" value={itm.item_font_size || 12} onChange={v => updateT('items.item_font_size', v)} min={8} max={18} unit="px" />
            <NumInput label="Row Spacing" value={itm.row_spacing || 4} onChange={v => updateT('items.row_spacing', v)} min={0} max={20} unit="px" />
          </Row>
          <Toggle checked={typo.bold_items !== false} onChange={v => updateT('typography.bold_items', v)} label="Bold product names" />
        </Accord>

        {/* TOTALS */}
        <Accord title="Totals &amp; Payment">
          <SLbl>Show / Hide Lines</SLbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['show_subtotal','Subtotal'],['show_tax','Tax / GST'],['show_service_charges','Service Charges'],
              ['show_delivery_charges','Delivery Charges'],['show_discount','Discount'],['show_grand_total','Grand Total'],
              ['show_payment_method','Payment Method'],['show_received','Amount Received'],['show_change','Change Returned']
            ].map(([k, l]) => <Toggle key={k} small checked={tot[k] !== false} onChange={v => updateT('totals.' + k, v)} label={l} />)}
          </div>
          <Row>
            <NumInput label="Grand Total Font Size" value={tot.total_font_size || 14} onChange={v => updateT('totals.total_font_size', v)} min={10} max={22} unit="px" />
          </Row>
          <Toggle checked={tot.total_bold !== false} onChange={v => updateT('totals.total_bold', v)} label="Bold Grand Total" />
          <div><SLbl>Totals Alignment</SLbl><AlignPicker value={tot.totals_align || 'right'} onChange={v => updateT('totals.totals_align', v)} /></div>
        </Accord>

        {/* QR */}
        <Accord title="QR Code">
          <Toggle checked={!!cod.show_qr} onChange={v => updateT('codes.show_qr', v)} label="Show QR Code on Receipt" />
          {cod.show_qr && (<>
            <div>
              <SLbl>QR Source</SLbl>
              <p style={{ fontSize: 11, color: '#7A695E', marginBottom: 8 }}>Upload QR image OR enter payment URL (auto-generates QR).</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => qrRef.current?.click()} style={D.up}><Upload size={13} /> Upload QR</button>
                {cod.qr_code_image && <button type="button" onClick={() => updateT('codes.qr_code_image', '')} style={D.danger}><X size={12} /> Remove</button>}
              </div>
              <input ref={qrRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => imgUp(e.target.files[0], 'codes.qr_code_image')} />
              <div style={{ marginTop: 8 }}>
                <TxtInput label="OR enter URL / text" value={cod.qr_code_image?.startsWith('data:') ? '' : (cod.qr_code_image || '')}
                  onChange={v => updateT('codes.qr_code_image', v)} placeholder="https://jazzcash.com.pk/..." full />
              </div>
              {cod.qr_code_image && (
                <img alt="QR"
                  src={cod.qr_code_image.startsWith('data:') ? cod.qr_code_image : 'https://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent(cod.qr_code_image) + '&size=100x100'}
                  style={{ marginTop: 8, width: 80, height: 80, borderRadius: 6, border: '1px solid #EFE6DA' }} />
              )}
            </div>
            <TxtInput label="QR Title / Label" value={cod.qr_title || 'Scan to Pay'} onChange={v => updateT('codes.qr_title', v)} placeholder="e.g. Scan to Pay" full />
            <Row>
              <NumInput label="Width" value={cod.qr_width || 120} onChange={v => updateT('codes.qr_width', v)} min={60} max={250} unit="px" />
              <NumInput label="Height" value={cod.qr_height || 120} onChange={v => updateT('codes.qr_height', v)} min={60} max={250} unit="px" />
            </Row>
            <div><SLbl>QR Alignment</SLbl><AlignPicker value={cod.qr_align || 'center'} onChange={v => updateT('codes.qr_align', v)} /></div>
            <div>
              <SLbl>QR Position</SLbl>
              <div style={{ display: 'flex', gap: 6 }}>
                {['header', 'middle', 'footer'].map(pos => (
                  <button key={pos} type="button" onClick={() => updateT('codes.qr_position', pos)} style={{
                    padding: '5px 12px', border: '1px solid', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    borderColor: (cod.qr_position || 'footer') === pos ? '#8B4513' : '#DDD',
                    background: (cod.qr_position || 'footer') === pos ? '#FFF8F0' : '#F9F9F9',
                    color: (cod.qr_position || 'footer') === pos ? '#8B4513' : '#666'
                  }}>{pos.charAt(0).toUpperCase() + pos.slice(1)}</button>
                ))}
              </div>
            </div>
          </>)}
        </Accord>

        {/* FOOTER */}
        <Accord title="Footer">
          <Toggle checked={ftr.show_footer !== false} onChange={v => updateT('footer.show_footer', v)} label="Show Footer" />
          {ftr.show_footer !== false && (<>
            <SLbl>Footer Messages</SLbl>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <TxtArea label="Line 1" value={ftr.message_1 || ''} onChange={v => updateT('footer.message_1', v)} placeholder="Thank you for dining with us!" rows={1} />
              <TxtArea label="Line 2" value={ftr.message_2 || ''} onChange={v => updateT('footer.message_2', v)} placeholder="Visit Again" rows={1} />
              <TxtArea label="Line 3" value={ftr.message_3 || ''} onChange={v => updateT('footer.message_3', v)} placeholder="Optional line 3" rows={1} />
              <TxtArea label="Line 4" value={ftr.message_4 || ''} onChange={v => updateT('footer.message_4', v)} placeholder="e.g. No refund without receipt" rows={1} />
            </div>
            <div>
              <Toggle small checked={!!ftr.show_website_footer} onChange={v => updateT('footer.show_website_footer', v)} label="Show Website" />
              {ftr.show_website_footer && <TxtInput value={ftr.website_footer_text || ''} onChange={v => updateT('footer.website_footer_text', v)} placeholder="www.example.com" full />}
            </div>
            <div>
              <Toggle small checked={!!ftr.show_social} onChange={v => updateT('footer.show_social', v)} label="Show Social Media" />
              {ftr.show_social && <TxtInput value={ftr.social_text || ''} onChange={v => updateT('footer.social_text', v)} placeholder="Facebook: AR Shinwari" full />}
            </div>
            <div>
              <Toggle small checked={!!ftr.show_tax_number} onChange={v => updateT('footer.show_tax_number', v)} label="Show NTN / Tax Number" />
              {ftr.show_tax_number && <TxtInput value={ftr.tax_number || ''} onChange={v => updateT('footer.tax_number', v)} placeholder="NTN: 1234567-8" full />}
            </div>
            <TxtInput label="Contact Info" value={ftr.contact_info || ''} onChange={v => updateT('footer.contact_info', v)} placeholder="For Delivery: 0300-XXXXXXX" full />
            <div><SLbl>Footer Alignment</SLbl><AlignPicker value={ftr.alignment || 'center'} onChange={v => updateT('footer.alignment', v)} /></div>
            <NumInput label="Footer Top Spacing" value={ftr.footer_top_spacing || 6} onChange={v => updateT('footer.footer_top_spacing', v)} unit="px" />
          </>)}
        </Accord>

        {/* TYPOGRAPHY */}
        <Accord title="Typography &amp; Fonts">
          <div>
            <SLbl>Font Family</SLbl>
            <select value={typo.font_family || 'monospace'} onChange={e => updateT('typography.font_family', e.target.value)} style={{ ...D.sel, width: '100%' }}>
              {THERMAL_FONT_OPTIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <SLbl>Receipt Language</SLbl>
            <select value={tpl.language || 'en'} onChange={e => updateT('language', e.target.value)} style={{ ...D.sel, width: '100%' }}>
              <option value="en">English Only</option>
              <option value="ur">Urdu Only</option>
              <option value="bilingual">Bilingual (English + Urdu)</option>
            </select>
          </div>
          <SLbl>Font Sizes (px)</SLbl>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <NumInput label="Restaurant Name" value={typo.restaurant_name_size || 18} onChange={v => updateT('typography.restaurant_name_size', v)} min={10} max={30} unit="px" />
            <NumInput label="Header" value={typo.header_font_size || 16} onChange={v => updateT('typography.header_font_size', v)} min={8} max={24} unit="px" />
            <NumInput label="Body / Items" value={typo.item_name_size || 12} onChange={v => updateT('typography.item_name_size', v)} min={8} max={18} unit="px" />
            <NumInput label="Grand Total" value={typo.total_size || 14} onChange={v => updateT('typography.total_size', v)} min={10} max={22} unit="px" />
            <NumInput label="Footer" value={typo.footer_size || 10} onChange={v => updateT('typography.footer_size', v)} min={7} max={16} unit="px" />
            <NumInput label="Subtitle" value={typo.subtitle_font_size || 11} onChange={v => updateT('typography.subtitle_font_size', v)} min={7} max={16} unit="px" />
          </div>
          <Row>
            <NumInput label="Line Spacing" value={typo.line_spacing || 1.2} onChange={v => updateT('typography.line_spacing', v)} min={1} max={3} step={0.05} />
            <NumInput label="Letter Spacing" value={typo.char_spacing || 0} onChange={v => updateT('typography.char_spacing', v)} min={-1} max={4} step={0.1} unit="px" />
          </Row>
          <Toggle checked={typo.bold_items !== false} onChange={v => updateT('typography.bold_items', v)} label="Bold product names in items table" />
        </Accord>

        {/* PAPER & SPACING */}
        <Accord title="Paper, Margins &amp; Spacing">
          <div>
            <SLbl>Paper Width</SLbl>
            <div style={{ display: 'flex', gap: 8 }}>
              {PAPER_SIZES.map(s => (
                <button key={s} type="button" onClick={() => setPaperWidth(s)} style={{
                  padding: '6px 14px', border: '1px solid', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  borderColor: paperWidth === s ? '#8B4513' : '#DDD',
                  background: paperWidth === s ? '#FFF8F0' : '#F9F9F9',
                  color: paperWidth === s ? '#8B4513' : '#666'
                }}>{s}</button>
              ))}
            </div>
            {paperWidth === 'Custom' && <Row style={{ marginTop: 8 }}><NumInput label="Custom Width" value={customWidth || 72} onChange={v => setCustomWidth(v)} min={40} max={200} unit="mm" /></Row>}
          </div>
          <div>
            <SLbl>Margins (mm)</SLbl>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <NumInput label="Top" value={topMargin || 0} onChange={setTopMargin} min={0} max={30} unit="mm" />
              <NumInput label="Bottom" value={bottomMargin || 5} onChange={setBottomMargin} min={0} max={30} unit="mm" />
              <NumInput label="Left" value={leftMargin || 0} onChange={setLeftMargin} min={0} max={20} unit="mm" />
              <NumInput label="Right" value={rightMargin || 0} onChange={setRightMargin} min={0} max={20} unit="mm" />
            </div>
          </div>
          <NumInput label="Inner Padding (L+R)" value={paddingLeftRight || 3} onChange={setPaddingLeftRight} min={0} max={20} unit="mm" />
          <div>
            <SLbl>Section Spacing (px)</SLbl>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <NumInput label="After Logo" value={ssp.after_logo || 4} onChange={v => updateT('section_spacing.after_logo', v)} unit="px" />
              <NumInput label="After Header" value={ssp.after_header_info || 6} onChange={v => updateT('section_spacing.after_header_info', v)} unit="px" />
              <NumInput label="After Order Info" value={ssp.after_invoice_meta || 6} onChange={v => updateT('section_spacing.after_invoice_meta', v)} unit="px" />
              <NumInput label="After Items" value={ssp.after_items || 4} onChange={v => updateT('section_spacing.after_items', v)} unit="px" />
              <NumInput label="After Totals" value={ssp.after_totals || 4} onChange={v => updateT('section_spacing.after_totals', v)} unit="px" />
              <NumInput label="After Payment" value={ssp.after_payment || 4} onChange={v => updateT('section_spacing.after_payment', v)} unit="px" />
              <NumInput label="After QR" value={ssp.after_qr || 6} onChange={v => updateT('section_spacing.after_qr', v)} unit="px" />
            </div>
          </div>
        </Accord>

        {/* DIVIDERS */}
        <Accord title="Divider Style">
          <div>
            <SLbl>Divider Line Style</SLbl>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DIVIDER_STYLES.map(s => (
                <button key={s} type="button" onClick={() => updateT('dividers.style', s)} style={{
                  padding: '5px 12px', border: '1px solid', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  borderColor: (div.style || 'dashed') === s ? '#8B4513' : '#DDD',
                  background: (div.style || 'dashed') === s ? '#FFF8F0' : '#F9F9F9',
                  color: (div.style || 'dashed') === s ? '#8B4513' : '#666'
                }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
              ))}
            </div>
          </div>
          <NumInput label="Divider Margin" value={div.spacing || 6} onChange={v => updateT('dividers.spacing', v)} unit="px" />
        </Accord>

        {/* ACTION BAR */}
        <div style={D.abar}>
          <button type="button" onClick={resetTpl} style={D.resetBtn}><RotateCcw size={14} /> Reset Template</button>
          <button type="button" onClick={onTestPrint} style={D.testBtn}><Printer size={14} /> Test Print</button>
          <button type="button" onClick={onSave} style={D.saveBtn}><Save size={14} /> Save Changes</button>
        </div>
      </div>

      {/* ═══ RIGHT: LIVE PREVIEW ═══ */}
      <div style={{ position: 'sticky', top: 16 }}>
        <div style={D.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1F130B' }}>Live Preview</span>
              <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: 99, border: '1px solid #C8E6C9' }}>WYSIWYG</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#8B4513', backgroundColor: '#FFF8F0', border: '1px solid #EFE6DA', padding: '3px 10px', borderRadius: 6 }}>{paperWidth}</span>
              <button type="button" onClick={onTestPrint} style={D.printBtn}><Printer size={12} /> Print</button>
            </div>
          </div>
          <div style={{ background: '#E0E0E0', padding: 14, borderRadius: 10, overflowY: 'auto', maxHeight: 'calc(100vh - 220px)', minHeight: 400 }}>
            <div className="thermal-receipt" style={{ background: '#fff', margin: '0 auto', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', maxWidth: pxW }}>
              <style dangerouslySetInnerHTML={{ __html: previewCss }} />
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#7A695E', marginTop: 10, textAlign: 'center' }}>Preview uses sample data. Actual print uses live order data.</p>
        </div>
      </div>
    </div>
  );
}

const D = {
  card:     { background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #EFE6DA', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  ttl:      { fontSize: 15, fontWeight: 800, color: '#1F130B' },
  tRow:     { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid', cursor: 'pointer' },
  badge:    { fontSize: 10, fontWeight: 700, color: '#2E7D32', background: '#E8F5E9', padding: '2px 7px', borderRadius: 99, border: '1px solid #C8E6C9', marginLeft: 8 },
  pill:     { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #EFE6DA', background: '#FAF6F0', color: '#1F130B', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  micro:    { padding: '4px 8px', borderRadius: 6, border: '1px solid #EFE6DA', background: '#FAF6F0', color: '#1F130B', fontSize: 11, fontWeight: 600, cursor: 'pointer' },
  danger:   { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, border: '1px solid #FFCDD2', background: '#FFF5F5', color: '#C62828', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  ico:      { padding: '4px 6px', borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  up:       { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1px dashed #CCC', background: '#FAFAFA', color: '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  sel:      { padding: '6px 10px', border: '1px solid #DDD', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' },
  abar:     { display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', paddingTop: 16 },
  resetBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: '1px solid #FFCDD2', background: '#FFF5F5', color: '#C62828', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  testBtn:  { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: '1px solid #E0E0E0', background: '#F5F5F5', color: '#1F130B', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  saveBtn:  { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none', background: '#2E7D32', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  printBtn: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, border: '1px solid #DDD', background: '#F9F9F9', color: '#1F130B', fontSize: 11, fontWeight: 600, cursor: 'pointer' }
};
