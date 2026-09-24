import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../services/api';
import { 
  getReceiptHtml, 
  getReceiptInnerHtml, 
  getReceiptStyles, 
  DEFAULT_TEMPLATE, 
  resolveReceiptTemplate,
  THERMAL_FONT_OPTIONS,
  DEFAULT_SECTION_ORDER
} from '../utils/receiptGenerator';
import { 
  Save, Download, UploadCloud, RefreshCw, Sliders, Receipt, 
  Percent, ArrowUpDown, Database, Plus, Trash2, Copy, Edit3, 
  Check, AlertTriangle, Printer, Sparkles, MoveUp, MoveDown, 
  HelpCircle, Eye, EyeOff, Layout, Type, QrCode, Hash, DollarSign, 
  MessageSquare, FileText, Smartphone, Laptop, Monitor, CheckCircle2, X, Palette, Utensils,
  ChevronDown, ChevronUp, Search, Info, ShieldCheck, Undo2
} from 'lucide-react';
import { useToast } from '../components/Toast';
import ReceiptDesigner from './ReceiptDesigner';

export const DEFAULT_MENU_APPEARANCE = {
  // Preset & Visibility
  layout_preset: 'standard', // 'compact' | 'standard' | 'detailed' | 'custom'
  visible_elements: {
    image: true,
    name_en: true,
    name_ur: true,
    price: true,
    unit: true,
    category: false,
    stock: false,
    product_code: false
  },
  custom_elements_order: ['image', 'name_en', 'name_ur', 'category', 'price', 'unit', 'stock', 'product_code'],
  elements_align: {
    image: 'center',
    name_en: 'center',
    name_ur: 'center',
    category: 'center',
    price: 'center',
    unit: 'center',
    stock: 'center',
    product_code: 'center'
  },

  // 1. Product Card Size & Dimensions
  card_width_type: 'auto', // 'auto' | 'custom'
  card_width: 175, // px
  card_height_type: 'auto', // 'auto' | 'custom'
  card_height: 220, // px
  card_min_width: 140, // px
  card_max_width: 320, // px
  card_gap_x: 10, // px (column gap)
  card_gap_y: 10, // px (row gap)
  card_padding_top: 8, // px
  card_padding_right: 8, // px
  card_padding_bottom: 8, // px
  card_padding_left: 8, // px

  // 2. Product Grid Layout
  grid_columns: 'auto', // 'auto' | '1' | '2' | '3' | '4' | '5' | '6' | 'custom'
  grid_custom_columns: 4,
  grid_alignment: 'stretch', // 'left' | 'center' | 'right' | 'stretch'
  responsive_cols_desktop: 4,
  responsive_cols_medium: 3,
  responsive_cols_small: 2,
  responsive_cols_mobile: 1,

  // 3. Product Image Customization
  show_image: true,
  image_width_type: 'auto', // 'auto' | 'custom'
  image_width: 100, // % or px
  image_height_type: 'auto', // 'auto' | 'custom'
  image_height: 80, // px
  image_size: 'medium', // 'compact' | 'medium' | 'large' | 'full' | 'custom'
  image_position: 'top', // 'top' | 'bottom' | 'left' | 'right' | 'center'
  image_align: 'center', // 'left' | 'center' | 'right'
  image_fit: 'cover', // 'cover' | 'contain' | 'fill'
  image_shape: 'rounded', // 'rounded' | 'square' | 'pill' | 'circle'
  image_border_radius: 8, // px
  image_padding: 0, // px
  image_margin_bottom: 6, // px
  image_spacing: 6,

  // 4. Product Name Customization
  show_name_en: true,
  name_en_font_size: 12, // px
  name_en_font_weight: '700', // '400' | '600' | '700' | '800'
  name_en_color: '#1F130B',
  name_en_align: 'center', // 'left' | 'center' | 'right'
  name_en_margin_top: 2,
  name_en_margin_bottom: 2,

  show_name_ur: true,
  name_ur_font_size: 12, // px
  name_ur_font_weight: '700', // '400' | '600' | '700' | '800'
  name_ur_color: '#E28F46',
  name_ur_align: 'center', // 'left' | 'center' | 'right'
  name_ur_margin_top: 2,
  name_ur_margin_bottom: 2,

  name_language: 'bilingual', // 'bilingual' | 'en' | 'ur'
  language_order: 'en_above_ur', // 'en_above_ur' | 'ur_above_en'
  name_position: 'overlay', // 'overlay' | 'below_image' | 'above_image' | 'left_of_image' | 'right_of_image'
  overlay_position: 'bottom_center', // 'bottom_center' | 'bottom_left' | 'bottom_right' | 'top_center' | 'top_left' | 'top_right' | 'center'

  // 5. Price Customization
  show_price: true,
  price_position: 'bottom', // 'bottom' | 'below_name' | 'above_name' | 'below_image' | 'above_image' | 'overlay'
  price_align: 'space-between', // 'center' | 'left' | 'right' | 'space-between'
  price_font_size: 13, // px
  price_font_weight: '700', // '600' | '700' | '800'
  price_color: '#C62828',
  currency_symbol: 'Rs', // 'Rs' | 'PKR' | '/='
  currency_position: 'prefix', // 'prefix' | 'suffix'

  // 6. Unit Display
  show_unit: true,
  unit_position: 'inline_with_price', // 'inline_with_price' | 'below_price' | 'badge'
  unit_font_size: 10, // px
  unit_color: '#7A695E',
  unit_align: 'right', // 'left' | 'center' | 'right'

  // 7. Product Code & Stock Display
  show_product_code: false,
  product_code_font_size: 10,
  product_code_color: '#7A695E',
  show_stock: false,
  show_stock_status: false,
  stock_font_size: 10,
  stock_color: '#2E7D32',

  // 8. Card Colors, Borders & Shadows
  card_bg_color: '#FFFFFF',
  card_border_on: true,
  card_border_color: '#EFE6DA',
  card_border_width: 1, // px
  card_border_style: 'solid', // 'solid' | 'dashed' | 'dotted'
  card_border_radius: 10, // px
  card_shadow: 'sm', // 'none' | 'sm' | 'md' | 'lg'
  card_selected_color: '#FFF9F6',
  card_hover_color: '#FFF9F6',
  card_outofstock_color: '#FFEBEE',
  category_color: '#7A695E',
  badge_color: '#C62828',

  // 9. Category Menu Customization
  category_layout: 'scrollable_horizontal', // 'scrollable_horizontal' | 'horizontal' | 'vertical' | 'grid'
  category_btn_width: 'auto', // 'auto' | custom px
  category_btn_height: 'auto', // 'auto' | custom px
  category_btn_padding: 8, // px
  category_btn_margin: 4, // px
  category_btn_radius: 6, // px
  category_btn_bg: '#FFFFFF',
  category_btn_color: '#1F130B',
  category_btn_border: '#EFE6DA',
  category_btn_font_size: 12, // px
  category_btn_font_weight: '700',
  category_btn_align: 'center', // 'left' | 'center' | 'right'
  category_btn_shape: 'rounded', // 'rounded' | 'square' | 'pill'
  category_spacing: 8,

  // Active Category Styling
  category_active_bg: '#1F130B',
  category_active_color: '#FFFFFF',
  category_active_border: '#1F130B',
  category_active_font_weight: '800',
  category_active_shadow: true,

  // 10. Search Bar Customization
  search_width: '100%',
  search_height: 36, // px
  search_border_radius: 6, // px
  search_bg: '#FFFFFF',
  search_border_color: '#EFE6DA',
  search_text_color: '#1F130B',
  search_placeholder: 'Search dishes, deals, drinks...',
  search_font_size: 13, // px

  // 11. Global POS Menu Settings
  menu_bg_color: '#FAF6F0',
  menu_padding: 16 // px
};

export default function Settings() {
  const { showToast, ToastContainerEl } = useToast();

  // Navigation & View States
  const [activeMainTab, setActiveMainTab] = useState('general'); 
  // 'general' | 'menu_appearance' | 'menu_sorting' | 'receipt_customizer' | 'taxes_discounts' | 'backup_restore'
  
  const [settingsSearchQuery, setSettingsSearchQuery] = useState('');
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'pos_screen'
  const [showAdvancedMenuSettings, setShowAdvancedMenuSettings] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Accordion Expand/Collapse States for POS Menu & Appearance
  const [openAccordions, setOpenAccordions] = useState({
    layout: true,
    card_elements: false,
    images: false,
    typography: false,
    price_stock: false,
    colors_borders: false,
    categories: false,
    search_global: false
  });

  const toggleAccordion = (sectionKey) => {
    setOpenAccordions(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const expandAllAccordions = () => {
    setOpenAccordions({
      layout: true,
      card_elements: true,
      images: true,
      typography: true,
      price_stock: true,
      colors_borders: true,
      categories: true,
      search_global: true
    });
  };

  const collapseAllAccordions = () => {
    setOpenAccordions({
      layout: false,
      card_elements: false,
      images: false,
      typography: false,
      price_stock: false,
      colors_borders: false,
      categories: false,
      search_global: false
    });
  };

  // Receipt Designer sub-tab
  const [activeDesignerTab, setActiveDesignerTab] = useState('header');

  // Core Data States
  const [menuAppearance, setMenuAppearance] = useState(DEFAULT_MENU_APPEARANCE);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [rawSettings, setRawSettings] = useState({});

  // 1. General & Hardware States
  const [restaurantName, setRestaurantName] = useState('AR Shinwari Hujra');
  const [subtitle, setSubtitle] = useState('Authentic Shinwari & Traditional BBQ');
  const [address, setAddress] = useState('Near Dunya Palace Hotel, Mor Sambrial');
  const [phone, setPhone] = useState('0300-0333128');
  const [whatsappPhone, setWhatsappPhone] = useState('0300-0333128');
  const [deliveryPhone, setDeliveryPhone] = useState('0304-9665555');
  const [logo, setLogo] = useState('');
  const [receiptHeaderMsg, setReceiptHeaderMsg] = useState('');
  const [receiptFooterMsg, setReceiptFooterMsg] = useState('Thank you for dining with us! Visit Again');
  
  // Hardware
  const [defaultPrinter, setDefaultPrinter] = useState('System Default');
  const [paperWidth, setPaperWidth] = useState('80mm');
  const [customWidth, setCustomWidth] = useState(80);
  const [printDensity, setPrintDensity] = useState('Medium');
  const [autoPrint, setAutoPrint] = useState('manual');
  const [printPreviewEnabled, setPrintPreviewEnabled] = useState(true);
  const [defaultPrintCopies, setDefaultPrintCopies] = useState(1);
  const [cashDrawerEnabled, setCashDrawerEnabled] = useState(false);
  const [barcodeScannerEnabled, setBarcodeScannerEnabled] = useState(true);
  const [customerDisplayEnabled, setCustomerDisplayEnabled] = useState(false);
  const [topMargin, setTopMargin] = useState(0);
  const [bottomMargin, setBottomMargin] = useState(5);
  const [leftMargin, setLeftMargin] = useState(0);
  const [rightMargin, setRightMargin] = useState(0);
  const [paddingLeftRight, setPaddingLeftRight] = useState(3);
  const [autoScaling, setAutoScaling] = useState(true);

  // POS Behavior
  const [rememberMe, setRememberMe] = useState(true);
  const [allowNegativeStock, setAllowNegativeStock] = useState(true);
  const [autoSaveOrders, setAutoSaveOrders] = useState(true);
  const [autoClearCompleted, setAutoClearCompleted] = useState(true);
  const [confirmCancelOrder, setConfirmCancelOrder] = useState(true);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(false);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('never');

  // 2. Receipt Customizer & Templates States
  const [templates, setTemplates] = useState([DEFAULT_TEMPLATE]);
  const [activeTemplateId, setActiveTemplateId] = useState(DEFAULT_TEMPLATE.id);
  const [orderTypeTemplates, setOrderTypeTemplates] = useState({
    'Dine-In': DEFAULT_TEMPLATE.id,
    'Delivery': DEFAULT_TEMPLATE.id,
    'Takeaway': DEFAULT_TEMPLATE.id
  });

  // Template Manager Modals
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateBaseId, setNewTemplateBaseId] = useState(DEFAULT_TEMPLATE.id);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState(null);
  const [renamedTitle, setRenamedTitle] = useState('');

  // 3. Taxes & Discounts States
  const [taxes, setTaxes] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [newTaxName, setNewTaxName] = useState('');
  const [newTaxRate, setNewTaxRate] = useState('');
  const [newDiscountName, setNewDiscountName] = useState('');
  const [newDiscountRate, setNewDiscountRate] = useState('');
  const [newDiscountType, setNewDiscountType] = useState('percent'); // 'percent' | 'fixed'

  // 4. Menu Display, Units & Sorting States
  const [menuSortingMode, setMenuSortingMode] = useState('manual'); // 'manual' | 'az' | 'za' | 'price_asc' | 'price_desc' | 'newest' | 'oldest'
  const [categoriesList, setCategoriesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitIsDefault, setNewUnitIsDefault] = useState(false);
  const [showEditUnitModal, setShowEditUnitModal] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [editingUnitName, setEditingUnitName] = useState('');
  const [editingUnitIsDefault, setEditingUnitIsDefault] = useState(false);
  const [selectedSortCategory, setSelectedSortCategory] = useState('All');
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [productOrder, setProductOrder] = useState([]);

  // 5. Backup & Restore Modals
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [resetTargetSection, setResetTargetSection] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreInspection, setRestoreInspection] = useState(null);
  const [pendingRestoreData, setPendingRestoreData] = useState(null);
  const [restoreInProgress, setRestoreInProgress] = useState(false);

  // 6. Legacy Menu Migration & Cross-PC Transfer States
  const [migrationScanning, setMigrationScanning] = useState(false);
  const [migrationDetected, setMigrationDetected] = useState(null);
  const [showMigrationScanModal, setShowMigrationScanModal] = useState(false);
  const [pendingMenuPackage, setPendingMenuPackage] = useState(null);
  const [showMenuImportModal, setShowMenuImportModal] = useState(false);
  const [migrationImporting, setMigrationImporting] = useState(false);

  // Active Template Helper
  const activeTemplate = templates.find(t => t.id === activeTemplateId) || templates[0] || DEFAULT_TEMPLATE;

  // Mock Receipt Data for Live Preview
  const mockSampleReceipt = {
    id: "1082",
    date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    order_type: "Dine-In",
    table_name: "Table 4",
    customer_name: "Tariq Mahmood",
    customer_phone: "0300-8451299",
    delivery_address: "House 12, Street 4, Phase 2, Sambrial",
    rider_name: "Asif Khan",
    created_by: "Admin",
    subtotal: 3950,
    tax_rate: 16.0,
    tax_amount: 632,
    service_charges: 0,
    delivery_charges: 150,
    discount_amount: 200,
    total: 4532,
    payment_method: "Cash",
    received_amount: 5000,
    change_returned: 468,
    items: [
      { name: "Shinwari Mutton Karahi Full", price: 2800, quantity: 1, subtotal: 2800, urdu: "شنواری مٹن کڑاہی فل" },
      { name: "Chicken Seekh Kabab (4Pc)", price: 300, quantity: 2, subtotal: 600, urdu: "چکن سیخ کباب" },
      { name: "Sajji Half + Rice", price: 450, quantity: 1, subtotal: 450, urdu: "سجی ہاف + چاول" },
      { name: "Fresh Green Salad", price: 100, quantity: 1, subtotal: 100, urdu: "سلاد" }
    ]
  };

  // Sample dishes for live menu preview if catalog is empty
  const previewProductsSample = useMemo(() => {
    if (productsList && productsList.length > 0) {
      return productsList.slice(0, 8);
    }
    return [
      { id: 1, name: 'Chicken Seekh Kabab', urdu: 'چکن سیخ کباب', price: 320, category: 'Barbeque', unit: 'Piece', stock: 15, image: '' },
      { id: 2, name: 'Shinwari Mutton Karahi', urdu: 'شنواری مٹن کڑاہی', price: 2800, category: 'Karahi', unit: 'KG', stock: 8, image: '' },
      { id: 3, name: 'Special Chicken Sajji', urdu: 'چکن سجی', price: 950, category: 'Sajji', unit: 'Full', stock: 12, image: '' },
      { id: 4, name: 'Fresh Roghani Naan', urdu: 'روغنی نان', price: 50, category: 'Tandoor', unit: 'Piece', stock: 50, image: '' }
    ];
  }, [productsList]);

  useEffect(() => {
    fetchInitialSettings();
    fetchPrinters();
    fetchCatalogData();
  }, []);

  const fetchPrinters = async () => {
    if (window.electronAPI && typeof window.electronAPI.getPrinters === 'function') {
      try {
        const list = await window.electronAPI.getPrinters();
        setPrinters(list || []);
      } catch (err) {
        console.error('Error fetching printers:', err);
      }
    }
  };

  const fetchCatalogData = async () => {
    try {
      const [cats, prods, units] = await Promise.all([
        api.getCategories().catch(() => []),
        api.getProducts().catch(() => []),
        api.getUnits().catch(() => [])
      ]);
      setCategoriesList(cats || []);
      setProductsList(prods || []);
      setUnitsList(units || []);
    } catch (e) {
      console.error('Error loading categories, products, and units:', e);
    }
  };

  const fetchUnits = async () => {
    try {
      const list = await api.getUnits();
      setUnitsList(list || []);
    } catch (e) {
      console.error('Error loading units:', e);
    }
  };

  const fetchInitialSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      if (data) {
        setRawSettings(data);
        if (data.restaurant_name) setRestaurantName(data.restaurant_name);
        if (data.subtitle) setSubtitle(data.subtitle);
        if (data.address) setAddress(data.address);
        if (data.phone) setPhone(data.phone);
        if (data.whatsapp_phone) setWhatsappPhone(data.whatsapp_phone);
        if (data.delivery_phone) setDeliveryPhone(data.delivery_phone);
        if (data.logo) setLogo(data.logo);
        if (data.receipt_header_msg) setReceiptHeaderMsg(data.receipt_header_msg);
        if (data.receipt_footer_msg) setReceiptFooterMsg(data.receipt_footer_msg);

        // Hardware
        if (data.default_printer) setDefaultPrinter(data.default_printer);
        if (data.paper_width) setPaperWidth(data.paper_width);
        if (data.custom_width !== undefined) setCustomWidth(data.custom_width);
        if (data.print_density) setPrintDensity(data.print_density);
        if (data.auto_print) setAutoPrint(data.auto_print);
        if (data.print_preview !== undefined) setPrintPreviewEnabled(data.print_preview === 'true' || data.print_preview === true);
        if (data.default_print_copies !== undefined) setDefaultPrintCopies(parseInt(data.default_print_copies) || 1);
        if (data.cash_drawer !== undefined) setCashDrawerEnabled(data.cash_drawer === 'true' || data.cash_drawer === true);
        if (data.barcode_scanner !== undefined) setBarcodeScannerEnabled(data.barcode_scanner === 'true' || data.barcode_scanner === true);
        if (data.customer_display !== undefined) setCustomerDisplayEnabled(data.customer_display === 'true' || data.customer_display === true);
        if (data.top_margin !== undefined) setTopMargin(data.top_margin);
        if (data.bottom_margin !== undefined) setBottomMargin(data.bottom_margin);
        if (data.left_margin !== undefined) setLeftMargin(data.left_margin);
        if (data.right_margin !== undefined) setRightMargin(data.right_margin);
        if (data.padding_left_right !== undefined) setPaddingLeftRight(data.padding_left_right);
        if (data.auto_scaling !== undefined) setAutoScaling(data.auto_scaling === 'true' || data.auto_scaling === true);

        // POS Behavior
        if (data.remember_me !== undefined) setRememberMe(data.remember_me === 'true' || data.remember_me === true);
        if (data.allow_negative_stock !== undefined) setAllowNegativeStock(data.allow_negative_stock === 'true' || data.allow_negative_stock === true);
        if (data.auto_save_orders !== undefined) setAutoSaveOrders(data.auto_save_orders === 'true' || data.auto_save_orders === true);
        if (data.auto_clear_completed !== undefined) setAutoClearCompleted(data.auto_clear_completed === 'true' || data.auto_clear_completed === true);
        if (data.confirm_cancel_order !== undefined) setConfirmCancelOrder(data.confirm_cancel_order === 'true' || data.confirm_cancel_order === true);
        if (data.confirm_delete_item !== undefined) setConfirmDeleteItem(data.confirm_delete_item === 'true' || data.confirm_delete_item === true);
        if (data.sound_notifications !== undefined) setSoundNotifications(data.sound_notifications === 'true' || data.sound_notifications === true);
        if (data.keyboard_shortcuts !== undefined) setKeyboardShortcuts(data.keyboard_shortcuts === 'true' || data.keyboard_shortcuts === true);
        if (data.session_timeout) setSessionTimeout(data.session_timeout);

        // Templates
        if (data.receipt_templates) {
          try {
            const parsed = JSON.parse(data.receipt_templates);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTemplates(parsed);
              const def = parsed.find(p => p.is_default) || parsed[0];
              setActiveTemplateId(def.id);
            }
          } catch (e) {
            console.error('Error parsing receipt_templates:', e);
          }
        }

        if (data.order_type_templates) {
          try {
            setOrderTypeTemplates(JSON.parse(data.order_type_templates));
          } catch (e) {}
        }

        // Taxes & Discounts
        if (data.taxes) {
          try {
            setTaxes(JSON.parse(data.taxes));
          } catch (e) {}
        } else {
          setTaxes([
            { id: 1, name: 'No Tax (0%)', rate: 0.0, is_default: true, enabled: true },
            { id: 2, name: 'Punjab GST Dining (16%)', rate: 16.0, is_default: false, enabled: true },
            { id: 3, name: 'Punjab GST Card (5%)', rate: 5.0, is_default: false, enabled: true },
            { id: 4, name: 'KPK GST Dining (15%)', rate: 15.0, is_default: false, enabled: true },
            { id: 5, name: 'Sindh GST Dining (13%)', rate: 13.0, is_default: false, enabled: true }
          ]);
        }

        if (data.discounts) {
          try {
            setDiscounts(JSON.parse(data.discounts));
          } catch (e) {}
        } else {
          setDiscounts([
            { id: 1, name: 'No Discount (0%)', rate: 0.0, type: 'percent', is_default: true, enabled: true },
            { id: 2, name: 'Special Discount (5%)', rate: 5.0, type: 'percent', is_default: false, enabled: true },
            { id: 3, name: '10% Discount', rate: 10.0, type: 'percent', is_default: false, enabled: true },
            { id: 4, name: '15% Discount', rate: 15.0, type: 'percent', is_default: false, enabled: true },
            { id: 5, name: '20% Discount', rate: 20.0, type: 'percent', is_default: false, enabled: true }
          ]);
        }

        if (data.tax_inclusive !== undefined) setTaxInclusive(data.tax_inclusive === 'true' || data.tax_inclusive === true);

        // Menu Appearance
        if (data.menu_appearance) {
          try {
            const parsed = typeof data.menu_appearance === 'string' ? JSON.parse(data.menu_appearance) : data.menu_appearance;
            setMenuAppearance({
              ...DEFAULT_MENU_APPEARANCE,
              ...parsed,
              visible_elements: {
                ...DEFAULT_MENU_APPEARANCE.visible_elements,
                ...(parsed.visible_elements || {})
              },
              elements_align: {
                ...DEFAULT_MENU_APPEARANCE.elements_align,
                ...(parsed.elements_align || {})
              }
            });
          } catch (e) {
            console.error('Error parsing menu_appearance:', e);
          }
        }

        // Sorting
        if (data.menu_sorting_mode) setMenuSortingMode(data.menu_sorting_mode);
        if (data.category_order) {
          try { setCategoryOrder(JSON.parse(data.category_order)); } catch (e) {}
        }
        if (data.product_order) {
          try { setProductOrder(JSON.parse(data.product_order)); } catch (e) {}
        }

        setIsDirty(false);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      showToast(`Error loading settings: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper to update menu appearance and flag unsaved
  const updateMenuAppearance = (updater) => {
    setIsDirty(true);
    setMenuAppearance(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
  };

  // Preset Card Sizing Quick Apply
  const applyCardSizePreset = (sizeKey) => {
    setIsDirty(true);
    if (sizeKey === 'small') {
      updateMenuAppearance({
        card_width_type: 'custom',
        card_width: 140,
        card_height_type: 'custom',
        card_height: 185,
        image_size: 'compact',
        image_height: 65,
        name_en_font_size: 11,
        name_ur_font_size: 11,
        price_font_size: 12
      });
    } else if (sizeKey === 'medium') {
      updateMenuAppearance({
        card_width_type: 'auto',
        card_width: 175,
        card_height_type: 'auto',
        card_height: 220,
        image_size: 'medium',
        image_height: 80,
        name_en_font_size: 12,
        name_ur_font_size: 12,
        price_font_size: 13
      });
    } else if (sizeKey === 'large') {
      updateMenuAppearance({
        card_width_type: 'custom',
        card_width: 220,
        card_height_type: 'custom',
        card_height: 265,
        image_size: 'large',
        image_height: 105,
        name_en_font_size: 14,
        name_ur_font_size: 14,
        price_font_size: 15
      });
    }
  };

  // Preset Theme Quick Apply
  const applyThemePreset = (themeKey) => {
    setIsDirty(true);
    if (themeKey === 'light') {
      updateMenuAppearance({
        card_bg_color: '#FFFFFF',
        menu_bg_color: '#FAF6F0',
        card_border_color: '#EFE6DA',
        name_en_color: '#1F130B',
        name_ur_color: '#E28F46',
        price_color: '#C62828',
        category_btn_bg: '#FFFFFF',
        category_btn_color: '#1F130B',
        category_active_bg: '#1F130B',
        category_active_color: '#FFFFFF'
      });
    } else if (themeKey === 'warm') {
      updateMenuAppearance({
        card_bg_color: '#FFFDF9',
        menu_bg_color: '#F4ECE1',
        card_border_color: '#E2D4C3',
        name_en_color: '#2A180E',
        name_ur_color: '#D87B29',
        price_color: '#B71C1C',
        category_btn_bg: '#FFFBF7',
        category_btn_color: '#2A180E',
        category_active_bg: '#C62828',
        category_active_color: '#FFFFFF'
      });
    } else if (themeKey === 'dark') {
      updateMenuAppearance({
        card_bg_color: '#261B14',
        menu_bg_color: '#1A110B',
        card_border_color: '#3D2D23',
        name_en_color: '#FFFFFF',
        name_ur_color: '#FFA726',
        price_color: '#FF5252',
        category_btn_bg: '#2F2017',
        category_btn_color: '#FFFFFF',
        category_active_bg: '#E28F46',
        category_active_color: '#FFFFFF'
      });
    }
  };

  // Template Manager Handlers
  const handleUpdateTemplate = (updater) => {
    setIsDirty(true);
    setTemplates(prev => {
      return prev.map(t => {
        if (t.id === activeTemplateId) {
          const updated = typeof updater === 'function' ? updater(t) : { ...t, ...updater };
          return {
            ...updated,
            last_edited: new Date().toISOString()
          };
        }
        return t;
      });
    });
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return showToast('Please enter a template name.', 'warning');
    const base = templates.find(t => t.id === newTemplateBaseId) || DEFAULT_TEMPLATE;
    const newId = 'template_' + Date.now();
    const cloned = JSON.parse(JSON.stringify(base));
    cloned.id = newId;
    cloned.name = newTemplateName.trim();
    cloned.is_default = false;
    cloned.last_edited = new Date().toISOString();

    const updated = [...templates, cloned];
    setTemplates(updated);
    setActiveTemplateId(newId);
    setNewTemplateName('');
    setShowNewTemplateModal(false);
    setIsDirty(true);
    showToast(`Template "${cloned.name}" created.`, 'success');
  };

  const handleDuplicateTemplate = (targetId) => {
    const base = templates.find(t => t.id === targetId) || activeTemplate;
    const newId = 'template_' + Date.now();
    const cloned = JSON.parse(JSON.stringify(base));
    cloned.id = newId;
    cloned.name = `${base.name} (Copy)`;
    cloned.is_default = false;
    cloned.last_edited = new Date().toISOString();

    const updated = [...templates, cloned];
    setTemplates(updated);
    setActiveTemplateId(newId);
    setIsDirty(true);
    showToast(`Duplicated as "${cloned.name}".`, 'success');
  };

  const handleSetDefaultTemplate = (targetId) => {
    setTemplates(templates.map(t => ({
      ...t,
      is_default: t.id === targetId
    })));
    setIsDirty(true);
    showToast('Default receipt template updated.', 'success');
  };

  const handleDeleteTemplate = (targetId) => {
    if (templates.length <= 1) {
      return showToast('At least one receipt template must be maintained.', 'warning');
    }
    const target = templates.find(t => t.id === targetId);
    if (window.confirm(`Are you sure you want to delete template "${target?.name}"?`)) {
      const updated = templates.filter(t => t.id !== targetId);
      if (target?.is_default && updated.length > 0) {
        updated[0].is_default = true;
      }
      setTemplates(updated);
      if (activeTemplateId === targetId) {
        setActiveTemplateId(updated[0].id);
      }
      setIsDirty(true);
      showToast('Template deleted.', 'success');
    }
  };

  const handleRenameTemplate = () => {
    if (!renamedTitle.trim()) return;
    setTemplates(templates.map(t => {
      if (t.id === renameTargetId) {
        return { ...t, name: renamedTitle.trim(), last_edited: new Date().toISOString() };
      }
      return t;
    }));
    setShowRenameModal(false);
    setIsDirty(true);
    showToast('Template renamed.', 'success');
  };

  // Taxes & Discounts Handlers
  const handleAddTax = () => {
    if (!newTaxName.trim() || newTaxRate === '') return showToast('Please enter tax name and rate.', 'warning');
    const newTax = {
      id: Date.now(),
      name: newTaxName.trim(),
      rate: parseFloat(newTaxRate) || 0,
      is_default: taxes.length === 0,
      enabled: true
    };
    setTaxes([...taxes, newTax]);
    setNewTaxName('');
    setNewTaxRate('');
    setIsDirty(true);
    showToast(`Tax "${newTax.name}" added.`, 'success');
  };

  const handleRemoveTax = (id) => {
    setTaxes(taxes.filter(t => t.id !== id));
    setIsDirty(true);
  };

  const handleToggleTax = (id) => {
    setTaxes(taxes.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
    setIsDirty(true);
  };

  const handleSetDefaultTax = (id) => {
    setTaxes(taxes.map(t => ({ ...t, is_default: t.id === id })));
    setIsDirty(true);
  };

  const handleAddDiscount = () => {
    if (!newDiscountName.trim() || newDiscountRate === '') return showToast('Please enter discount name and rate.', 'warning');
    const newDisc = {
      id: Date.now(),
      name: newDiscountName.trim(),
      rate: parseFloat(newDiscountRate) || 0,
      type: newDiscountType,
      is_default: discounts.length === 0,
      enabled: true
    };
    setDiscounts([...discounts, newDisc]);
    setNewDiscountName('');
    setNewDiscountRate('');
    setIsDirty(true);
    showToast(`Discount "${newDisc.name}" added.`, 'success');
  };

  const handleRemoveDiscount = (id) => {
    setDiscounts(discounts.filter(d => d.id !== id));
    setIsDirty(true);
  };

  const handleToggleDiscount = (id) => {
    setDiscounts(discounts.map(d => d.id === id ? { ...d, enabled: !d.enabled } : d));
    setIsDirty(true);
  };

  const handleSetDefaultDiscount = (id) => {
    setDiscounts(discounts.map(d => ({ ...d, is_default: d.id === id })));
    setIsDirty(true);
  };

  // Menu Sorting Reorder Handlers
  const getOrderedCategories = () => {
    if (!categoriesList.length) return [];
    if (categoryOrder.length > 0) {
      const ordered = [];
      categoryOrder.forEach(id => {
        const cat = categoriesList.find(c => c.id === id || c.name === id);
        if (cat) ordered.push(cat);
      });
      categoriesList.forEach(cat => {
        if (!ordered.some(o => o.id === cat.id)) ordered.push(cat);
      });
      return ordered;
    }
    return [...categoriesList];
  };

  const handleMoveCategory = (index, direction) => {
    const list = getOrderedCategories();
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setCategoryOrder(list.map(c => c.id));
    setIsDirty(true);
  };

  const getFilteredSortProducts = () => {
    let prods = [...productsList];
    if (selectedSortCategory !== 'All') {
      prods = prods.filter(p => p.category === selectedSortCategory);
    }
    if (menuSortingMode === 'az') {
      prods.sort((a, b) => a.name.localeCompare(b.name));
    } else if (menuSortingMode === 'za') {
      prods.sort((a, b) => b.name.localeCompare(a.name));
    } else if (menuSortingMode === 'price_asc') {
      prods.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (menuSortingMode === 'price_desc') {
      prods.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (menuSortingMode === 'newest') {
      prods.sort((a, b) => b.id - a.id);
    } else if (menuSortingMode === 'oldest') {
      prods.sort((a, b) => a.id - b.id);
    } else if (menuSortingMode === 'manual' && productOrder.length > 0) {
      const ordered = [];
      productOrder.forEach(id => {
        const p = prods.find(item => item.id === id);
        if (p) ordered.push(p);
      });
      prods.forEach(p => {
        if (!ordered.some(o => o.id === p.id)) ordered.push(p);
      });
      return ordered;
    }
    return prods;
  };

  const handleMoveProduct = (index, direction) => {
    const list = getFilteredSortProducts();
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setProductOrder(list.map(p => p.id));
    setIsDirty(true);
  };

  // Master Save Handler
  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const payload = {
        restaurant_name: restaurantName,
        subtitle: subtitle,
        address: address,
        phone: phone,
        whatsapp_phone: whatsappPhone,
        delivery_phone: deliveryPhone,
        logo: logo,
        receipt_header_msg: receiptHeaderMsg,
        receipt_footer_msg: receiptFooterMsg,

        default_printer: defaultPrinter,
        paper_size: paperWidth,
        paper_width: paperWidth,
        custom_width: parseInt(customWidth) || 80,
        print_density: printDensity,
        auto_print: autoPrint,
        print_preview: printPreviewEnabled,
        default_print_copies: defaultPrintCopies,
        cash_drawer: cashDrawerEnabled,
        barcode_scanner: barcodeScannerEnabled,
        customer_display: customerDisplayEnabled,
        top_margin: parseFloat(topMargin) || 0,
        bottom_margin: parseFloat(bottomMargin) || 0,
        left_margin: parseFloat(leftMargin) || 0,
        right_margin: parseFloat(rightMargin) || 0,
        padding_left_right: parseFloat(paddingLeftRight) || 0,
        auto_scaling: autoScaling,

        remember_me: rememberMe,
        allow_negative_stock: allowNegativeStock,
        auto_save_orders: autoSaveOrders,
        auto_clear_completed: autoClearCompleted,
        confirm_cancel_order: confirmCancelOrder,
        confirm_delete_item: confirmDeleteItem,
        sound_notifications: soundNotifications,
        keyboard_shortcuts: keyboardShortcuts,
        session_timeout: sessionTimeout,

        receipt_templates: JSON.stringify(templates),
        order_type_templates: JSON.stringify(orderTypeTemplates),

        taxes: JSON.stringify(taxes),
        discounts: JSON.stringify(discounts),
        tax_inclusive: taxInclusive,

        menu_sorting_mode: menuSortingMode,
        category_order: JSON.stringify(categoryOrder),
        product_order: JSON.stringify(productOrder),
        menu_appearance: JSON.stringify(menuAppearance)
      };

      await api.updateSettings(payload);
      setSaveSuccess(true);
      setIsDirty(false);
      showToast('All settings saved and applied successfully!', 'success');
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      showToast(`Failed to save settings: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test Print Handler
  const handlePrintTestReceipt = async () => {
    const printerName = defaultPrinter || 'System Default';
    const paper = paperWidth || '80mm';
    const testHtml = getReceiptHtml(mockSampleReceipt, {
      top_margin: topMargin,
      bottom_margin: bottomMargin,
      left_margin: leftMargin,
      right_margin: rightMargin,
      padding_left_right: paddingLeftRight,
      custom_width: customWidth
    }, paper, activeTemplate);

    if (window.electronAPI && typeof window.electronAPI.printReceipt === 'function') {
      try {
        const printSettings = {
          deviceName: printerName,
          paperSize: paper,
          customWidth: customWidth,
          copies: 1
        };
        const res = await window.electronAPI.printReceipt(testHtml, printerName, paper, printSettings);
        if (res.success) {
          showToast('Test receipt sent to printer successfully.', 'success');
        } else {
          showToast(`Print failed: ${res.error || 'Check printer connection'}`, 'error');
        }
      } catch (err) {
        showToast(`Print failed: ${err.message}`, 'error');
      }
    } else {
      const printWindow = window.open('', '_blank', 'width=380,height=650');
      if (printWindow) {
        printWindow.document.write(testHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 300);
      }
    }
  };

  // Legacy Migration & Portable Menu Transfer Handlers
  const handleScanLegacyPOS = async () => {
    setMigrationScanning(true);
    try {
      const data = await api.detectLegacyPOS();
      setMigrationDetected(data);
      setShowMigrationScanModal(true);
    } catch (err) {
      showToast(`Legacy Scan Failed: ${err.message}`, 'error');
    } finally {
      setMigrationScanning(false);
    }
  };

  const handleExportMenuPackage = () => {
    window.open('http://localhost:5000/api/migration/export-menu', '_blank');
  };

  const handleSelectMenuPackageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const pkg = JSON.parse(evt.target.result);
        if (!pkg.categories || !pkg.products) {
          throw new Error('File is missing categories or products array.');
        }
        setPendingMenuPackage(pkg);
        setShowMenuImportModal(true);
      } catch (err) {
        showToast(`Invalid Menu Package File: ${err.message}`, 'error');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteMenuImport = async (mode = 'menu_only') => {
    if (!pendingMenuPackage) return;
    setMigrationImporting(true);
    try {
      const res = await api.importPortableMenu(pendingMenuPackage, mode);
      showToast(`Imported ${res.imported.products} Products, ${res.imported.categories} Categories, ${res.imported.units} Units.`, 'success');
      setShowMenuImportModal(false);
      setPendingMenuPackage(null);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast(`Import Failed: ${err.message}`, 'error');
    } finally {
      setMigrationImporting(false);
    }
  };

  const handleExecuteLegacyMigration = async (mode = 'menu_only') => {
    if (!migrationDetected || !migrationDetected.sourcePath) return;
    setMigrationImporting(true);
    try {
      const res = await api.importLegacyPOS({
        sourcePath: migrationDetected.sourcePath,
        mode,
        duplicateHandling: 'merge'
      });
      showToast(`Migrated ${res.imported.products} Products, ${res.imported.categories} Categories.`, 'success');
      setShowMigrationScanModal(false);
      setMigrationDetected(null);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast(`Migration Failed: ${err.message}`, 'error');
    } finally {
      setMigrationImporting(false);
    }
  };

  // Units Management Handlers
  const handleCreateUnit = async (e) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    try {
      await api.createUnit({ name: newUnitName.trim(), is_default: newUnitIsDefault });
      setNewUnitName('');
      setNewUnitIsDefault(false);
      fetchUnits();
      showToast('Unit created successfully.', 'success');
    } catch (e) {
      showToast('Failed to create unit: ' + e.message, 'error');
    }
  };

  const handleOpenEditUnit = (unit) => {
    setEditingUnitId(unit.id);
    setEditingUnitName(unit.name);
    setEditingUnitIsDefault(Boolean(unit.is_default));
    setShowEditUnitModal(true);
  };

  const handleSaveEditUnit = async (e) => {
    e.preventDefault();
    if (!editingUnitName.trim()) return;
    try {
      await api.updateUnit(editingUnitId, { name: editingUnitName.trim(), is_default: editingUnitIsDefault });
      setShowEditUnitModal(false);
      fetchUnits();
      showToast('Unit updated.', 'success');
    } catch (e) {
      showToast('Failed to update unit: ' + e.message, 'error');
    }
  };

  const handleDeleteUnit = async (id) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;
    try {
      await api.deleteUnit(id);
      fetchUnits();
      showToast('Unit deleted.', 'success');
    } catch (e) {
      showToast('Failed to delete unit: ' + e.message, 'error');
    }
  };

  const handleSetDefaultUnit = async (unit) => {
    try {
      await api.updateUnit(unit.id, { name: unit.name, is_default: true });
      fetchUnits();
      showToast(`Default unit set to ${unit.name}`, 'success');
    } catch (e) {
      showToast('Failed to set default unit: ' + e.message, 'error');
    }
  };

  // Factory Resets
  const handleExecuteReset = () => {
    if (resetTargetSection === 'templates') {
      setTemplates([DEFAULT_TEMPLATE]);
      setActiveTemplateId(DEFAULT_TEMPLATE.id);
      setOrderTypeTemplates({
        'Dine-In': DEFAULT_TEMPLATE.id,
        'Delivery': DEFAULT_TEMPLATE.id,
        'Takeaway': DEFAULT_TEMPLATE.id
      });
      showToast('Receipt templates reset to default.', 'success');
    } else if (resetTargetSection === 'taxes') {
      setTaxes([
        { id: 1, name: 'No Tax (0%)', rate: 0.0, is_default: true, enabled: true },
        { id: 2, name: 'Punjab GST Dining (16%)', rate: 16.0, is_default: false, enabled: true }
      ]);
      setDiscounts([
        { id: 1, name: 'No Discount (0%)', rate: 0.0, type: 'percent', is_default: true, enabled: true },
        { id: 2, name: 'Special Discount (5%)', rate: 5.0, type: 'percent', is_default: false, enabled: true }
      ]);
      showToast('Taxes & discounts reset to default.', 'success');
    } else if (resetTargetSection === 'menu') {
      setMenuSortingMode('manual');
      setCategoryOrder([]);
      setProductOrder([]);
      showToast('Menu sorting reset to default.', 'success');
    } else if (resetTargetSection === 'hardware') {
      setDefaultPrinter('System Default');
      setPaperWidth('80mm');
      setPrintDensity('Medium');
      setAutoPrint('manual');
      setPrintPreviewEnabled(true);
      setDefaultPrintCopies(1);
      showToast('Hardware settings reset to default.', 'success');
    } else if (resetTargetSection === 'menu_appearance') {
      setMenuAppearance(DEFAULT_MENU_APPEARANCE);
      showToast('POS menu appearance reset to defaults.', 'success');
    }
    setIsDirty(true);
    setShowResetConfirmModal(false);
  };

  // Filter Helper for Settings Search
  const matchesSearch = (text) => {
    if (!settingsSearchQuery.trim()) return true;
    return text.toLowerCase().includes(settingsSearchQuery.toLowerCase());
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      
      {/* 1. TOP CLEAN HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>POS Settings</h1>
          <p style={styles.subtitle}>
            Configure your POS appearance, menu, receipts, hardware, and business settings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Settings Search Bar */}
          <div style={styles.searchBar}>
            <Search size={14} color="#7A695E" />
            <input
              type="text"
              placeholder="Search settings (e.g. Urdu, Image, Printer, GST)..."
              value={settingsSearchQuery}
              onChange={(e) => {
                setSettingsSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  expandAllAccordions();
                }
              }}
              style={styles.searchInput}
            />
            {settingsSearchQuery && (
              <button 
                type="button" 
                onClick={() => setSettingsSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A695E' }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Unsaved indicator */}
          {isDirty && (
            <div style={styles.unsavedBadge}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF6C00' }}></span>
              Unsaved Changes
            </div>
          )}

          {saveSuccess && (
            <div style={styles.successBadge}>
              <CheckCircle2 size={15} /> Saved!
            </div>
          )}

          <button onClick={fetchInitialSettings} style={styles.iconBtn} title="Reload Settings" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <button onClick={handleSaveAll} style={styles.masterSaveBtn} disabled={loading}>
            <Save size={15} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* 2. MAIN 6-TABS NAVIGATION */}
      <div className="settings-tab-nav" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setActiveMainTab('general')}
          className={`settings-tab-btn ${activeMainTab === 'general' ? 'settings-tab-btn-active' : ''}`}
        >
          <Sliders size={15} /> General &amp; Hardware
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('menu_appearance')}
          className={`settings-tab-btn ${activeMainTab === 'menu_appearance' ? 'settings-tab-btn-active' : ''}`}
        >
          <Palette size={15} /> POS Menu &amp; Appearance
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('menu_sorting')}
          className={`settings-tab-btn ${activeMainTab === 'menu_sorting' ? 'settings-tab-btn-active' : ''}`}
        >
          <ArrowUpDown size={15} /> Menu Display &amp; Sorting
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('receipt_customizer')}
          className={`settings-tab-btn ${activeMainTab === 'receipt_customizer' ? 'settings-tab-btn-active' : ''}`}
        >
          <Receipt size={15} /> Receipt Customizer
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('taxes_discounts')}
          className={`settings-tab-btn ${activeMainTab === 'taxes_discounts' ? 'settings-tab-btn-active' : ''}`}
        >
          <Percent size={15} /> Taxes &amp; Discounts
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('backup_restore')}
          className={`settings-tab-btn ${activeMainTab === 'backup_restore' ? 'settings-tab-btn-active' : ''}`}
        >
          <Database size={15} /> Backup &amp; Restore
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GENERAL & HARDWARE                                                 */}
      {/* ========================================================================= */}
      {activeMainTab === 'general' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
          
          {/* Restaurant Information */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>Restaurant Information</h2>
              <span style={styles.badge}>Branding</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Restaurant Name</label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => { setRestaurantName(e.target.value); setIsDirty(true); }}
                  style={styles.input}
                  placeholder="AR Shinwari Hujra"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Subtitle / Tagline</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => { setSubtitle(e.target.value); setIsDirty(true); }}
                  style={styles.input}
                  placeholder="Authentic Shinwari & Traditional BBQ"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setIsDirty(true); }}
                  style={styles.input}
                  placeholder="Near Dunya Palace Hotel, Mor Sambrial"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Main Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setIsDirty(true); }}
                    style={styles.input}
                    placeholder="0300-0333128"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Delivery Hotline</label>
                  <input
                    type="text"
                    value={deliveryPhone}
                    onChange={(e) => { setDeliveryPhone(e.target.value); setIsDirty(true); }}
                    style={styles.input}
                    placeholder="0304-9665555"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Restaurant Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setLogo(reader.result);
                          setIsDirty(true);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ ...styles.input, padding: '6px' }}
                  />
                  {logo && (
                    <button
                      type="button"
                      onClick={() => { setLogo(''); setIsDirty(true); }}
                      style={{ ...styles.subtleBtn, color: '#C62828' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {logo && (
                  <div style={{ marginTop: '6px' }}>
                    <img src={logo} alt="Logo" style={{ height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thermal Printer Hardware */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>Thermal Printer &amp; Hardware</h2>
              <span style={styles.badge}>Hardware</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Default Receipt Printer</label>
                <select
                  value={defaultPrinter}
                  onChange={(e) => { setDefaultPrinter(e.target.value); setIsDirty(true); }}
                  style={styles.selectInput}
                >
                  <option value="System Default">System Default Printer</option>
                  {printers.map((p, idx) => (
                    <option key={idx} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Thermal Paper Width</label>
                  <select
                    value={paperWidth}
                    onChange={(e) => { setPaperWidth(e.target.value); setIsDirty(true); }}
                    style={styles.selectInput}
                  >
                    <option value="80mm">80mm Standard (Wide)</option>
                    <option value="58mm">58mm Compact (Narrow)</option>
                    <option value="custom">Custom Width</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Default Copies</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={defaultPrintCopies}
                    onChange={(e) => { setDefaultPrintCopies(parseInt(e.target.value) || 1); setIsDirty(true); }}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Print Automation</label>
                  <select
                    value={autoPrint}
                    onChange={(e) => { setAutoPrint(e.target.value); setIsDirty(true); }}
                    style={styles.selectInput}
                  >
                    <option value="manual">Prompt Before Printing</option>
                    <option value="auto">Auto-Print on Checkout</option>
                    <option value="disabled">Do Not Print</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Print Density</label>
                  <select
                    value={printDensity}
                    onChange={(e) => { setPrintDensity(e.target.value); setIsDirty(true); }}
                    style={styles.selectInput}
                  >
                    <option value="Normal">Normal Contrast</option>
                    <option value="Medium">Medium Crisp</option>
                    <option value="Dark">Ultra Dark / Bold</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={printPreviewEnabled}
                    onChange={(e) => { setPrintPreviewEnabled(e.target.checked); setIsDirty(true); }}
                  />
                  <span>Show interactive slip preview dialog on checkout</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={cashDrawerEnabled}
                    onChange={(e) => { setCashDrawerEnabled(e.target.checked); setIsDirty(true); }}
                  />
                  <span>Auto-kick electronic cash drawer on cash bill print</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={barcodeScannerEnabled}
                    onChange={(e) => { setBarcodeScannerEnabled(e.target.checked); setIsDirty(true); }}
                  />
                  <span>Enable USB Barcode / QR scanner auto-focus</span>
                </label>
              </div>

              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handlePrintTestReceipt}
                  style={styles.darkActionBtn}
                >
                  <Printer size={14} /> Print Test Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: POS MENU & APPEARANCE STUDIO (PROGRESSIVE DISCLOSURE)              */}
      {/* ========================================================================= */}
      {activeMainTab === 'menu_appearance' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(320px, 440px)', gap: '20px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Controls & Accordions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Quick Setup Bar */}
            <div style={{ ...styles.card, padding: '14px 18px', backgroundColor: '#FFFDF9', borderColor: '#E2D4C3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#E28F46" />
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#1F130B' }}>Quick Setup Presets</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setResetTargetSection('menu_appearance');
                      setShowResetConfirmModal(true);
                    }}
                    style={{ ...styles.subtleBtn, fontSize: '11px' }}
                  >
                    <Undo2 size={11} style={{ marginRight: '3px' }} /> Reset to Defaults
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <div>
                  <label style={{ ...styles.label, fontSize: '10px' }}>Card Size</label>
                  <div style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
                    {[
                      { id: 'small', label: 'Small' },
                      { id: 'medium', label: 'Med' },
                      { id: 'large', label: 'Large' }
                    ].map(sz => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => applyCardSizePreset(sz.id)}
                        style={{
                          flex: 1,
                          padding: '5px 4px',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: '700',
                          border: '1px solid var(--border-color)',
                          backgroundColor: '#FFFFFF',
                          color: '#1F130B',
                          cursor: 'pointer'
                        }}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ ...styles.label, fontSize: '10px' }}>Language</label>
                  <div style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
                    {[
                      { id: 'bilingual', label: 'Both' },
                      { id: 'en', label: 'EN' },
                      { id: 'ur', label: 'UR' }
                    ].map(lang => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => {
                          setIsDirty(true);
                          updateMenuAppearance({
                            name_language: lang.id,
                            show_name_en: lang.id !== 'ur',
                            show_name_ur: lang.id !== 'en'
                          });
                        }}
                        style={{
                          flex: 1,
                          padding: '5px 4px',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: menuAppearance.name_language === lang.id ? '800' : '600',
                          border: menuAppearance.name_language === lang.id ? '1px solid #1F130B' : '1px solid var(--border-color)',
                          backgroundColor: menuAppearance.name_language === lang.id ? '#1F130B' : '#FFFFFF',
                          color: menuAppearance.name_language === lang.id ? '#FFFFFF' : '#1F130B',
                          cursor: 'pointer'
                        }}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ ...styles.label, fontSize: '10px' }}>Theme Style</label>
                  <div style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
                    {[
                      { id: 'light', label: 'Light' },
                      { id: 'warm', label: 'Warm' },
                      { id: 'dark', label: 'Dark' }
                    ].map(th => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => applyThemePreset(th.id)}
                        style={{
                          flex: 1,
                          padding: '5px 4px',
                          borderRadius: '5px',
                          fontSize: '11px',
                          fontWeight: '700',
                          border: '1px solid var(--border-color)',
                          backgroundColor: th.id === 'dark' ? '#261B14' : th.id === 'warm' ? '#FFFDF9' : '#FFFFFF',
                          color: th.id === 'dark' ? '#FFFFFF' : '#1F130B',
                          cursor: 'pointer'
                        }}
                      >
                        {th.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion Controls Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#7A695E', textTransform: 'uppercase' }}>
                Menu &amp; Layout Customization Sections
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAdvancedMenuSettings(!showAdvancedMenuSettings)}
                  style={{
                    ...styles.subtleBtn,
                    backgroundColor: showAdvancedMenuSettings ? '#1F130B' : '#FAF6F0',
                    color: showAdvancedMenuSettings ? '#FFFFFF' : '#7A695E',
                    fontSize: '11px'
                  }}
                >
                  <Sliders size={11} style={{ marginRight: '3px' }} /> {showAdvancedMenuSettings ? 'Hide Advanced' : 'Show Advanced'}
                </button>
                <button type="button" onClick={expandAllAccordions} style={{ ...styles.subtleBtn, fontSize: '11px' }}>
                  Expand All
                </button>
                <button type="button" onClick={collapseAllAccordions} style={{ ...styles.subtleBtn, fontSize: '11px' }}>
                  Collapse All
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* ACCORDION 1: LAYOUT & SIZING                                  */}
            {/* ------------------------------------------------------------- */}
            {matchesSearch('Layout Sizing Width Height Columns Alignment Dimensions') && (
              <div style={styles.accordionCard}>
                <div style={styles.accordionHeader} onClick={() => toggleAccordion('layout')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layout size={16} color="#C62828" />
                    <div>
                      <h3 style={styles.accordionTitle}>1. Layout &amp; Card Dimensions</h3>
                      <p style={styles.accordionSubtitle}>Card width, height, grid columns, and product alignment.</p>
                    </div>
                  </div>
                  {openAccordions.layout ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {openAccordions.layout && (
                  <div style={styles.accordionBody}>
                    <div style={styles.grid2}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Card Width</label>
                        <select
                          value={menuAppearance.card_width_type || 'auto'}
                          onChange={(e) => updateMenuAppearance({ card_width_type: e.target.value })}
                          style={styles.selectInput}
                        >
                          <option value="auto">Auto (Responsive Flex)</option>
                          <option value="custom">Custom Width ({menuAppearance.card_width || 175}px)</option>
                        </select>
                        {menuAppearance.card_width_type === 'custom' && (
                          <input
                            type="range"
                            min="110"
                            max="320"
                            value={menuAppearance.card_width || 175}
                            onChange={(e) => updateMenuAppearance({ card_width: parseInt(e.target.value) || 175 })}
                            style={{ width: '100%', marginTop: '6px', accentColor: '#C62828' }}
                          />
                        )}
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Card Height</label>
                        <select
                          value={menuAppearance.card_height_type || 'auto'}
                          onChange={(e) => updateMenuAppearance({ card_height_type: e.target.value })}
                          style={styles.selectInput}
                        >
                          <option value="auto">Auto (Fit Content)</option>
                          <option value="custom">Fixed Height ({menuAppearance.card_height || 220}px)</option>
                        </select>
                        {menuAppearance.card_height_type === 'custom' && (
                          <input
                            type="range"
                            min="140"
                            max="360"
                            value={menuAppearance.card_height || 220}
                            onChange={(e) => updateMenuAppearance({ card_height: parseInt(e.target.value) || 220 })}
                            style={{ width: '100%', marginTop: '6px', accentColor: '#C62828' }}
                          />
                        )}
                      </div>
                    </div>

                    <div style={{ ...styles.grid2, marginTop: '10px' }}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Grid Columns</label>
                        <select
                          value={menuAppearance.grid_columns || 'auto'}
                          onChange={(e) => updateMenuAppearance({ grid_columns: e.target.value })}
                          style={styles.selectInput}
                        >
                          <option value="auto">Auto-Fit (Recommended)</option>
                          <option value="2">2 Columns (Large Touch)</option>
                          <option value="3">3 Columns (Standard POS)</option>
                          <option value="4">4 Columns (Desktop Full)</option>
                          <option value="5">5 Columns (Compact Full)</option>
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Product Alignment</label>
                        <select
                          value={menuAppearance.grid_alignment || 'stretch'}
                          onChange={(e) => updateMenuAppearance({ grid_alignment: e.target.value })}
                          style={styles.selectInput}
                        >
                          <option value="stretch">Stretch (Fill Available Width)</option>
                          <option value="left">Left Aligned</option>
                          <option value="center">Center Aligned</option>
                        </select>
                      </div>
                    </div>

                    {showAdvancedMenuSettings && (
                      <div style={styles.advancedBox}>
                        <span style={styles.advancedTitle}>Advanced Spacing &amp; Limits</span>
                        <div style={styles.grid3}>
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Horizontal Gap: {menuAppearance.card_gap_x || 10}px</label>
                            <input
                              type="number"
                              min="2"
                              max="30"
                              value={menuAppearance.card_gap_x || 10}
                              onChange={(e) => updateMenuAppearance({ card_gap_x: parseInt(e.target.value) || 10 })}
                              style={styles.input}
                            />
                          </div>
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Vertical Gap: {menuAppearance.card_gap_y || 10}px</label>
                            <input
                              type="number"
                              min="2"
                              max="30"
                              value={menuAppearance.card_gap_y || 10}
                              onChange={(e) => updateMenuAppearance({ card_gap_y: parseInt(e.target.value) || 10 })}
                              style={styles.input}
                            />
                          </div>
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Inner Card Padding: {menuAppearance.card_padding_top || 8}px</label>
                            <input
                              type="number"
                              min="2"
                              max="24"
                              value={menuAppearance.card_padding_top || 8}
                              onChange={(e) => updateMenuAppearance({
                                card_padding_top: parseInt(e.target.value) || 8,
                                card_padding_bottom: parseInt(e.target.value) || 8,
                                card_padding_left: parseInt(e.target.value) || 8,
                                card_padding_right: parseInt(e.target.value) || 8
                              })}
                              style={styles.input}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* ACCORDION 2: PRODUCT CARD ELEMENTS                            */}
            {/* ------------------------------------------------------------- */}
            {matchesSearch('Elements Card Visibility Reorder Image Urdu English Price Unit Stock') && (
              <div style={styles.accordionCard}>
                <div style={styles.accordionHeader} onClick={() => toggleAccordion('card_elements')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={16} color="#1565C0" />
                    <div>
                      <h3 style={styles.accordionTitle}>2. Product Card Elements</h3>
                      <p style={styles.accordionSubtitle}>Show, hide, and reorder elements inside the card.</p>
                    </div>
                  </div>
                  {openAccordions.card_elements ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {openAccordions.card_elements && (
                  <div style={styles.accordionBody}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      {[
                        { key: 'image', label: 'Dish Image' },
                        { key: 'name_en', label: 'English Name' },
                        { key: 'name_ur', label: 'Urdu Subtitle' },
                        { key: 'price', label: 'Price' },
                        { key: 'unit', label: 'Unit Label' },
                        { key: 'stock', label: 'Stock Counter' }
                      ].map(elem => {
                        const isVisible = menuAppearance.visible_elements ? menuAppearance.visible_elements[elem.key] !== false : true;
                        return (
                          <button
                            key={elem.key}
                            type="button"
                            onClick={() => {
                              updateMenuAppearance(prev => ({
                                ...prev,
                                visible_elements: {
                                  ...(prev.visible_elements || {}),
                                  [elem.key]: !isVisible
                                }
                              }));
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              border: isVisible ? '1px solid #1B5E20' : '1px solid var(--border-color)',
                              backgroundColor: isVisible ? '#E8F5E9' : '#FFFFFF',
                              color: isVisible ? '#1B5E20' : '#7A695E',
                              fontWeight: '700',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            <span>{elem.label}</span>
                            {isVisible ? <Check size={13} color="#2E7D32" /> : <X size={13} color="#9E9E9E" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* ACCORDION 3: IMAGE DISPLAY & STYLING                          */}
            {/* ------------------------------------------------------------- */}
            {matchesSearch('Images Photos Size Shape Fit Aspect Ratio Position Thumbnail') && (
              <div style={styles.accordionCard}>
                <div style={styles.accordionHeader} onClick={() => toggleAccordion('images')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Utensils size={16} color="#E65100" />
                    <div>
                      <h3 style={styles.accordionTitle}>3. Image Display &amp; Styling</h3>
                      <p style={styles.accordionSubtitle}>Image size, aspect ratio, rounded corners, and placement.</p>
                    </div>
                  </div>
                  {openAccordions.images ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {openAccordions.images && (
                  <div style={styles.accordionBody}>
                    <div style={styles.grid2}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Image Size</label>
                        <select
                          value={menuAppearance.image_size || 'medium'}
                          onChange={(e) => updateMenuAppearance({ image_size: e.target.value })}
                          style={styles.selectInput}
                        >
                          <option value="compact">Compact Thumbnail (65px)</option>
                          <option value="medium">Standard Size (80px)</option>
                          <option value="large">Prominent Banner (105px)</option>
                          <option value="full">Full Card Width</option>
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Corner Shape</label>
                        <select
                          value={menuAppearance.image_shape || 'rounded'}
                          onChange={(e) => updateMenuAppearance({ image_shape: e.target.value })}
                          style={styles.selectInput}
                        >
                          <option value="rounded">Rounded Corners</option>
                          <option value="square">Square / Crisp</option>
                          <option value="circle">Circular / Badge</option>
                          <option value="pill">Pill Shape</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ ...styles.grid2, marginTop: '10px' }}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Image Position</label>
                        <select
                          value={menuAppearance.image_position || 'top'}
                          onChange={(e) => updateMenuAppearance({ image_position: e.target.value })}
                          style={styles.selectInput}
                        >
                          <option value="top">Top (Above Title)</option>
                          <option value="bottom">Bottom (Below Title)</option>
                          <option value="left">Left (Thumbnail Style)</option>
                          <option value="right">Right</option>
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Image Fit</label>
                        <select
                          value={menuAppearance.image_fit || 'cover'}
                          onChange={(e) => updateMenuAppearance({ image_fit: e.target.value })}
                          style={styles.selectInput}
                        >
                          <option value="cover">Cover (Fill &amp; Crop)</option>
                          <option value="contain">Contain (Show Entire Photo)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* ACCORDION 4: TITLE & URDU TYPOGRAPHY                          */}
            {/* ------------------------------------------------------------- */}
            {matchesSearch('Title Urdu English Language Font Size Color Alignment Typography') && (
              <div style={styles.accordionCard}>
                <div style={styles.accordionHeader} onClick={() => toggleAccordion('typography')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Type size={16} color="#E28F46" />
                    <div>
                      <h3 style={styles.accordionTitle}>4. Title &amp; Urdu Typography</h3>
                      <p style={styles.accordionSubtitle}>English name, Urdu translation font, colors, and layout position.</p>
                    </div>
                  </div>
                  {openAccordions.typography ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {openAccordions.typography && (
                  <div style={styles.accordionBody}>
                    <div style={styles.grid2}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Language Display</label>
                        <select
                          value={menuAppearance.name_language || 'bilingual'}
                          onChange={(e) => updateMenuAppearance({
                            name_language: e.target.value,
                            show_name_en: e.target.value !== 'ur',
                            show_name_ur: e.target.value !== 'en'
                          })}
                          style={styles.selectInput}
                        >
                          <option value="bilingual">Bilingual (English + Urdu)</option>
                          <option value="en">English Name Only</option>
                          <option value="ur">Urdu Name Only</option>
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Name Position</label>
                        <select
                          value={menuAppearance.name_position || 'overlay'}
                          onChange={(e) => updateMenuAppearance({ name_position: e.target.value })}
                          style={styles.selectInput}
                        >
                          <option value="overlay">Overlay / Inline on Card</option>
                          <option value="below_image">Below Image</option>
                          <option value="above_image">Above Image</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '10px' }}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>English Font Size: {menuAppearance.name_en_font_size || 12}px</label>
                        <input
                          type="number"
                          min="9"
                          max="20"
                          value={menuAppearance.name_en_font_size || 12}
                          onChange={(e) => updateMenuAppearance({ name_en_font_size: parseInt(e.target.value) || 12 })}
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>English Text Color</label>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={menuAppearance.name_en_color || '#1F130B'}
                            onChange={(e) => updateMenuAppearance({ name_en_color: e.target.value })}
                            style={{ width: '36px', height: '34px', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={menuAppearance.name_en_color || '#1F130B'}
                            onChange={(e) => updateMenuAppearance({ name_en_color: e.target.value })}
                            style={styles.input}
                          />
                        </div>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Urdu Font Size: {menuAppearance.name_ur_font_size || 12}px</label>
                        <input
                          type="number"
                          min="9"
                          max="20"
                          value={menuAppearance.name_ur_font_size || 12}
                          onChange={(e) => updateMenuAppearance({ name_ur_font_size: parseInt(e.target.value) || 12 })}
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Urdu Text Color</label>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={menuAppearance.name_ur_color || '#E28F46'}
                            onChange={(e) => updateMenuAppearance({ name_ur_color: e.target.value })}
                            style={{ width: '36px', height: '34px', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={menuAppearance.name_ur_color || '#E28F46'}
                            onChange={(e) => updateMenuAppearance({ name_ur_color: e.target.value })}
                            style={styles.input}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* ACCORDION 5: PRICE & STOCK DISPLAY                            */}
            {/* ------------------------------------------------------------- */}
            {matchesSearch('Price Stock Currency Symbol Rs PKR Unit Badge') && (
              <div style={styles.accordionCard}>
                <div style={styles.accordionHeader} onClick={() => toggleAccordion('price_stock')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={16} color="#C62828" />
                    <div>
                      <h3 style={styles.accordionTitle}>5. Price &amp; Stock Display</h3>
                      <p style={styles.accordionSubtitle}>Price sizing, currency symbol (Rs / PKR), and stock status.</p>
                    </div>
                  </div>
                  {openAccordions.price_stock ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {openAccordions.price_stock && (
                  <div style={styles.accordionBody}>
                    <div style={styles.grid3}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Price Font Size: {menuAppearance.price_font_size || 13}px</label>
                        <input
                          type="number"
                          min="10"
                          max="22"
                          value={menuAppearance.price_font_size || 13}
                          onChange={(e) => updateMenuAppearance({ price_font_size: parseInt(e.target.value) || 13 })}
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Currency Symbol</label>
                        <select
                          value={menuAppearance.currency_symbol || 'Rs'}
                          onChange={(e) => updateMenuAppearance({ currency_symbol: e.target.value })}
                          style={styles.selectInput}
                        >
                          <option value="Rs">Rs (Standard)</option>
                          <option value="PKR">PKR</option>
                          <option value="/=">/=</option>
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Price Color</label>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={menuAppearance.price_color || '#C62828'}
                            onChange={(e) => updateMenuAppearance({ price_color: e.target.value })}
                            style={{ width: '36px', height: '34px', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={menuAppearance.price_color || '#C62828'}
                            onChange={(e) => updateMenuAppearance({ price_color: e.target.value })}
                            style={styles.input}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* ACCORDION 6: COLORS & BORDERS                                 */}
            {/* ------------------------------------------------------------- */}
            {matchesSearch('Colors Borders Shadows Background Radius Theme Card') && (
              <div style={styles.accordionCard}>
                <div style={styles.accordionHeader} onClick={() => toggleAccordion('colors_borders')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Palette size={16} color="#7B1FA2" />
                    <div>
                      <h3 style={styles.accordionTitle}>6. Colors, Borders &amp; Shadows</h3>
                      <p style={styles.accordionSubtitle}>Card background, border width, radius, and shadow styling.</p>
                    </div>
                  </div>
                  {openAccordions.colors_borders ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {openAccordions.colors_borders && (
                  <div style={styles.accordionBody}>
                    <div style={styles.grid3}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Card Background</label>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={menuAppearance.card_bg_color || '#FFFFFF'}
                            onChange={(e) => updateMenuAppearance({ card_bg_color: e.target.value })}
                            style={{ width: '36px', height: '34px', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={menuAppearance.card_bg_color || '#FFFFFF'}
                            onChange={(e) => updateMenuAppearance({ card_bg_color: e.target.value })}
                            style={styles.input}
                          />
                        </div>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Border Color</label>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={menuAppearance.card_border_color || '#EFE6DA'}
                            onChange={(e) => updateMenuAppearance({ card_border_color: e.target.value })}
                            style={{ width: '36px', height: '34px', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={menuAppearance.card_border_color || '#EFE6DA'}
                            onChange={(e) => updateMenuAppearance({ card_border_color: e.target.value })}
                            style={styles.input}
                          />
                        </div>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Corner Radius: {menuAppearance.card_border_radius || 10}px</label>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={menuAppearance.card_border_radius || 10}
                          onChange={(e) => updateMenuAppearance({ card_border_radius: parseInt(e.target.value) || 10 })}
                          style={styles.input}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* ACCORDION 7: CATEGORY BAR                                     */}
            {/* ------------------------------------------------------------- */}
            {matchesSearch('Category Bar Buttons Scroll Navigation Shape Active') && (
              <div style={styles.accordionCard}>
                <div style={styles.accordionHeader} onClick={() => toggleAccordion('categories')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={16} color="#00695C" />
                    <div>
                      <h3 style={styles.accordionTitle}>7. Category Navigation Bar</h3>
                      <p style={styles.accordionSubtitle}>Horizontal scroll, button shapes, and active category colors.</p>
                    </div>
                  </div>
                  {openAccordions.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {openAccordions.categories && (
                  <div style={styles.accordionBody}>
                    <div style={styles.grid2}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Category Bar Layout</label>
                        <select
                          value={menuAppearance.category_layout || 'scrollable_horizontal'}
                          onChange={(e) => updateMenuAppearance({ category_layout: e.target.value })}
                          style={styles.selectInput}
                        >
                          <option value="scrollable_horizontal">Horizontal Scrollable (Recommended)</option>
                          <option value="horizontal">Horizontal Multi-Row Wrap</option>
                          <option value="grid">Grid Buttons</option>
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Button Shape</label>
                        <select
                          value={menuAppearance.category_btn_shape || 'rounded'}
                          onChange={(e) => updateMenuAppearance({ category_btn_shape: e.target.value })}
                          style={styles.selectInput}
                        >
                          <option value="rounded">Rounded Pill</option>
                          <option value="square">Clean Square</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* ACCORDION 8: SEARCH & GLOBAL                                  */}
            {/* ------------------------------------------------------------- */}
            {matchesSearch('Search Bar Placeholder Global Background Margin') && (
              <div style={styles.accordionCard}>
                <div style={styles.accordionHeader} onClick={() => toggleAccordion('search_global')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={16} color="#7A695E" />
                    <div>
                      <h3 style={styles.accordionTitle}>8. Search &amp; Global Menu</h3>
                      <p style={styles.accordionSubtitle}>Search input placeholder and POS menu background styling.</p>
                    </div>
                  </div>
                  {openAccordions.search_global ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {openAccordions.search_global && (
                  <div style={styles.accordionBody}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Search Placeholder Text</label>
                      <input
                        type="text"
                        value={menuAppearance.search_placeholder || 'Search dishes, deals, drinks...'}
                        onChange={(e) => updateMenuAppearance({ search_placeholder: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Live Responsive Multi-Device Preview */}
          <div style={styles.previewStickyContainer}>
            <div style={styles.previewCard}>
              <div style={styles.previewCardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={15} color="#C62828" />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#1F130B' }}>Live Menu Preview</span>
                </div>

                {/* Device Switcher */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: '#FFFFFF', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '700',
                      border: 'none',
                      backgroundColor: previewDevice === 'desktop' ? '#1F130B' : 'transparent',
                      color: previewDevice === 'desktop' ? '#FFFFFF' : '#7A695E',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Desktop Preview (4 cols)"
                  >
                    <Monitor size={12} /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('tablet')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '700',
                      border: 'none',
                      backgroundColor: previewDevice === 'tablet' ? '#1F130B' : 'transparent',
                      color: previewDevice === 'tablet' ? '#FFFFFF' : '#7A695E',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Tablet Preview (3 cols)"
                  >
                    <Laptop size={12} /> Tablet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('pos_screen')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '700',
                      border: 'none',
                      backgroundColor: previewDevice === 'pos_screen' ? '#1F130B' : 'transparent',
                      color: previewDevice === 'pos_screen' ? '#FFFFFF' : '#7A695E',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Compact POS Display (2 cols)"
                  >
                    <Smartphone size={12} /> POS
                  </button>
                </div>
              </div>

              {/* Preview Rendering Container */}
              <div 
                style={{
                  ...styles.previewScrollArea,
                  backgroundColor: menuAppearance.menu_bg_color || '#FAF6F0',
                  padding: '12px'
                }}
              >
                {/* Search Bar in Preview */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: menuAppearance.search_bg || '#FFFFFF',
                  border: `1px solid ${menuAppearance.search_border_color || '#EFE6DA'}`,
                  borderRadius: `${menuAppearance.search_border_radius || 6}px`,
                  padding: '6px 10px',
                  marginBottom: '10px'
                }}>
                  <Search size={12} color="#7A695E" />
                  <span style={{ fontSize: '11px', color: '#9E9E9E' }}>
                    {menuAppearance.search_placeholder || 'Search dishes...'}
                  </span>
                </div>

                {/* Categories Bar in Preview */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
                  {['All Dishes', 'Barbeque', 'Karahi', 'Sajji'].map((cName, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        borderRadius: `${menuAppearance.category_btn_radius || 6}px`,
                        fontSize: '10px',
                        fontWeight: '700',
                        backgroundColor: idx === 0 ? (menuAppearance.category_active_bg || '#1F130B') : (menuAppearance.category_btn_bg || '#FFFFFF'),
                        color: idx === 0 ? (menuAppearance.category_active_color || '#FFFFFF') : (menuAppearance.category_btn_color || '#1F130B'),
                        border: `1px solid ${idx === 0 ? (menuAppearance.category_active_border || '#1F130B') : (menuAppearance.category_btn_border || '#EFE6DA')}`,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cName}
                    </div>
                  ))}
                </div>

                {/* Product Grid in Preview */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: previewDevice === 'desktop' ? 'repeat(2, 1fr)' : previewDevice === 'tablet' ? 'repeat(2, 1fr)' : '1fr',
                  gap: `${menuAppearance.card_gap_y || 8}px ${menuAppearance.card_gap_x || 8}px`
                }}>
                  {previewProductsSample.map(prod => (
                    <div
                      key={prod.id}
                      style={{
                        backgroundColor: menuAppearance.card_bg_color || '#FFFFFF',
                        border: menuAppearance.card_border_on !== false ? `${menuAppearance.card_border_width || 1}px ${menuAppearance.card_border_style || 'solid'} ${menuAppearance.card_border_color || '#EFE6DA'}` : 'none',
                        borderRadius: `${menuAppearance.card_border_radius || 8}px`,
                        padding: `${menuAppearance.card_padding_top || 8}px`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: menuAppearance.card_shadow === 'md' ? '0 4px 12px rgba(0,0,0,0.08)' : '0 2px 6px rgba(0,0,0,0.04)',
                        position: 'relative'
                      }}
                    >
                      {/* Image Preview */}
                      {(menuAppearance.visible_elements?.image !== false) && (
                        <div style={{
                          height: `${menuAppearance.image_height || 65}px`,
                          backgroundColor: '#FAF6F0',
                          borderRadius: `${menuAppearance.image_border_radius || 6}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '6px',
                          overflow: 'hidden'
                        }}>
                          <Utensils size={20} color="#7A695E" />
                        </div>
                      )}

                      {/* Titles Preview */}
                      <div>
                        {(menuAppearance.visible_elements?.name_en !== false) && (
                          <div style={{
                            fontSize: `${menuAppearance.name_en_font_size || 11}px`,
                            fontWeight: menuAppearance.name_en_font_weight || '700',
                            color: menuAppearance.name_en_color || '#1F130B',
                            textAlign: menuAppearance.name_en_align || 'left',
                            lineHeight: '1.2'
                          }}>
                            {prod.name}
                          </div>
                        )}
                        {(menuAppearance.visible_elements?.name_ur !== false && prod.urdu) && (
                          <div style={{
                            fontSize: `${menuAppearance.name_ur_font_size || 11}px`,
                            fontWeight: menuAppearance.name_ur_font_weight || '700',
                            color: menuAppearance.name_ur_color || '#E28F46',
                            textAlign: menuAppearance.name_ur_align || 'right',
                            direction: 'rtl',
                            marginTop: '2px'
                          }}>
                            {prod.urdu}
                          </div>
                        )}
                      </div>

                      {/* Price & Unit Preview */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        {(menuAppearance.visible_elements?.price !== false) && (
                          <span style={{
                            fontSize: `${menuAppearance.price_font_size || 12}px`,
                            fontWeight: menuAppearance.price_font_weight || '700',
                            color: menuAppearance.price_color || '#C62828'
                          }}>
                            {menuAppearance.currency_position === 'prefix' ? `${menuAppearance.currency_symbol || 'Rs'} ${prod.price}` : `${prod.price} ${menuAppearance.currency_symbol || 'Rs'}`}
                          </span>
                        )}
                        {(menuAppearance.visible_elements?.unit !== false) && (
                          <span style={{ fontSize: `${menuAppearance.unit_font_size || 9}px`, color: menuAppearance.unit_color || '#7A695E' }}>
                            {prod.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MENU DISPLAY & SORTING                                             */}
      {/* ========================================================================= */}
      {activeMainTab === 'menu_sorting' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
          
          {/* Automatic & Manual Sorting */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>Menu Display &amp; Sequencing</h2>
              <span style={styles.badge}>Sorting</span>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Sorting Mode</label>
              <select
                value={menuSortingMode}
                onChange={(e) => { setMenuSortingMode(e.target.value); setIsDirty(true); }}
                style={styles.selectInput}
              >
                <option value="manual">Custom Manual Drag/Drop Order</option>
                <option value="az">Alphabetical (A → Z)</option>
                <option value="za">Alphabetical (Z → A)</option>
                <option value="price_asc">Price (Low → High)</option>
                <option value="price_desc">Price (High → Low)</option>
                <option value="newest">Newest Dishes First</option>
                <option value="oldest">Oldest Dishes First</option>
              </select>
            </div>

            {menuSortingMode === 'manual' && (
              <div style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={styles.label}>Product Sequencing</label>
                  <select
                    value={selectedSortCategory}
                    onChange={(e) => setSelectedSortCategory(e.target.value)}
                    style={{ ...styles.selectInput, width: 'auto', padding: '4px 8px', fontSize: '11px' }}
                  >
                    <option value="All">All Categories</option>
                    {categoriesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {getFilteredSortProducts().map((p, idx) => (
                    <div key={p.id} style={styles.reorderRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={styles.orderIndexBadge}>{idx + 1}</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#1F130B' }}>{p.name}</div>
                          <div style={{ fontSize: '10px', color: '#7A695E' }}>{p.category} • Rs {p.price}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleMoveProduct(idx, -1)}
                          disabled={idx === 0}
                          style={styles.reorderBtn}
                        >
                          <MoveUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveProduct(idx, 1)}
                          disabled={idx === getFilteredSortProducts().length - 1}
                          style={styles.reorderBtn}
                        >
                          <MoveDown size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Units of Measurement */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>Units of Measurement</h2>
              <span style={styles.badge}>Units</span>
            </div>

            <form onSubmit={handleCreateUnit} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="New Unit (e.g. KG, Half, Plate, Pitcher)..."
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                style={styles.input}
                required
              />
              <button type="submit" style={styles.primaryPillBtn}>
                <Plus size={14} /> Add
              </button>
            </form>

            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {unitsList.map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#FAF6F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F130B' }}>{u.name}</span>
                    {u.is_default && <span style={styles.defaultBadge}>Default</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {!u.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultUnit(u)}
                        style={styles.subtleBtn}
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenEditUnit(u)}
                      style={styles.iconActionBtn}
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUnit(u.id)}
                      style={{ ...styles.iconActionBtn, color: '#C62828' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RECEIPT CUSTOMIZER                                                 */}
      {/* ========================================================================= */}
      {activeMainTab === 'receipt_customizer' && (
        <ReceiptDesigner
          templates={templates}
          setTemplates={setTemplates}
          activeTemplateId={activeTemplateId}
          setActiveTemplateId={setActiveTemplateId}
          orderTypeTemplates={orderTypeTemplates}
          setOrderTypeTemplates={setOrderTypeTemplates}
          paperWidth={paperWidth}
          setPaperWidth={setPaperWidth}
          customWidth={customWidth}
          setCustomWidth={setCustomWidth}
          topMargin={topMargin}
          setTopMargin={setTopMargin}
          bottomMargin={bottomMargin}
          setBottomMargin={setBottomMargin}
          leftMargin={leftMargin}
          setLeftMargin={setLeftMargin}
          rightMargin={rightMargin}
          setRightMargin={setRightMargin}
          paddingLeftRight={paddingLeftRight}
          setPaddingLeftRight={setPaddingLeftRight}
          onSave={handleSaveAll}
          onTestPrint={handlePrintTestReceipt}
          onDirty={() => setIsDirty(true)}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 5: TAXES & DISCOUNTS                                                  */}
      {/* ========================================================================= */}
      {activeMainTab === 'taxes_discounts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
          {/* Tax Rates */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>GST / Sales Tax Rates</h2>
              <span style={styles.badge}>Taxes</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Tax Name (e.g. Punjab GST 16%)..."
                value={newTaxName}
                onChange={(e) => setNewTaxName(e.target.value)}
                style={{ ...styles.input, flex: 2 }}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Rate %"
                value={newTaxRate}
                onChange={(e) => setNewTaxRate(e.target.value)}
                style={{ ...styles.input, flex: 1 }}
              />
              <button type="button" onClick={handleAddTax} style={styles.primaryPillBtn}>
                <Plus size={13} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {taxes.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#FAF6F0' }}>
                  <div>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#1F130B' }}>{t.name}</span>
                    <span style={{ marginLeft: '8px', color: '#C62828', fontWeight: '800', fontSize: '12px' }}>({t.rate}%)</span>
                    {t.is_default && <span style={{ ...styles.defaultBadge, marginLeft: '6px' }}>Default</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {!t.is_default && <button type="button" onClick={() => handleSetDefaultTax(t.id)} style={styles.subtleBtn}>Set Default</button>}
                    <button type="button" onClick={() => handleRemoveTax(t.id)} style={{ ...styles.iconActionBtn, color: '#C62828' }}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount Presets */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>Promotional Discount Presets</h2>
              <span style={styles.badge}>Discounts</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Discount Name (e.g. VIP 10%)..."
                value={newDiscountName}
                onChange={(e) => setNewDiscountName(e.target.value)}
                style={{ ...styles.input, flex: 2 }}
              />
              <input
                type="number"
                step="0.5"
                placeholder="Value"
                value={newDiscountRate}
                onChange={(e) => setNewDiscountRate(e.target.value)}
                style={{ ...styles.input, flex: 1 }}
              />
              <button type="button" onClick={handleAddDiscount} style={styles.primaryPillBtn}>
                <Plus size={13} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {discounts.map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#FAF6F0' }}>
                  <div>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#1F130B' }}>{d.name}</span>
                    <span style={{ marginLeft: '8px', color: '#2E7D32', fontWeight: '800', fontSize: '12px' }}>({d.rate}%)</span>
                    {d.is_default && <span style={{ ...styles.defaultBadge, marginLeft: '6px' }}>Default</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {!d.is_default && <button type="button" onClick={() => handleSetDefaultDiscount(d.id)} style={styles.subtleBtn}>Set Default</button>}
                    <button type="button" onClick={() => handleRemoveDiscount(d.id)} style={{ ...styles.iconActionBtn, color: '#C62828' }}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: BACKUP & RESTORE & CROSS-PC TRANSFER                               */}
      {/* ========================================================================= */}
      {activeMainTab === 'backup_restore' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
          
          {/* Legacy Migration & Portable Transfer */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>Cross-PC Menu Transfer &amp; Legacy Migration</h2>
              <span style={styles.badge}>Migration</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '12px', color: '#7A695E', lineHeight: '1.4' }}>
                Quickly migrate existing menu categories, dishes, prices, units, and appearance from an older POS database or export a portable menu package for another PC.
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleScanLegacyPOS}
                  style={styles.darkActionBtn}
                  disabled={migrationScanning}
                >
                  <RefreshCw size={14} className={migrationScanning ? 'animate-spin' : ''} />
                  {migrationScanning ? 'Scanning Drives...' : 'Auto-Detect Legacy POS'}
                </button>

                <button
                  type="button"
                  onClick={handleExportMenuPackage}
                  style={styles.subtleBtn}
                >
                  <Download size={14} style={{ marginRight: '4px' }} /> Export Menu Package
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <label style={styles.label}>Import Menu Package (.json)</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleSelectMenuPackageFile}
                  style={{ ...styles.input, marginTop: '4px' }}
                />
              </div>
            </div>
          </div>

          {/* Database Backup */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>Full Database Backup &amp; Reset</h2>
              <span style={styles.badge}>Maintenance</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '12px', color: '#7A695E', lineHeight: '1.4' }}>
                Create a full atomic snapshot of the SQLite database containing all sales history, catalog dishes, inventory logs, and configurations.
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => window.open('http://localhost:5000/api/backup', '_blank')}
                  style={{ ...styles.darkActionBtn, backgroundColor: '#2E7D32' }}
                >
                  <Download size={14} /> Download Full Backup
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResetTargetSection('all');
                    setShowResetConfirmModal(true);
                  }}
                  style={{ ...styles.subtleBtn, color: '#C62828' }}
                >
                  Reset Factory Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESET CONFIRMATION */}
      {showResetConfirmModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '800', color: '#C62828' }}>Confirm Reset Settings</h3>
              <button onClick={() => setShowResetConfirmModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={{ padding: '16px 0', fontSize: '13px', color: '#1F130B', lineHeight: '1.4' }}>
              Are you sure you want to reset <strong>{resetTargetSection}</strong> to default settings? Your products, orders, sales history, and inventory will remain strictly intact.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowResetConfirmModal(false)} style={styles.subtleBtn}>Cancel</button>
              <button type="button" onClick={handleExecuteReset} style={{ ...styles.masterSaveBtn, backgroundColor: '#C62828' }}>Confirm Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LEGACY MIGRATION DETECTION */}
      {showMigrationScanModal && migrationDetected && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '800', color: '#1F130B' }}>Legacy Data Scan Results</h3>
              <button onClick={() => setShowMigrationScanModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={{ padding: '14px 0' }}>
              {migrationDetected.detected ? (
                <>
                  <div style={{ backgroundColor: '#E8F5E9', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '12px', color: '#2E7D32', fontWeight: '700' }}>
                    ✓ Found previous database with {migrationDetected.summary?.productsCount || 0} dishes and {migrationDetected.summary?.categoriesCount || 0} categories.
                  </div>
                  <p style={{ fontSize: '12px', color: '#7A695E' }}>Path: {migrationDetected.sourcePath}</p>
                </>
              ) : (
                <p style={{ fontSize: '13px', color: '#7A695E' }}>No older POS database was found in standard app locations.</p>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowMigrationScanModal(false)} style={styles.subtleBtn}>Close</button>
              {migrationDetected.detected && (
                <button onClick={() => handleExecuteLegacyMigration('menu_only')} style={styles.primaryPillBtn} disabled={migrationImporting}>
                  {migrationImporting ? 'Migrating...' : 'Migrate Menu Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PORTABLE MENU IMPORT */}
      {showMenuImportModal && pendingMenuPackage && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '800', color: '#1F130B' }}>Import Portable Menu</h3>
              <button onClick={() => setShowMenuImportModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={{ padding: '14px 0', fontSize: '12px', color: '#1F130B' }}>
              Importing <strong>{(pendingMenuPackage.products || []).length} products</strong> and <strong>{(pendingMenuPackage.categories || []).length} categories</strong>.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowMenuImportModal(false)} style={styles.subtleBtn} disabled={migrationImporting}>Cancel</button>
              <button onClick={() => handleExecuteMenuImport('menu_only')} style={styles.primaryPillBtn} disabled={migrationImporting}>
                {migrationImporting ? 'Importing...' : 'Confirm Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {ToastContainerEl}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px 24px',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: '#FAF6F0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1F130B',
  },
  subtitle: {
    fontSize: '13px',
    color: '#7A695E',
    marginTop: '2px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '6px 10px',
    width: '280px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '12px',
    color: '#1F130B',
    width: '100%',
    padding: 0,
  },
  unsavedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FFF3E0',
    color: '#E65100',
    border: '1px solid #FFE0B2',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
  },
  successBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    border: '1px solid #C8E6C9',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
  },
  iconBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 10px',
    color: '#7A695E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  masterSaveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '13px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(198, 40, 40, 0.25)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px 20px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 2px 8px rgba(31, 19, 11, 0.04)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#1F130B',
  },
  badge: {
    backgroundColor: '#FAF6F0',
    color: '#7A695E',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '5px',
    border: '1px solid var(--border-color)',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#7A695E',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    fontSize: '13px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FFFFFF',
    color: '#1F130B',
    outline: 'none',
  },
  selectInput: {
    width: '100%',
    padding: '8px 10px',
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FFFFFF',
    color: '#1F130B',
    outline: 'none',
    cursor: 'pointer',
  },
  primaryPillBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#1F130B',
    color: '#FFFFFF',
    padding: '7px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
  },
  darkActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#1F130B',
    color: '#FFFFFF',
    padding: '8px 14px',
    borderRadius: '7px',
    fontSize: '12px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
  },
  subtleBtn: {
    backgroundColor: '#FAF6F0',
    color: '#7A695E',
    border: '1px solid var(--border-color)',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  iconActionBtn: {
    backgroundColor: '#FAF6F0',
    border: '1px solid var(--border-color)',
    borderRadius: '5px',
    padding: '5px 7px',
    color: '#7A695E',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  templateRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #A5D6A7',
    textTransform: 'uppercase',
  },
  accordionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(31, 19, 11, 0.03)',
  },
  accordionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    userSelect: 'none',
  },
  accordionTitle: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#1F130B',
  },
  accordionSubtitle: {
    fontSize: '11px',
    color: '#7A695E',
    marginTop: '1px',
  },
  accordionBody: {
    padding: '14px 16px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: '#FAFAFA',
  },
  advancedBox: {
    marginTop: '12px',
    padding: '10px 12px',
    backgroundColor: '#FAF6F0',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
  advancedTitle: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#7A695E',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  previewStickyContainer: {
    position: 'sticky',
    top: '16px',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 16px rgba(31, 19, 11, 0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 140px)',
  },
  previewCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#FAF6F0',
  },
  previewActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '5px',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#1F130B',
    cursor: 'pointer',
  },
  previewScrollArea: {
    padding: '12px',
    overflowY: 'auto',
    flex: 1,
  },
  reorderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#FAF6F0',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
  },
  orderIndexBadge: {
    backgroundColor: '#1F130B',
    color: '#FFFFFF',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '800',
  },
  reorderBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '4px 6px',
    color: '#1F130B',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '440px',
    padding: '18px',
    boxShadow: '0 10px 30px rgba(31, 19, 11, 0.12)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
  },
  closeBtn: {
    border: 'none',
    background: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#7A695E',
  }
};
