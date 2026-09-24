/**
 * Receipt Layout & Template Engine for Electron + React POS System
 * Unifies printed slip rendering, multi-template customization, and screen previews.
 */

export const THERMAL_FONT_OPTIONS = [
  { id: 'monospace', name: 'Courier New (Classic Thermal)', family: "'Courier New', Courier, monospace" },
  { id: 'clean_sans', name: 'Segoe UI / Arial (Clean Sans)', family: "'Segoe UI', Arial, sans-serif" },
  { id: 'modern_helvetica', name: 'Helvetica Neue (Modern)', family: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { id: 'compact_mono', name: 'Lucida Console (Compact)', family: "'Lucida Console', Monaco, monospace" },
  { id: 'tech_mono', name: 'Consolas (Tech Mono)', family: "'Consolas', 'Courier New', monospace" },
  { id: 'classic_serif', name: 'Georgia (Classic Serif)', family: "'Georgia', 'Times New Roman', serif" },
  { id: 'condensed_sans', name: 'Trebuchet MS (High Density)', family: "'Trebuchet MS', 'Arial Narrow', sans-serif" },
  { id: 'dot_matrix', name: 'Dot Matrix Simulation', family: "'Courier New', monospace" }
];

export const DEFAULT_SECTION_ORDER = [
  'logo',
  'restaurant_name',
  'header_info',
  'invoice_meta',
  'items_table',
  'totals_table',
  'payment_breakdown',
  'qr_code',
  'footer_message'
];

export const DEFAULT_TEMPLATE = {
  id: 'standard-default',
  name: 'Standard Shinwari Receipt',
  is_default: true,
  last_edited: new Date().toISOString(),
  section_order: [...DEFAULT_SECTION_ORDER],
  dividers: {
    style: 'dashed',
    spacing: 6
  },
  section_spacing: {
    after_logo: 4,
    after_header_info: 6,
    after_invoice_meta: 6,
    after_items: 4,
    after_totals: 4,
    after_payment: 4,
    after_qr: 6
  },
  // Header
  header: {
    restaurant_name: 'AR Shinwari Hujra',
    subtitle: 'Authentic Shinwari & Traditional BBQ',
    address: 'Near Dunya Palace Hotel, Mor Sambrial',
    phone: '0300-0333128',
    delivery_phone: '0304-9665555',
    helpline: '',
    website: '',
    email: '',
    custom_header_text: '',
    logo: '',
    logo_width: 100,
    logo_height: 50,
    logo_align: 'center', // 'left', 'center', 'right'
    show_name: true,
    show_subtitle: true,
    show_address: true,
    show_phone: true,
    show_delivery_phone: true,
    show_logo: true,
    show_helpline: false,
    show_website: false,
    show_email: false,
    show_custom_header_text: false,
    header_top_spacing: 0,
    header_bottom_spacing: 4,
  },
  // Language: 'en' (English), 'ur' (Urdu), 'bilingual' (English + Urdu)
  language: 'en',
  // Typography
  typography: {
    font_family: 'monospace',
    header_font_size: 16,
    restaurant_name_size: 18,
    item_name_size: 12,
    price_size: 12,
    total_size: 14,
    footer_size: 10,
    line_spacing: 1.2,
    item_spacing: 4,
    char_spacing: 0,
    header_align: 'center',
    bold_items: true,
    subtitle_font_size: 11,
    meta_font_size: 11,
  },
  // Codes
  codes: {
    show_qr: false,
    qr_code_image: '',
    qr_width: 120,
    qr_height: 120,
    qr_title: 'Scan to Pay',
    qr_position: 'footer', // 'header', 'middle', 'footer'
    show_barcode: false,
    barcode_text: '',
    qr_align: 'center',
  },
  // Serial / Invoice metadata
  invoice: {
    prefix: '#',
    show_invoice_no: true,
    show_order_type: true,
    show_date: true,
    show_time: true,
    show_cashier: true,
    show_table: true,
    show_customer_name: true,
    show_customer_phone: true,
    show_delivery_address: true,
    show_rider: true,
    custom_labels: {},
  },
  // Totals
  totals: {
    show_subtotal: true,
    show_tax: true,
    show_discount: true,
    show_service_charges: true,
    show_delivery_charges: true,
    show_grand_total: true,
    show_received: true,
    show_change: true,
    show_payment_method: true,
    total_font_size: 14,
    total_bold: true,
    totals_align: 'right',
  },
  // Items table
  items: {
    show_name: true,
    show_urdu: true,
    show_price_each: true,
    show_qty: true,
    show_subtotal: true,
    show_item_code: false,
    show_unit: false,
    col_name_width: 58,
    col_qty_width: 15,
    col_total_width: 27,
    row_spacing: 4,
    header_text_item: 'Item',
    header_text_qty: 'Qty',
    header_text_total: 'Amount',
    item_font_size: 12,
  },
  // Payment
  payment: {
    show_breakdown: true,
    show_reference: false,
  },
  // Footer
  footer: {
    show_footer: true,
    message_1: 'Thank you for dining with us!',
    message_2: 'Visit Again',
    message_3: '',
    message_4: '',
    show_website_footer: false,
    website_footer_text: '',
    show_social: false,
    social_text: '',
    show_tax_number: false,
    contact_info: '',
    tax_number: '',
    alignment: 'center',
    footer_top_spacing: 6,
  }
};

export const RECEIPT_LABELS = {
  en: {
    invoice: 'Invoice',
    orderType: 'Type',
    date: 'Date',
    time: 'Time',
    cashier: 'Cashier',
    table: 'Table',
    customer: 'Customer',
    phone: 'Phone',
    address: 'Address',
    rider: 'Rider',
    item: 'Item',
    qty: 'Qty',
    price: 'Price',
    amount: 'Amount',
    subtotal: 'Subtotal',
    gst: 'GST',
    serviceCharges: 'Service Charges',
    deliveryCharges: 'Delivery Charges',
    discount: 'Discount',
    total: 'TOTAL',
    paymentMethod: 'Payment Method',
    cashReceived: 'Cash Received',
    changeReturned: 'Change Returned',
    scanToPay: 'Scan to Pay',
    thankYou: 'Thank you for dining with us!',
    visitAgain: 'Visit Again'
  },
  ur: {
    invoice: 'انوائس نمبر',
    orderType: 'آرڈر کی قسم',
    date: 'تاریخ',
    time: 'وقت',
    cashier: 'کیشیئر',
    table: 'ٹیبل',
    customer: 'گاہک کا نام',
    phone: 'فون نمبر',
    address: 'پتہ',
    rider: 'رائڈر',
    item: 'آئٹم',
    qty: 'تعداد',
    price: 'قیمت',
    amount: 'کل رقم',
    subtotal: 'سب ٹوٹل',
    gst: 'جی ایس ٹی ٹیکس',
    serviceCharges: 'سروس چارجز',
    deliveryCharges: 'ڈیلیوری چارجز',
    discount: 'رعایت',
    total: 'ٹوٹل واجب الادا',
    paymentMethod: 'طریقہ ادائیگی',
    cashReceived: 'وصول شدہ رقم',
    changeReturned: 'بقایا رقم',
    scanToPay: 'ادائیگی کے لیے اسکین کریں',
    thankYou: 'ہم سے خریداری کا شکریہ!',
    visitAgain: 'دوبارہ تشریف لائیے گا'
  },
  bilingual: {
    invoice: 'Invoice / انوائس',
    orderType: 'Type / قسم',
    date: 'Date / تاریخ',
    time: 'Time / وقت',
    cashier: 'Cashier / کیشیئر',
    table: 'Table / ٹیبل',
    customer: 'Customer / گاہک',
    phone: 'Phone / فون',
    address: 'Address / پتہ',
    rider: 'Rider / رائڈر',
    item: 'Item / آئٹم',
    qty: 'Qty / تعداد',
    price: 'Price / قیمت',
    amount: 'Amount / رقم',
    subtotal: 'Subtotal / سب ٹوٹل',
    gst: 'GST / ٹیکس',
    serviceCharges: 'Service / سروس',
    deliveryCharges: 'Delivery / ڈیلیوری',
    discount: 'Discount / رعایت',
    total: 'TOTAL / کل رقم',
    paymentMethod: 'Payment / ادائیگی',
    cashReceived: 'Received / وصولی',
    changeReturned: 'Change / بقایا',
    scanToPay: 'Scan to Pay / اسکین ادائیگی',
    thankYou: 'Thank you for dining with us! / شکریہ',
    visitAgain: 'Visit Again / دوبارہ تشریف لائیں'
  }
};

/**
 * Resolves the effective receipt template from settings and order type
 */
export function resolveReceiptTemplate(settings = {}, orderType = 'Takeaway') {
  let templates = [];
  if (settings.receipt_templates) {
    try {
      templates = typeof settings.receipt_templates === 'string' 
        ? JSON.parse(settings.receipt_templates) 
        : settings.receipt_templates;
    } catch (e) {
      console.error('Error parsing receipt_templates:', e);
    }
  }

  let assignedTemplateId = null;
  if (settings.order_type_templates) {
    try {
      const orderTypeMap = typeof settings.order_type_templates === 'string'
        ? JSON.parse(settings.order_type_templates)
        : settings.order_type_templates;
      if (orderTypeMap && orderTypeMap[orderType]) {
        assignedTemplateId = orderTypeMap[orderType];
      }
    } catch (e) {
      console.error('Error parsing order_type_templates:', e);
    }
  }

  let matched = null;
  if (assignedTemplateId && Array.isArray(templates)) {
    matched = templates.find(t => t.id === assignedTemplateId);
  }

  if (!matched && Array.isArray(templates) && templates.length > 0) {
    matched = templates.find(t => t.is_default) || templates[0];
  }

  // Merge matched template over DEFAULT_TEMPLATE and legacy settings properties
  const base = JSON.parse(JSON.stringify(DEFAULT_TEMPLATE));
  const t = matched ? { ...base, ...matched } : base;

  // Override template header with settings if not set specifically
  if (settings.restaurant_name && (!matched || !matched.header?.restaurant_name)) {
    t.header.restaurant_name = settings.restaurant_name;
  }
  if (settings.address && (!matched || !matched.header?.address)) {
    t.header.address = settings.address;
  }
  if (settings.phone && (!matched || !matched.header?.phone)) {
    t.header.phone = settings.phone;
  }
  if (settings.delivery_phone && (!matched || !matched.header?.delivery_phone)) {
    t.header.delivery_phone = settings.delivery_phone;
  }
  if (settings.logo && (!matched || !matched.header?.logo)) {
    t.header.logo = settings.logo;
  }
  if (settings.payment_qr_code && (!matched || !matched.codes?.qr_code_image)) {
    t.codes.qr_code_image = settings.payment_qr_code;
    t.codes.show_qr = true;
  }

  return t;
}

/**
 * Normalizes differences in receipt object shapes
 */
export function normalizeReceiptData(data) {
  if (!data) return null;
  
  const order = data.order || data;
  const items = data.items || [];
  
  return {
    id: order.id,
    date: order.created_at || order.date || '',
    customer_name: order.customer_name || '',
    customer_phone: order.customer_phone || '',
    delivery_address: order.delivery_address || '',
    rider_name: order.rider_name || '',
    order_type: order.order_type || 'Takeaway',
    table_name: order.table_name || '',
    created_by: order.created_by || order.cashier || '',
    subtotal: parseFloat(order.subtotal) || 0,
    tax_rate: parseFloat(order.tax_rate) || 0,
    tax_amount: parseFloat(order.tax_amount) || 0,
    discount_amount: parseFloat(order.discount_amount) || 0,
    service_charges: parseFloat(order.service_charges) || 0,
    delivery_charges: parseFloat(order.delivery_charges) || 0,
    total: parseFloat(order.total) || 0,
    payment_method: order.payment_method || '',
    payment_details: order.payment_details || '',
    received_amount: order.received_amount !== undefined ? parseFloat(order.received_amount) : 0,
    change_returned: order.change_returned !== undefined ? parseFloat(order.change_returned) : 0,
    items: items.map(item => ({
      name: item.product_name || item.name || '',
      price: parseFloat(item.price) || (item.quantity ? Math.round(parseFloat(item.subtotal) / parseFloat(item.quantity)) : 0),
      quantity: parseFloat(item.quantity) || 0,
      subtotal: parseFloat(item.subtotal) || 0,
      urdu: item.urdu || '',
      unit: item.unit || ''
    }))
  };
}

/**
 * Returns print-optimized styles for thermal slip rolls.
 */
export function getReceiptStyles(paperSize, isPrint = false, settings = {}, templateParam = null) {
  const template = templateParam || resolveReceiptTemplate(settings);
  const typo = template.typography || {};

  // Margins
  const topMargin = settings.top_margin !== undefined ? settings.top_margin : 0;
  const bottomMargin = settings.bottom_margin !== undefined ? settings.bottom_margin : 5;
  const leftMargin = settings.left_margin !== undefined ? settings.left_margin : 0;
  const rightMargin = settings.right_margin !== undefined ? settings.right_margin : 0;
  const paddingLR = settings.padding_left_right !== undefined ? settings.padding_left_right : 3;

  // Paper width
  let widthVal = '80mm';
  if (paperSize === '58mm') {
    widthVal = '58mm';
  } else if (paperSize === 'Custom') {
    widthVal = (settings.custom_width || 80) + 'mm';
  } else if (paperSize === 'A4') {
    widthVal = '100%';
  }

  // Font sizes
  const headerFontSize = (typo.header_font_size || settings.header_font_size || 16) + 'px';
  const restaurantNameSize = (typo.restaurant_name_size || typo.header_font_size || 18) + 'px';
  const bodyFontSize = (typo.item_name_size || settings.body_font_size || 12) + 'px';
  const footerFontSize = (typo.footer_size || settings.footer_font_size || 10) + 'px';
  const totalFontSize = (typo.total_size || (parseInt(bodyFontSize) + 2)) + 'px';
  const lineSpacing = typo.line_spacing || settings.line_spacing || 1.2;
  const itemSpacing = (typo.item_spacing !== undefined ? typo.item_spacing : (settings.item_spacing !== undefined ? settings.item_spacing : 4)) + 'px';
  const charSpacing = (typo.char_spacing !== undefined ? typo.char_spacing : (settings.char_spacing !== undefined ? settings.char_spacing : 0)) + 'px';
  
  // Font Family matching from THERMAL_FONT_OPTIONS
  const matchedFont = THERMAL_FONT_OPTIONS.find(f => f.id === typo.font_family);
  const fontFamily = matchedFont ? matchedFont.family : (typo.font_family === 'sans-serif' ? "'Segoe UI', Arial, sans-serif" : typo.font_family === 'serif' ? "Georgia, serif" : "'Courier New', Courier, monospace");

  const totalLeftPadding = (parseFloat(leftMargin) || 0) + (parseFloat(paddingLR) || 0);
  const totalRightPadding = (parseFloat(rightMargin) || 0) + (parseFloat(paddingLR) || 0);

  const printReset = isPrint ? `
    @page {
      margin: 0 !important;
      ${paperSize === 'A4' ? 'size: A4;' : ''}
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #ffffff;
      -webkit-print-color-adjust: exact;
    }
  ` : '';

  const divStyle = template.dividers?.style || 'dashed';
  const divSpacing = template.dividers?.spacing !== undefined ? template.dividers.spacing : 6;
  
  let hrCSS = '';
  if (divStyle === 'none') {
    hrCSS = `border: none; height: ${divSpacing}px;`;
  } else if (divStyle === 'solid') {
    hrCSS = `border-top: 1px solid #000000; border-bottom: none; border-left: none; border-right: none; margin: ${divSpacing}px 0; height: 0;`;
  } else if (divStyle === 'double') {
    hrCSS = `border-top: 3px double #000000; border-bottom: none; border-left: none; border-right: none; margin: ${divSpacing}px 0; height: 0;`;
  } else if (divStyle === 'dotted') {
    hrCSS = `border-top: 1px dotted #000000; border-bottom: none; border-left: none; border-right: none; margin: ${divSpacing}px 0; height: 0;`;
  } else {
    hrCSS = `border-top: 1px dashed #000000; border-bottom: none; border-left: none; border-right: none; margin: ${divSpacing}px 0; height: 0;`;
  }

  const secSpace = template.section_spacing || {};
  const afterLogo = secSpace.after_logo !== undefined ? secSpace.after_logo : 4;
  const afterHeader = secSpace.after_header_info !== undefined ? secSpace.after_header_info : 6;
  const afterInvoice = secSpace.after_invoice_meta !== undefined ? secSpace.after_invoice_meta : 6;
  const afterItems = secSpace.after_items !== undefined ? secSpace.after_items : 4;
  const afterTotals = secSpace.after_totals !== undefined ? secSpace.after_totals : 4;
  const afterPayment = secSpace.after_payment !== undefined ? secSpace.after_payment : 4;
  const afterQr = secSpace.after_qr !== undefined ? secSpace.after_qr : 6;

  return `
    ${printReset}
    .thermal-receipt {
      font-family: ${fontFamily};
      width: 100%;
      max-width: ${widthVal};
      background-color: #ffffff;
      color: #000000;
      margin: 0 auto;
      padding: ${paperSize === 'A4' ? '15mm' : `${topMargin}mm ${totalRightPadding}mm ${bottomMargin}mm ${totalLeftPadding}mm`};
      box-sizing: border-box;
      text-align: left;
      line-height: ${lineSpacing};
      letter-spacing: ${charSpacing};
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
    }
    .thermal-receipt * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    .thermal-receipt .receipt-content {
      width: 100%;
      margin: 0;
      padding: 0;
      display: block;
      height: auto !important;
    }
    .thermal-receipt .text-center { text-align: center; }
    .thermal-receipt .text-left { text-align: left; }
    .thermal-receipt .text-right { text-align: right; }
    .thermal-receipt .bold { font-weight: bold; }
    .thermal-receipt .italic { font-style: italic; }
    .thermal-receipt hr {
      ${hrCSS}
    }
    .thermal-receipt .section-spacing-logo { margin-bottom: ${afterLogo}px; }
    .thermal-receipt .section-spacing-header { margin-bottom: ${afterHeader}px; }
    .thermal-receipt .section-spacing-invoice { margin-bottom: ${afterInvoice}px; }
    .thermal-receipt .section-spacing-items { margin-bottom: ${afterItems}px; }
    .thermal-receipt .section-spacing-totals { margin-bottom: ${afterTotals}px; }
    .thermal-receipt .section-spacing-payment { margin-bottom: ${afterPayment}px; }
    .thermal-receipt .section-spacing-qr { margin-bottom: ${afterQr}px; }
    .thermal-receipt .subtitle-text { font-size: ${typo.subtitle_font_size || 11}px; font-style: italic; font-family: inherit; margin: 0 0 2px 0; }
    .thermal-receipt .meta-text { font-size: ${typo.meta_font_size || 11}px; line-height: ${lineSpacing}; font-family: inherit; }

    .thermal-receipt .logo-container {
      margin: 0 0 4px 0;
      padding: 0;
    }
    .thermal-receipt .header-section {
      margin: 0 0 6px 0;
      padding: 0;
    }
    .thermal-receipt .restaurant-name {
      font-size: ${restaurantNameSize};
      font-weight: bold;
      margin: 0 0 2px 0;
      text-transform: uppercase;
      font-family: inherit;
    }
    .thermal-receipt .restaurant-subtitle {
      font-size: ${bodyFontSize};
      font-style: italic;
      margin: 0 0 2px 0;
      font-family: inherit;
    }
    .thermal-receipt .restaurant-info {
      font-size: ${bodyFontSize};
      line-height: ${lineSpacing};
      font-family: inherit;
    }
    .thermal-receipt .section-title {
      font-size: ${headerFontSize};
      font-weight: bold;
      text-align: center;
      margin: 4px 0;
      text-transform: uppercase;
      font-family: inherit;
    }
    .thermal-receipt .meta-section {
      font-size: ${bodyFontSize};
      margin: 4px 0;
      line-height: ${lineSpacing};
      font-family: inherit;
    }
    .thermal-receipt .items-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin: 6px 0;
      page-break-inside: auto;
    }
    .thermal-receipt .items-table tr {
      page-break-inside: avoid !important;
    }
    .thermal-receipt .items-table th {
      border-bottom: 1px dashed #000000;
      padding-bottom: 4px;
      font-weight: bold;
      font-size: ${bodyFontSize};
      font-family: inherit;
    }
    .thermal-receipt .items-table td {
      font-family: inherit;
      vertical-align: top;
      padding: ${itemSpacing} 0;
      font-size: ${bodyFontSize};
    }
    .thermal-receipt .items-table th.col-name, 
    .thermal-receipt .items-table td.item-name { 
      width: 58%; 
      text-align: left; 
      word-break: break-word; 
      overflow-wrap: break-word; 
      white-space: normal; 
    }
    .thermal-receipt .items-table th.col-qty, 
    .thermal-receipt .items-table td.item-qty { 
      width: 15%; 
      text-align: center; 
    }
    .thermal-receipt .items-table th.col-total, 
    .thermal-receipt .items-table td.item-total { 
      width: 27%; 
      text-align: right; 
    }
    .thermal-receipt .totals-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin: 6px 0;
      page-break-inside: avoid !important;
    }
    .thermal-receipt .totals-table td {
      font-family: inherit;
      padding: 2px 0;
      font-size: ${bodyFontSize};
      vertical-align: middle;
    }
    .thermal-receipt .totals-table td.label { 
      width: 65%; 
      text-align: left; 
    }
    .thermal-receipt .totals-table td.value { 
      width: 35%; 
      text-align: right; 
    }
    .thermal-receipt .totals-table .grand-total td {
      font-weight: bold;
      font-size: ${totalFontSize};
      border-top: 1px dotted #000000;
      border-bottom: 1px dotted #000000;
      padding: 5px 0;
    }
    .thermal-receipt .barcode-box {
      margin: 6px 0;
      text-align: center;
      letter-spacing: 2px;
      font-family: monospace;
      font-size: 14px;
      font-weight: bold;
    }
    .thermal-receipt .footer-section {
      font-size: ${footerFontSize};
      margin-top: 10px;
      line-height: ${lineSpacing};
      font-family: inherit;
    }
  `;
}

/**
 * Generates the wrapper-bound inner HTML content of the receipt
 */
export function getReceiptInnerHtml(receiptData, settings = {}, paperSize = '80mm', templateParam = null) {
  const receipt = normalizeReceiptData(receiptData);
  if (!receipt) return '';

  const template = templateParam || resolveReceiptTemplate(settings, receipt.order_type);
  const langKey = template.language || 'en';
  const L = RECEIPT_LABELS[langKey] || RECEIPT_LABELS.en;

  const header = template.header || {};
  const typo = template.typography || {};
  const codes = template.codes || {};
  const invoiceCfg = template.invoice || {};
  const totalsCfg = template.totals || {};
  const itemsCfg = template.items || {};
  const footerCfg = template.footer || {};
  const sectionOrder = template.section_order || DEFAULT_SECTION_ORDER;

  const infoFontSize = paperSize === '58mm' ? '9px' : paperSize === '80mm' ? '10px' : '12px';

  // Section 1: Logo
  const renderLogo = () => {
    if (header.show_logo === false || !header.logo || header.logo.trim() === '') return '';
    const logoW = header.logo_width || 100;
    const logoH = header.logo_height || 50;
    const logoAlign = header.logo_align || 'center';
    return `
      <div class="logo-container section-spacing-logo" style="text-align: ${logoAlign};">
        <img src="${header.logo}" class="logo" style="width: ${logoW}px; height: auto; max-height: ${logoH}px; object-fit: contain; display: inline-block;" />
      </div>
    `.trim();
  };

  // Section 2: Restaurant Name
  const renderRestaurantName = () => {
    const headerAlign = typo.header_align || 'center';
    const restName = (header.show_name !== false && header.restaurant_name) 
      ? `<h3 class="restaurant-name">${header.restaurant_name}</h3>` 
      : '';
    const subtitleSize = typo.subtitle_font_size || 11;
    const subtitle = (header.show_subtitle !== false && header.subtitle) 
      ? `<p class="subtitle-text" style="font-size: ${subtitleSize}px;">${header.subtitle}</p>` 
      : '';
    if (!restName && !subtitle) return '';
    return `
      <div style="text-align: ${headerAlign}; margin-bottom: 2px;">
        ${restName}
        ${subtitle}
      </div>
    `;
  };

  // Section 3: Header Info
  const renderHeaderInfo = () => {
    const headerAlign = typo.header_align || 'center';
    const addressHtml = (header.show_address !== false && header.address) ? `${header.address}<br/>` : '';
    const phoneHtml = (header.show_phone !== false && header.phone) ? `${L.phone}: ${header.phone}<br/>` : '';
    const delPhoneHtml = (header.show_delivery_phone !== false && receipt.order_type === 'Delivery' && header.delivery_phone) 
      ? `Delivery Helpline: ${header.delivery_phone}<br/>` 
      : '';
    
    let extraHeaderHtml = '';
    if (header.show_helpline && header.helpline) extraHeaderHtml += `Helpline: ${header.helpline}<br/>`;
    if (header.show_website && header.website) extraHeaderHtml += `${header.website}<br/>`;
    if (header.show_email && header.email) extraHeaderHtml += `${header.email}<br/>`;

    const customTextHtml = (header.show_custom_header_text && header.custom_header_text)
      ? `<div class="bold" style="text-align: center; margin-top: 2px;">${header.custom_header_text}</div>`
      : '';

    if (!addressHtml && !phoneHtml && !delPhoneHtml && !extraHeaderHtml && !customTextHtml) return '';
    return `
      <div class="restaurant-info section-spacing-header" style="text-align: ${headerAlign};">
        ${addressHtml}
        ${phoneHtml}
        ${delPhoneHtml}
        ${extraHeaderHtml}
        ${customTextHtml}
      </div>
    `;
  };

  // Section 4: Invoice Meta
  const renderInvoiceMeta = () => {
    let customerInfoHtml = '';
    if (invoiceCfg.show_customer_name !== false && receipt.customer_name && receipt.customer_name.trim() !== '' && receipt.customer_name.toLowerCase() !== 'walk-in' && !receipt.customer_name.toLowerCase().startsWith('table')) {
      customerInfoHtml += `${L.customer}: ${receipt.customer_name}`;
    }
    if (invoiceCfg.show_customer_phone !== false && receipt.customer_phone && receipt.customer_phone.trim() !== '') {
      customerInfoHtml += customerInfoHtml ? `<br/>${L.phone}: ${receipt.customer_phone}` : `${L.phone}: ${receipt.customer_phone}`;
    }
    if (invoiceCfg.show_delivery_address !== false && receipt.delivery_address && receipt.delivery_address.trim() !== '') {
      customerInfoHtml += customerInfoHtml ? `<br/>${L.address}: ${receipt.delivery_address}` : `${L.address}: ${receipt.delivery_address}`;
    }
    if (invoiceCfg.show_rider !== false && receipt.rider_name && receipt.rider_name.trim() !== '') {
      customerInfoHtml += customerInfoHtml ? `<br/>${L.rider}: ${receipt.rider_name}` : `${L.rider}: ${receipt.rider_name}`;
    }

    const tableHeaderInfo = receipt.order_type === 'Dine-In'
      ? `<div class="section-title">${receipt.table_name || receipt.customer_name || 'Dine-In'}</div>`
      : `<div class="section-title">${receipt.order_type}</div>`;

    const invoicePrefix = invoiceCfg.prefix !== undefined ? invoiceCfg.prefix : '#';
    const metaLines = [];

    if (invoiceCfg.show_date !== false && receipt.date) {
      const dLabel = invoiceCfg.custom_labels?.date || L.date;
      let datePart = receipt.date;
      if (receipt.date.includes('T')) datePart = receipt.date.split('T')[0];
      else if (receipt.date.includes(' ')) datePart = receipt.date.split(' ')[0];
      metaLines.push(`${dLabel}: ${datePart}`);
    }
    
    if (invoiceCfg.show_time !== false && receipt.date) {
      const tLabel = invoiceCfg.custom_labels?.time || L.time;
      let timePart = '';
      if (receipt.date.includes('T')) {
        timePart = receipt.date.split('T')[1]?.substring(0, 8) || '';
      } else if (receipt.date.includes(' ')) {
        timePart = receipt.date.split(' ')[1] || '';
      }
      if (timePart) {
        metaLines.push(`${tLabel}: ${timePart}`);
      }
    }

    const invLabel = invoiceCfg.custom_labels?.invoice || L.invoice;
    if (invoiceCfg.show_invoice_no !== false && receipt.id) metaLines.push(`${invLabel}: ${invoicePrefix}${receipt.id}`);
    
    const typeLabel = invoiceCfg.custom_labels?.orderType || L.orderType;
    if (invoiceCfg.show_order_type !== false && receipt.order_type) metaLines.push(`${typeLabel}: ${receipt.order_type}`);
    
    const cashierLabel = invoiceCfg.custom_labels?.cashier || L.cashier;
    if (invoiceCfg.show_cashier !== false && receipt.created_by) metaLines.push(`${cashierLabel}: ${receipt.created_by}`);
    
    const tableLabel = invoiceCfg.custom_labels?.table || L.table;
    if (invoiceCfg.show_table !== false && receipt.table_name && receipt.order_type === 'Dine-In') metaLines.push(`${tableLabel}: ${receipt.table_name}`);
    
    if (customerInfoHtml) metaLines.push(customerInfoHtml);

    return `
      <div class="section-spacing-invoice">
        <hr/>
        ${tableHeaderInfo}
        <div class="meta-section meta-text">
          ${metaLines.join('<br/>')}
        </div>
        <hr/>
      </div>
    `;
  };

  // Section 5: Items Table
  const renderItemsTable = () => {
    const colNameW = itemsCfg.col_name_width !== undefined ? itemsCfg.col_name_width : 58;
    const colQtyW = itemsCfg.col_qty_width !== undefined ? itemsCfg.col_qty_width : 15;
    const colTotalW = itemsCfg.col_total_width !== undefined ? itemsCfg.col_total_width : 27;
    
    const hItem = itemsCfg.header_text_item || L.item;
    const hQty = itemsCfg.header_text_qty || L.qty;
    const hTotal = itemsCfg.header_text_total || L.amount;
    
    const itemFontSize = itemsCfg.item_font_size ? `${itemsCfg.item_font_size}px` : (typo.item_name_size || 12) + 'px';
    const rowSpacing = itemsCfg.row_spacing !== undefined ? itemsCfg.row_spacing : 4;

    const itemsRows = receipt.items.map(item => {
      const priceText = itemsCfg.show_price_each !== false ? `Rs ${item.price} each` : '';
      const urduText = (itemsCfg.show_urdu !== false && item.urdu) 
        ? `<div class="bold" style="font-size: ${infoFontSize}; margin-top: 1px;">(${item.urdu})</div>` 
        : '';
      const unitText = (itemsCfg.show_unit && item.unit) 
        ? `<div class="italic" style="font-size: ${infoFontSize}; margin-top: 1px;">Unit: ${item.unit}</div>`
        : '';
      
      return `
        <tr>
          <td class="item-name" style="width: ${colNameW}%; font-size: ${itemFontSize}; padding: ${rowSpacing}px 0;">
            <div class="${typo.bold_items !== false ? 'bold' : ''}" style="word-break: break-word; white-space: normal;">${item.name}</div>
            ${priceText ? `<div class="italic" style="font-size: ${infoFontSize}; margin-top: 1px;">${priceText}</div>` : ''}
            ${urduText}
            ${unitText}
          </td>
          <td class="item-qty" style="width: ${colQtyW}%; font-size: ${itemFontSize}; padding: ${rowSpacing}px 0; text-align: center;">${item.quantity}</td>
          <td class="item-total" style="width: ${colTotalW}%; font-size: ${itemFontSize}; padding: ${rowSpacing}px 0; text-align: right;">Rs ${item.subtotal}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="section-spacing-items">
        <table class="items-table">
          <thead>
            <tr>
              <th class="col-name" style="width: ${colNameW}%;">${hItem}</th>
              <th class="col-qty" style="width: ${colQtyW}%; text-align: center;">${hQty}</th>
              <th class="col-total" style="width: ${colTotalW}%; text-align: right;">${hTotal}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        <hr/>
      </div>
    `;
  };

  // Section 6: Totals Table
  const renderTotalsTable = () => {
    const totalsRows = [];
    const tAlign = totalsCfg.totals_align || 'right';
    const lAlign = tAlign === 'right' ? 'left' : 'right';

    if (totalsCfg.show_subtotal !== false) {
      totalsRows.push(`<tr><td class="label" style="text-align: ${lAlign};">${L.subtotal}:</td><td class="value" style="text-align: ${tAlign};">Rs ${receipt.subtotal}</td></tr>`);
    }
    if (totalsCfg.show_tax !== false && receipt.tax_rate > 0) {
      totalsRows.push(`<tr><td class="label" style="text-align: ${lAlign};">${L.gst} (${receipt.tax_rate}%):</td><td class="value" style="text-align: ${tAlign};">Rs ${receipt.tax_amount}</td></tr>`);
    }
    if (totalsCfg.show_service_charges !== false && receipt.service_charges > 0) {
      totalsRows.push(`<tr><td class="label" style="text-align: ${lAlign};">${L.serviceCharges}:</td><td class="value" style="text-align: ${tAlign};">Rs ${receipt.service_charges}</td></tr>`);
    }
    if (totalsCfg.show_delivery_charges !== false && receipt.delivery_charges > 0) {
      totalsRows.push(`<tr><td class="label" style="text-align: ${lAlign};">${L.deliveryCharges}:</td><td class="value" style="text-align: ${tAlign};">Rs ${receipt.delivery_charges}</td></tr>`);
    }
    if (totalsCfg.show_discount !== false && receipt.discount_amount > 0) {
      totalsRows.push(`<tr><td class="label" style="text-align: ${lAlign};">${L.discount}:</td><td class="value" style="text-align: ${tAlign};">-Rs ${receipt.discount_amount}</td></tr>`);
    }
    if (totalsCfg.show_grand_total !== false) {
      const gSize = totalsCfg.total_font_size ? `${totalsCfg.total_font_size}px` : '';
      const gBold = totalsCfg.total_bold !== false ? 'font-weight: bold;' : 'font-weight: normal;';
      const gtStyle = `font-size: ${gSize}; ${gBold}`;
      totalsRows.push(`<tr class="grand-total"><td class="label" style="text-align: ${lAlign}; ${gtStyle}">${L.total}:</td><td class="value" style="text-align: ${tAlign}; ${gtStyle}">Rs ${receipt.total}</td></tr>`);
    }
    return `
      <div class="section-spacing-totals">
        <table class="totals-table">
          <tbody>
            ${totalsRows.join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  // Section 7: Payment Breakdown
  const renderPaymentBreakdown = () => {
    const payRows = [];
    const tAlign = totalsCfg.totals_align || 'right';
    const lAlign = tAlign === 'right' ? 'left' : 'right';

    if (totalsCfg.show_payment_method !== false && receipt.payment_method) {
      payRows.push(`<tr><td class="label" style="text-align: ${lAlign};">${L.paymentMethod}:</td><td class="value" style="text-align: ${tAlign};">${receipt.payment_method}</td></tr>`);
    }
    if (totalsCfg.show_received !== false && receipt.received_amount > 0) {
      payRows.push(`<tr><td class="label" style="text-align: ${lAlign};">${L.cashReceived}:</td><td class="value" style="text-align: ${tAlign};">Rs ${receipt.received_amount}</td></tr>`);
    }
    if (totalsCfg.show_change !== false && receipt.received_amount > 0) {
      payRows.push(`<tr><td class="label" style="text-align: ${lAlign};">${L.changeReturned}:</td><td class="value" style="text-align: ${tAlign};">Rs ${receipt.change_returned}</td></tr>`);
    }
    if (payRows.length === 0) return '';
    return `
      <div class="section-spacing-payment">
        <table class="totals-table" style="margin-top: 2px;">
          <tbody>
            ${payRows.join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  // Section 8: QR Code & Barcode
  const renderQrCode = () => {
    let qrHtml = '';
    if (codes.show_qr && codes.qr_code_image && codes.qr_code_image.trim() !== '') {
      const qrW = codes.qr_width || 120;
      const qrH = codes.qr_height || 120;
      const qrAlign = codes.qr_align || 'center';
      let qrSrc = codes.qr_code_image.trim();
      if (!qrSrc.startsWith('data:') && !qrSrc.startsWith('http://') && !qrSrc.startsWith('https://') && !qrSrc.startsWith('/')) {
        qrSrc = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrSrc)}&size=180x180`;
      }
      qrHtml = `
        <div class="text-${qrAlign}" style="margin: 8px 0 4px 0; text-align: ${qrAlign};">
          ${codes.qr_title ? `<div class="bold" style="font-size: ${infoFontSize}; margin-bottom: 4px;">${codes.qr_title}</div>` : ''}
          <img src="${qrSrc}" alt="QR Code" style="width: ${qrW}px; max-width: 100%; height: auto; max-height: ${qrH}px; object-fit: contain; display: inline-block;" />
        </div>
      `;
    }

    let barcodeHtml = '';
    if (codes.show_barcode) {
      const barcodeVal = codes.barcode_text || `*${receipt.id}*`;
      barcodeHtml = `
        <div class="barcode-box">
          <div>||| | |||| | ||| |||| | ||</div>
          <div style="font-size: 11px; margin-top: 2px;">${barcodeVal}</div>
        </div>
      `;
    }

    if (!qrHtml && !barcodeHtml) return '';
    return `<div class="section-spacing-qr">${qrHtml}${barcodeHtml}</div>`;
  };

  // Section 9: Footer Message
  const renderFooterMessage = () => {
    if (footerCfg.show_footer === false) return '';
    const footerAlign = footerCfg.alignment || 'center';
    const footerMsg1 = footerCfg.message_1 || L.thankYou;
    const footerMsg2 = footerCfg.message_2 || L.visitAgain;
    const footerMsg3 = footerCfg.message_3 || '';
    const footerMsg4 = footerCfg.message_4 || '';
    const footerContact = footerCfg.contact_info || '';
    const footerTax = footerCfg.show_tax_number && footerCfg.tax_number ? `NTN / Tax ID: ${footerCfg.tax_number}` : '';
    const footerWebsite = footerCfg.show_website_footer && footerCfg.website_footer_text ? footerCfg.website_footer_text : '';
    const footerSocial = footerCfg.show_social && footerCfg.social_text ? footerCfg.social_text : '';

    const topSpacing = footerCfg.footer_top_spacing !== undefined ? footerCfg.footer_top_spacing : 6;

    return `
      <hr/>
      <div class="footer-section" style="text-align: ${footerAlign}; margin-top: ${topSpacing}px;">
        ${footerMsg1 ? `<div>${footerMsg1}</div>` : ''}
        ${footerMsg2 ? `<div>${footerMsg2}</div>` : ''}
        ${footerMsg3 ? `<div>${footerMsg3}</div>` : ''}
        ${footerMsg4 ? `<div>${footerMsg4}</div>` : ''}
        ${footerContact ? `<div>${footerContact}</div>` : ''}
        ${footerWebsite ? `<div>${footerWebsite}</div>` : ''}
        ${footerSocial ? `<div>${footerSocial}</div>` : ''}
        ${footerTax ? `<div style="margin-top: 2px;">${footerTax}</div>` : ''}
      </div>
    `;
  };

  // Map of section renderers
  const sectionRenderers = {
    logo: renderLogo,
    restaurant_name: renderRestaurantName,
    header_info: renderHeaderInfo,
    invoice_meta: renderInvoiceMeta,
    items_table: renderItemsTable,
    totals_table: renderTotalsTable,
    payment_breakdown: renderPaymentBreakdown,
    qr_code: renderQrCode,
    footer_message: renderFooterMessage
  };

  // Render sections in configured order
  const renderedSections = sectionOrder
    .map(secKey => {
      const fn = sectionRenderers[secKey];
      return fn ? fn() : '';
    })
    .filter(html => html && html.trim() !== '')
    .join('\n');

  return `
    <div class="receipt-content">
      ${renderedSections}
    </div>
  `.trim();
}

/**
 * Builds the complete HTML page including page styling rules to send to physical printers
 */
export function getReceiptHtml(receiptData, settings = {}, paperSize = '80mm', templateParam = null) {
  const template = templateParam || resolveReceiptTemplate(settings, receiptData.order_type || receiptData.order?.order_type);
  const styles = getReceiptStyles(paperSize, true, settings, template);
  const body = getReceiptInnerHtml(receiptData, settings, paperSize, template);
  
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt #${receiptData.order?.id || receiptData.id || ''}</title>
        <style>
          ${styles}
        </style>
      </head>
      <body>
        <div id="receipt-wrapper" class="thermal-receipt">${body}</div>
      </body>
    </html>`.trim();
}
