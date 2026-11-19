import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    CreditCard, Calendar, CheckCircle2, PieChart, TrendingDown, TrendingUp,
    Plus, Settings, Download, Upload, Trash2, Edit3,
    ChevronLeft, ChevronRight, Home, Shield, Zap, DollarSign,
    Sparkles, Layers, Check, AlertCircle, Wallet, ArrowUpRight, User
} from 'lucide-react';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import './KhataKit.css';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonthDisplay(ym, short = false) {
    if (!ym) return '';
    const [y, m] = ym.split('-').map(Number);
    const idx = Math.max(0, Math.min(11, (m || 1) - 1));
    return `${short ? SHORT_MONTHS[idx] : MONTH_NAMES[idx]} ${y}`;
}

function shiftMonth(ym, delta) {
    const [y, m] = ym.split('-').map(Number);
    const total = y * 12 + (m - 1) + delta;
    const ny = Math.floor(total / 12);
    const nm = ((total % 12) + 12) % 12 + 1;
    return `${ny}-${String(nm).padStart(2, '0')}`;
}

function getOrdinal(n) {
    const num = Number(n) || 1;
    const s = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getCurrentYearMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Resolve API base for KhataKit (/khatakit)
function getKhataKitCandidates(subpath = '') {
    const isLocal = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const bases = [];
    if (import.meta.env.VITE_API_URL) {
        bases.push(import.meta.env.VITE_API_URL.replace(/\/$/, ''));
    } else if (isLocal) {
        bases.push('http://localhost:5000');
        bases.push(API_BASE_URL);
    } else {
        bases.push(API_BASE_URL);
    }
    return [...new Set(bases)].map(b => `${b}/khatakit${subpath}`);
}

async function khataFetchWithUser(userKey, subpath = '', options = {}) {
    const urls = getKhataKitCandidates(subpath);
    let lastError = null;
    for (const url of urls) {
        try {
            const res = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-User-Id': userKey,
                    ...(options.headers || {})
                }
            });
            if (res.ok) {
                return await res.json();
            }
            const errData = await res.json().catch(() => ({}));
            lastError = new Error(errData.error || `HTTP ${res.status}`);
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError || new Error('Unable to reach /khatakit API');
}

const KhataKit = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const userKey = (user?.email || user?.id || user?._id || user?.username || '').toLowerCase().trim();
    const userDisplayName = user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : (user?.name || user?.username || user?.email || 'Member');

    // Redirect unauthenticated visitors to Login page
    useEffect(() => {
        if (!isAuthenticated || !userKey) {
            navigate('/login?redirect=/khatakit', { replace: true });
        }
    }, [isAuthenticated, userKey, navigate]);

    const khataFetch = useCallback((subpath = '', options = {}) => {
        return khataFetchWithUser(userKey, subpath, options);
    }, [userKey]);

    const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
    const [activeTab, setActiveTab] = useState('dashboard');
    const [checklistFilter, setChecklistFilter] = useState('all');
    const [emiCardFilter, setEmiCardFilter] = useState('all');
    const [emiStatusFilter, setEmiStatusFilter] = useState('all');
    const [fixedCategoryFilter, setFixedCategoryFilter] = useState('all');
    const [investmentAssetFilter, setInvestmentAssetFilter] = useState('all');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [inlineAmounts, setInlineAmounts] = useState({});

    // Modals State
    const [cardModalOpen, setCardModalOpen] = useState(false);
    const [emiModalOpen, setEmiModalOpen] = useState(false);
    const [fixedModalOpen, setFixedModalOpen] = useState(false);
    const [spendModalOpen, setSpendModalOpen] = useState(false);
    const [incomeModalOpen, setIncomeModalOpen] = useState(false);
    const [investmentModalOpen, setInvestmentModalOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);

    const anyModalOpen = cardModalOpen || emiModalOpen || fixedModalOpen || spendModalOpen || incomeModalOpen || investmentModalOpen || settingsModalOpen;

    // Lock background body scroll when any dialog is open
    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (anyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [anyModalOpen]);

    // Form States
    const [cardForm, setCardForm] = useState({
        id: '',
        name: '',
        bank: '',
        last4: '',
        card_type: 'Credit Card',
        credit_limit: 200000,
        color: '#f97316',
        billing_day: 15,
        due_day: 5,
        notes: ''
    });

    const [emiForm, setEmiForm] = useState({
        id: '',
        title: '',
        card_id: '',
        category: 'Electronics',
        total_principal: '',
        total_months: 12,
        interest_rate: 0,
        monthly_emi: '',
        start_month: '2026-11',
        due_day: 5,
        processing_fee: 0,
        status: 'active',
        notes: ''
    });

    const [fixedForm, setFixedForm] = useState({
        id: '',
        title: '',
        category: 'Rent & Housing',
        amount: '',
        frequency: 'monthly',
        start_month: '2026-01',
        payment_method: 'UPI / Bank Transfer',
        card_id: '',
        due_day: 5,
        auto_pay: false,
        notes: ''
    });

    const [spendForm, setSpendForm] = useState({
        card_id: '',
        payment_method: 'UPI / Cash / Bank',
        title: '',
        amount: '',
        category: 'Shopping',
        month: '2026-11',
        spend_date: '2026-11-10'
    });

    const [incomeForm, setIncomeForm] = useState({
        title: '',
        amount: '',
        category: 'Salary / Business',
        payment_mode: 'Bank / UPI',
        month: '2026-11',
        income_date: '2026-11-10',
        notes: ''
    });

    const [investmentForm, setInvestmentForm] = useState({
        id: '',
        title: '',
        asset_type: 'Mutual Fund / SIP',
        investment_mode: 'SIP (Monthly)',
        monthly_sip_amount: '',
        total_invested: '',
        current_value: '',
        expected_return_rate: 12,
        platform: '',
        sip_day: 5,
        start_date: '2026-01-05',
        status: 'active',
        notes: ''
    });

    const [settingsForm, setSettingsForm] = useState({
        currencyPreset: 'INR|₹',
        currency_symbol: '₹',
        monthly_income: '0',
        theme: 'light'
    });

    const showToastMsg = (msg) => {
        setToast(msg);
        setTimeout(() => {
            setToast(prev => (prev === msg ? null : prev));
        }, 3200);
    };

    const formatMoney = useCallback((amount) => {
        const num = Number(amount) || 0;
        const settings = (data && data.settings) || {};
        const sym = settings.currency_symbol || '₹';
        const code = settings.currency_code || 'INR';
        const locale = code === 'INR' ? 'en-IN' : 'en-US';
        const formatted = new Intl.NumberFormat(locale, {
            maximumFractionDigits: 0
        }).format(Math.round(num));
        return `${sym}${formatted}`;
    }, [data]);

    const loadDashboard = useCallback(async (monthToLoad = selectedMonth) => {
        if (!isAuthenticated || !userKey) return;
        try {
            const res = await khataFetch(`?month=${encodeURIComponent(monthToLoad)}`);
            setData(res);
            const amtMap = {};
            if (Array.isArray(res.checklist)) {
                res.checklist.forEach(item => {
                    amtMap[`${item.item_type}:${item.item_id}`] = item.amount;
                });
            }
            setInlineAmounts(amtMap);
        } catch (err) {
            console.error('KhataKit load error:', err);
            showToastMsg('Unable to reach /khatakit backend: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedMonth, isAuthenticated, userKey, khataFetch]);

    useEffect(() => {
        if (isAuthenticated && userKey) {
            loadDashboard(selectedMonth);
        }
    }, [selectedMonth, isAuthenticated, userKey, loadDashboard]);

    // Auto-calculate EMI preview
    const calculateEmiValues = (principal, months, rate) => {
        const P = Number(principal) || 0;
        const n = Number(months) || 1;
        const annualRate = Number(rate) || 0;
        if (P <= 0 || n <= 0) return { emi: '', totalPayable: 0, totalInterest: 0 };
        let emi = 0;
        if (annualRate <= 0) {
            emi = Math.round(P / n);
        } else {
            const r = annualRate / 12 / 100;
            emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
        }
        const totalPayable = emi * n;
        const totalInterest = Math.max(0, totalPayable - P);
        return { emi, totalPayable, totalInterest };
    };

    const handleEmiCalcChange = (field, value) => {
        const updated = { ...emiForm, [field]: value };
        const { emi } = calculateEmiValues(
            field === 'total_principal' ? value : updated.total_principal,
            field === 'total_months' ? value : updated.total_months,
            field === 'interest_rate' ? value : updated.interest_rate
        );
        if (emi !== '') updated.monthly_emi = emi;
        setEmiForm(updated);
    };

    // Modal Openers
    const openAddCardModal = () => {
        setCardForm({
            id: '',
            name: '',
            bank: '',
            last4: '',
            card_type: 'Credit Card',
            credit_limit: 200000,
            color: '#f97316',
            billing_day: 15,
            due_day: 5,
            notes: ''
        });
        setCardModalOpen(true);
    };

    const openEditCardModal = (card) => {
        setCardForm({
            id: card.id,
            name: card.name || '',
            bank: card.bank || '',
            last4: card.last4 || '',
            card_type: card.card_type || 'Credit Card',
            credit_limit: card.credit_limit || 0,
            color: card.color || '#f97316',
            billing_day: card.billing_day || 15,
            due_day: card.due_day || 5,
            notes: card.notes || ''
        });
        setCardModalOpen(true);
    };

    const openAddEmiModal = () => {
        const firstCardId = data?.cards?.[0]?.id || '';
        setEmiForm({
            id: '',
            title: '',
            card_id: firstCardId,
            category: 'Electronics',
            total_principal: '',
            total_months: 12,
            interest_rate: 0,
            monthly_emi: '',
            start_month: selectedMonth,
            due_day: 5,
            processing_fee: 0,
            status: 'active',
            notes: ''
        });
        setEmiModalOpen(true);
    };

    const openEditEmiModal = (e) => {
        setEmiForm({
            id: e.id,
            title: e.title || '',
            card_id: e.card_id || '',
            category: e.category || 'Electronics',
            total_principal: e.total_principal || 0,
            total_months: e.total_months || 12,
            interest_rate: e.interest_rate || 0,
            monthly_emi: e.monthly_emi || 0,
            start_month: e.start_month || selectedMonth,
            due_day: e.due_day || 5,
            processing_fee: e.processing_fee || 0,
            status: e.status || 'active',
            notes: e.notes || ''
        });
        setEmiModalOpen(true);
    };

    const openAddFixedModal = () => {
        setFixedForm({
            id: '',
            title: '',
            category: 'Rent & Housing',
            amount: '',
            frequency: 'monthly',
            start_month: selectedMonth,
            payment_method: 'UPI / Bank Transfer',
            card_id: '',
            due_day: 5,
            auto_pay: false,
            notes: ''
        });
        setFixedModalOpen(true);
    };

    const openEditFixedModal = (f) => {
        setFixedForm({
            id: f.id,
            title: f.title || '',
            category: f.category || 'Rent & Housing',
            amount: f.amount || 0,
            frequency: f.frequency || 'monthly',
            start_month: f.start_month || '2026-01',
            payment_method: f.payment_method || 'UPI / Bank Transfer',
            card_id: f.card_id || '',
            due_day: f.due_day || 5,
            auto_pay: Boolean(f.auto_pay),
            notes: f.notes || ''
        });
        setFixedModalOpen(true);
    };

    const openAddSpendModal = (preselectedCardId = '') => {
        const todayStr = new Date().toISOString().slice(0, 10);
        setSpendForm({
            card_id: preselectedCardId || '',
            payment_method: preselectedCardId ? 'Credit Card' : 'UPI / Cash / Bank',
            title: '',
            amount: '',
            category: 'Shopping',
            month: selectedMonth,
            spend_date: todayStr.startsWith(selectedMonth) ? todayStr : `${selectedMonth}-10`
        });
        setSpendModalOpen(true);
    };

    const openAddIncomeModal = () => {
        const todayStr = new Date().toISOString().slice(0, 10);
        setIncomeForm({
            title: '',
            amount: '',
            category: 'Salary / Business',
            payment_mode: 'Bank / UPI',
            month: selectedMonth,
            income_date: todayStr.startsWith(selectedMonth) ? todayStr : `${selectedMonth}-01`,
            notes: ''
        });
        setIncomeModalOpen(true);
    };

    const openAddInvestmentModal = () => {
        const todayStr = new Date().toISOString().slice(0, 10);
        setInvestmentForm({
            id: '',
            title: '',
            asset_type: 'Mutual Fund / SIP',
            investment_mode: 'SIP (Monthly)',
            monthly_sip_amount: '',
            total_invested: '',
            current_value: '',
            expected_return_rate: 12,
            platform: '',
            sip_day: 5,
            start_date: todayStr,
            status: 'active',
            notes: ''
        });
        setInvestmentModalOpen(true);
    };

    const openEditInvestmentModal = (inv) => {
        setInvestmentForm({
            id: inv.id,
            title: inv.title || '',
            asset_type: inv.asset_type || 'Mutual Fund / SIP',
            investment_mode: inv.investment_mode || 'SIP (Monthly)',
            monthly_sip_amount: inv.monthly_sip_amount || 0,
            total_invested: inv.total_invested || 0,
            current_value: inv.current_value || inv.total_invested || 0,
            expected_return_rate: inv.expected_return_rate ?? 12,
            platform: inv.platform || '',
            sip_day: inv.sip_day || 5,
            start_date: inv.start_date || '',
            status: inv.status || 'active',
            notes: inv.notes || ''
        });
        setInvestmentModalOpen(true);
    };

    const openSettings = () => {
        const s = data?.settings || {};
        const code = s.currency_code || 'INR';
        const sym = s.currency_symbol || '₹';
        setSettingsForm({
            currencyPreset: `${code}|${sym}`,
            currency_symbol: sym,
            monthly_income: s.monthly_income || '150000',
            theme: s.theme || 'light'
        });
        setSettingsModalOpen(true);
    };

    // CRUD Handlers
    const handleSaveCard = async (ev) => {
        ev.preventDefault();
        try {
            if (cardForm.id) {
                await khataFetch(`/cards/${cardForm.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(cardForm)
                });
                showToastMsg('Card updated successfully!');
            } else {
                await khataFetch('/cards', {
                    method: 'POST',
                    body: JSON.stringify(cardForm)
                });
                showToastMsg('New card added!');
            }
            setCardModalOpen(false);
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error saving card: ' + err.message);
        }
    };

    const handleDeleteCard = async (id) => {
        if (!window.confirm('Delete this card? Linked EMIs and Fixed Bills will remain but become unlinked.')) return;
        try {
            await khataFetch(`/cards/${id}`, { method: 'DELETE' });
            showToastMsg('Card deleted');
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error deleting card: ' + err.message);
        }
    };

    const handleSaveEmi = async (ev) => {
        ev.preventDefault();
        try {
            const payload = {
                ...emiForm,
                card_id: emiForm.card_id || null
            };
            if (emiForm.id) {
                await khataFetch(`/emis/${emiForm.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                showToastMsg('EMI updated!');
            } else {
                await khataFetch('/emis', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                showToastMsg('New EMI added!');
            }
            setEmiModalOpen(false);
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error saving EMI: ' + err.message);
        }
    };

    const handleDeleteEmi = async (id) => {
        if (!window.confirm('Delete this EMI record?')) return;
        try {
            await khataFetch(`/emis/${id}`, { method: 'DELETE' });
            showToastMsg('EMI deleted');
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error deleting EMI: ' + err.message);
        }
    };

    const handleSaveFixed = async (ev) => {
        ev.preventDefault();
        try {
            const payload = {
                ...fixedForm,
                card_id: fixedForm.card_id || null,
                active: true
            };
            if (fixedForm.id) {
                await khataFetch(`/fixed/${fixedForm.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                showToastMsg('Fixed expense updated!');
            } else {
                await khataFetch('/fixed', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                showToastMsg('Fixed expense added!');
            }
            setFixedModalOpen(false);
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error saving fixed expense: ' + err.message);
        }
    };

    const handleDeleteFixed = async (id) => {
        if (!window.confirm('Delete this recurring fixed expense?')) return;
        try {
            await khataFetch(`/fixed/${id}`, { method: 'DELETE' });
            showToastMsg('Fixed expense deleted');
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error deleting fixed expense: ' + err.message);
        }
    };

    const handleSaveSpend = async (ev) => {
        ev.preventDefault();
        try {
            await khataFetch('/spends', {
                method: 'POST',
                body: JSON.stringify({
                    ...spendForm,
                    card_id: spendForm.card_id || null
                })
            });
            showToastMsg('One-time spend added!');
            setSpendModalOpen(false);
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error adding spend: ' + err.message);
        }
    };

    const handleDeleteSpend = async (id) => {
        try {
            await khataFetch(`/spends/${id}`, { method: 'DELETE' });
            showToastMsg('Spend removed');
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error removing spend: ' + err.message);
        }
    };

    const handleSaveIncome = async (ev) => {
        ev.preventDefault();
        try {
            await khataFetch('/incomes', {
                method: 'POST',
                body: JSON.stringify(incomeForm)
            });
            showToastMsg('Income added!');
            setIncomeModalOpen(false);
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error adding income: ' + err.message);
        }
    };

    const handleDeleteIncome = async (id) => {
        try {
            await khataFetch(`/incomes/${id}`, { method: 'DELETE' });
            showToastMsg('Income entry removed');
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error removing income: ' + err.message);
        }
    };

    const handleSaveInvestment = async (ev) => {
        ev.preventDefault();
        try {
            if (investmentForm.id) {
                await khataFetch(`/investments/${investmentForm.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(investmentForm)
                });
                showToastMsg('Investment updated!');
            } else {
                await khataFetch('/investments', {
                    method: 'POST',
                    body: JSON.stringify(investmentForm)
                });
                showToastMsg('New investment added to portfolio!');
            }
            setInvestmentModalOpen(false);
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error saving investment: ' + err.message);
        }
    };

    const handleDeleteInvestment = async (id) => {
        if (!window.confirm('Delete this investment from your portfolio?')) return;
        try {
            await khataFetch(`/investments/${id}`, { method: 'DELETE' });
            showToastMsg('Investment removed');
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error deleting investment: ' + err.message);
        }
    };

    const toggleChecklistPayment = async (itemType, itemId, isPaid, amount) => {
        try {
            await khataFetch('/payments/toggle', {
                method: 'POST',
                body: JSON.stringify({
                    month: selectedMonth,
                    item_type: itemType,
                    item_id: itemId,
                    is_paid: isPaid,
                    paid_amount: Number(amount) || 0
                })
            });
            showToastMsg(isPaid ? 'Marked as Paid! ✓' : 'Marked as Unpaid');
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error updating payment: ' + err.message);
        }
    };

    const payFullCardStatement = async (cardId, isPaid) => {
        try {
            await khataFetch('/payments/pay-card', {
                method: 'POST',
                body: JSON.stringify({
                    month: selectedMonth,
                    card_id: cardId,
                    is_paid: isPaid
                })
            });
            showToastMsg(isPaid ? 'Entire card statement marked as Paid! ✓' : 'Card statement marked as Unpaid');
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error updating card bill: ' + err.message);
        }
    };

    const handleSaveSettings = async (ev) => {
        ev.preventDefault();
        try {
            const [code] = (settingsForm.currencyPreset || 'INR|₹').split('|');
            await khataFetch('/settings', {
                method: 'POST',
                body: JSON.stringify({
                    currency_code: code || 'INR',
                    currency_symbol: settingsForm.currency_symbol || '₹',
                    monthly_income: settingsForm.monthly_income || '0',
                    theme: settingsForm.theme || 'light'
                })
            });
            showToastMsg('Settings saved to MongoDB!');
            setSettingsModalOpen(false);
            await loadDashboard();
        } catch (err) {
            showToastMsg('Error saving settings: ' + err.message);
        }
    };

    const exportMonthlyCsv = () => {
        if (!data?.checklist) return;
        const rows = [
            ['Month', 'Due Day', 'Type', 'Title', 'Card / Mode', 'Category', 'Amount', 'Status', 'Paid Date']
        ];
        for (const item of data.checklist) {
            rows.push([
                selectedMonth,
                item.due_day,
                item.item_type.toUpperCase(),
                `"${(item.title || '').replace(/"/g, '""')}"`,
                `"${(item.card_name || '').replace(/"/g, '""')}"`,
                `"${(item.category || '').replace(/"/g, '""')}"`,
                item.amount,
                item.is_paid ? 'PAID' : 'UNPAID',
                item.paid_date || ''
            ]);
        }
        const csvContent = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `CSCorp-KhataKit-Report-${selectedMonth}.csv`;
        a.click();
        showToastMsg('Monthly CSV report downloaded!');
    };

    const exportJsonBackup = async () => {
        try {
            const backup = await khataFetch('/backup/export');
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `CSCorp-KhataKit-Backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            showToastMsg('Full MongoDB backup downloaded!');
        } catch (err) {
            showToastMsg('Export failed: ' + err.message);
        }
    };

    const importJsonBackup = async (ev) => {
        const file = ev.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            await khataFetch('/backup/import', {
                method: 'POST',
                body: JSON.stringify(parsed)
            });
            showToastMsg('Backup restored to MongoDB successfully!');
            setSettingsModalOpen(false);
            await loadDashboard();
        } catch (err) {
            showToastMsg('Invalid backup file: ' + err.message);
        }
    };

    const clearAllData = async () => {
        if (!window.confirm('Are you sure you want to delete ALL cards, EMIs, and fixed expenses from your account?')) return;
        try {
            await khataFetch('/backup/clear-all', { method: 'POST' });
            showToastMsg('All KhataKit data cleared!');
            setSettingsModalOpen(false);
            await loadDashboard();
        } catch (err) {
            showToastMsg('Clear failed: ' + err.message);
        }
    };

    if (!isAuthenticated || !userKey) {
        return null;
    }

    if (loading && !data) {
        return (
            <div className="kk-master-container">
                <div className="kk-loading-box">
                    <div className="kk-spinner"></div>
                    <p>Loading CS Corp KhataKit Expense &amp; EMI Manager...</p>
                </div>
            </div>
        );
    }

    const summary = data?.summary || {
        total_monthly_outflow: 0,
        total_emi_outflow: 0,
        total_fixed_outflow: 0,
        total_variable_spends: 0,
        total_cards_statement: 0,
        total_paid: 0,
        total_unpaid: 0,
        paid_items_count: 0,
        total_items_count: 0,
        active_emis_count: 0,
        total_remaining_emi_debt: 0
    };
    const settings = data?.settings || {};
    const cards = data?.cards || [];
    const emis = data?.emis || [];
    const fixedExpenses = data?.fixed_expenses || [];
    const cardSpends = data?.card_spends || [];
    const incomes = data?.incomes || [];
    const investments = data?.investments || [];
    const checklist = data?.checklist || [];
    const projection = data?.projection || [];

    const totalOneTimeIncome = Number(summary.total_one_time_income) || incomes.reduce((s, x) => s + (Number(x.amount) || 0), 0);
    const income = (Number(settings.monthly_income) || 0) + totalOneTimeIncome;
    const incomePct = income > 0 ? Math.round((summary.total_monthly_outflow / income) * 100) : null;
    const paidPct = summary.total_monthly_outflow > 0
        ? Math.min(100, Math.round((summary.total_paid / (summary.total_paid + summary.total_unpaid || 1)) * 100))
        : 0;
    const unpaidCount = summary.total_items_count - summary.paid_items_count;

    // Donut chart data
    const catTotals = new Map();
    const addCat = (cat, amt) => {
        if (amt <= 0) return;
        catTotals.set(cat, (catTotals.get(cat) || 0) + amt);
    };
    emis.filter(x => x.is_due_this_month).forEach(e => addCat('Card & Loan EMIs', Number(e.paid_amount_this_month)));
    fixedExpenses.filter(x => x.is_due_this_month).forEach(f => addCat(f.category || 'Other Fixed', Number(f.paid_amount_this_month)));
    const spendSum = cardSpends.reduce((s, x) => s + Number(x.amount), 0);
    if (spendSum > 0) addCat('One-off Card Spends', spendSum);
    const donutEntries = [...catTotals.entries()].sort((a, b) => b[1] - a[1]);
    const donutTotal = donutEntries.reduce((s, e) => s + e[1], 0);
    const donutColors = ['#f97316', '#10b981', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6'];

    // Projection max
    const maxProjVal = Math.max(...projection.map(p => p.total), 1);

    // Filtered lists
    const filteredChecklist = checklist.filter(item => {
        if (checklistFilter === 'unpaid') return !item.is_paid;
        if (checklistFilter === 'paid') return item.is_paid;
        if (checklistFilter === 'emi') return item.item_type === 'emi';
        if (checklistFilter === 'fixed') return item.item_type === 'fixed';
        return true;
    });

    const filteredEmis = emis.filter(e => {
        if (emiCardFilter !== 'all') {
            if (emiCardFilter === 'none' && e.card_id !== null) return false;
            if (emiCardFilter !== 'none' && String(e.card_id) !== String(emiCardFilter)) return false;
        }
        if (emiStatusFilter === 'due' && !e.is_due_this_month) return false;
        if (emiStatusFilter === 'active' && e.status !== 'active') return false;
        if (emiStatusFilter === 'completed' && e.status === 'active' && e.installments_remaining > 0) return false;
        return true;
    });

    const filteredFixed = fixedExpenses.filter(f => {
        if (fixedCategoryFilter !== 'all' && f.category !== fixedCategoryFilter) return false;
        return true;
    });
    const totalMonthlyEquivalent = filteredFixed.reduce((s, f) => s + Number(f.monthly_equivalent || 0), 0);

    const filteredInvestments = investments.filter(inv => {
        if (investmentAssetFilter !== 'all' && inv.asset_type !== investmentAssetFilter) return false;
        return true;
    });

    // Asset allocation breakdown for Investments tab
    const assetBreakdownMap = new Map();
    investments.filter(i => i.status !== 'redeemed').forEach(inv => {
        const type = inv.asset_type || 'Other';
        assetBreakdownMap.set(type, (assetBreakdownMap.get(type) || 0) + (Number(inv.current_value) || Number(inv.total_invested) || 0));
    });
    const assetAllocationEntries = [...assetBreakdownMap.entries()].sort((a, b) => b[1] - a[1]);
    const totalPortfolioVal = Number(summary.total_portfolio_current_value) || assetAllocationEntries.reduce((s, e) => s + e[1], 0);
    const totalPortfolioInv = Number(summary.total_portfolio_invested) || investments.filter(i => i.status !== 'redeemed').reduce((s, i) => s + (Number(i.total_invested) || 0), 0);
    const totalPortfolioGain = totalPortfolioVal - totalPortfolioInv;
    const totalPortfolioGainPct = totalPortfolioInv > 0 ? Number(((totalPortfolioGain / totalPortfolioInv) * 100).toFixed(1)) : 0;
    const totalMonthlySip = Number(summary.total_monthly_sip) || investments.filter(i => i.status === 'active' && i.investment_mode === 'SIP (Monthly)').reduce((s, i) => s + (Number(i.monthly_sip_amount) || 0), 0);

    const emiCalcPreviewData = calculateEmiValues(emiForm.total_principal, emiForm.total_months, emiForm.interest_rate);
    const isDarkTheme = settings.theme === 'dark';

    return (
        <div className={`kk-master-container ${isDarkTheme ? 'kk-theme-dark' : 'kk-theme-light'}`}>
            {/* CS Corp Ambient Background Glow Mesh */}
            <div className="kk-ambient-mesh">
                <div className="kk-orb kk-orb-orange"></div>
                <div className="kk-orb kk-orb-amber"></div>
                <div className="kk-grid-overlay"></div>
            </div>

            {/* CS Corp Top Hero / Command Bar */}
            <header className="kk-topbar">
                <div className="kk-brand-block">
                    <div className="kk-brand-icon">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <div className="kk-status-pill">
                            <User size={11} />
                            <span>{userDisplayName}&apos;s KhataKit</span>
                        </div>
                        <h1 className="kk-brand-title">
                            Chaudhary <span className="kk-brand-accent">KhataKit</span>
                        </h1>
                        <p className="kk-brand-subtitle">
                            Personal Expense, Card EMI &amp; Monthly Bill Tracker
                        </p>
                    </div>
                    <button
                        type="button"
                        className="kk-icon-btn kk-mobile-settings-btn"
                        onClick={openSettings}
                        title="Settings, Currency & Backup"
                        aria-label="Settings"
                    >
                        <Settings size={17} />
                    </button>
                </div>

                {/* Month Navigator */}
                <div className="kk-month-navigator">
                    <button
                        type="button"
                        className="kk-icon-btn"
                        onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}
                        title="Previous Month"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <label className="kk-month-picker-wrap" title="Click to choose month">
                        <Calendar size={15} className="kk-cal-icon" />
                        <span className="kk-month-label">{formatMonthDisplay(selectedMonth)}</span>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
                            aria-label="Select Month"
                        />
                    </label>
                    <button
                        type="button"
                        className="kk-icon-btn"
                        onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
                        title="Next Month"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        type="button"
                        className="kk-btn kk-btn-ghost kk-btn-sm"
                        onClick={() => setSelectedMonth(getCurrentYearMonth())}
                        title="Jump to Current Month"
                    >
                        Current
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="kk-topbar-actions">
                    <button type="button" className="kk-btn kk-btn-primary" onClick={() => openAddSpendModal()}>
                        <Plus size={15} /> One-Time Spend
                    </button>
                    <button type="button" className="kk-btn kk-btn-emerald" onClick={openAddIncomeModal}>
                        <Plus size={15} /> One-Time Income
                    </button>
                    <button type="button" className="kk-btn kk-btn-secondary" onClick={openAddInvestmentModal}>
                        <TrendingUp size={15} /> + Investment
                    </button>
                    <button type="button" className="kk-btn kk-btn-secondary" onClick={openAddEmiModal}>
                        <Plus size={15} /> Add EMI
                    </button>
                    <button type="button" className="kk-btn kk-btn-secondary" onClick={openAddFixedModal}>
                        <Plus size={15} /> Fixed Expense
                    </button>
                    <button type="button" className="kk-btn kk-btn-secondary" onClick={openAddCardModal}>
                        <CreditCard size={15} /> Add Card
                    </button>
                </div>
            </header>

            {/* Navigation Tabs (Segmented Mobile-First Wrap) */}
            <div className="kk-segmented-tabs-wrap">
                <nav className="kk-nav-tabs" role="tablist">
                    <button
                        type="button"
                        className={`kk-nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <PieChart size={15} />
                        <span className="kk-tab-full">Overview &amp; Analytics</span>
                        <span className="kk-tab-short">Overview</span>
                    </button>
                    <button
                        type="button"
                        className={`kk-nav-tab ${activeTab === 'checklist' ? 'active' : ''}`}
                        onClick={() => setActiveTab('checklist')}
                    >
                        <CheckCircle2 size={15} />
                        <span className="kk-tab-full">Monthly Checklist</span>
                        <span className="kk-tab-short">Checklist</span>
                        <span className="kk-tab-badge">{unpaidCount}</span>
                    </button>
                    <button
                        type="button"
                        className={`kk-nav-tab ${activeTab === 'cards' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cards')}
                    >
                        <CreditCard size={15} />
                        <span className="kk-tab-full">Cards &amp; Statements</span>
                        <span className="kk-tab-short">Cards</span>
                        <span className="kk-tab-badge secondary">{cards.length}</span>
                    </button>
                    <button
                        type="button"
                        className={`kk-nav-tab ${activeTab === 'emis' ? 'active' : ''}`}
                        onClick={() => setActiveTab('emis')}
                    >
                        <Calendar size={15} />
                        <span className="kk-tab-full">EMI Tenure Tracker</span>
                        <span className="kk-tab-short">EMIs</span>
                        <span className="kk-tab-badge secondary">{summary.active_emis_count}</span>
                    </button>
                    <button
                        type="button"
                        className={`kk-nav-tab ${activeTab === 'fixed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('fixed')}
                    >
                        <Home size={15} />
                        <span className="kk-tab-full">Fixed Expenses (Rent, Insurance, Bills)</span>
                        <span className="kk-tab-short">Fixed</span>
                    </button>
                    <button
                        type="button"
                        className={`kk-nav-tab ${activeTab === 'investments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('investments')}
                    >
                        <TrendingUp size={15} />
                        <span className="kk-tab-full">Investments &amp; SIP Portfolio</span>
                        <span className="kk-tab-short">Investments</span>
                        <span className="kk-tab-badge secondary">{investments.length}</span>
                    </button>
                </nav>
            </div>

            {/* TAB 1: OVERVIEW & ANALYTICS */}
            {activeTab === 'dashboard' && (
                <div className="kk-tab-pane">
                    {/* KPI Summary Strip (Only shown in Overview & Analytics) */}
                    <section className="kk-kpi-grid">
                        <div className="kk-kpi-card" style={{ '--kpi-color': '#f97316' }}>
                            <div className="kk-kpi-top">
                                <span className="kk-kpi-label">Total Month Outflow</span>
                                {incomePct !== null && (
                                    <span className="kk-badge kk-badge-orange">{incomePct}% of Income</span>
                                )}
                            </div>
                            <div className="kk-kpi-value">{formatMoney(summary.total_monthly_outflow)}</div>
                            <div className="kk-kpi-sub">
                                <span>EMIs + Fixed + Spends</span>
                                {income > 0 && (
                                    <span>Left: <strong>{formatMoney(Math.max(0, income - summary.total_monthly_outflow))}</strong></span>
                                )}
                            </div>
                        </div>

                        <div className="kk-kpi-card" style={{ '--kpi-color': '#10b981', cursor: 'pointer' }} onClick={openAddIncomeModal}>
                            <div className="kk-kpi-top">
                                <span className="kk-kpi-label">Total Month Income</span>
                                <span className="kk-badge kk-badge-paid">+ Add Income</span>
                            </div>
                            <div className="kk-kpi-value">{formatMoney(income)}</div>
                            <div className="kk-kpi-sub">
                                <span>One-Time: {formatMoney(totalOneTimeIncome)}</span>
                                <span>Balance: <strong>{formatMoney(income - summary.total_monthly_outflow)}</strong></span>
                            </div>
                        </div>

                        <div className="kk-kpi-card" style={{ '--kpi-color': '#10b981' }}>
                            <div className="kk-kpi-top">
                                <span className="kk-kpi-label">Paid vs Remaining Dues</span>
                                <span className={`kk-badge ${summary.total_unpaid === 0 ? 'kk-badge-paid' : 'kk-badge-unpaid'}`}>
                                    {summary.paid_items_count}/{summary.total_items_count} Paid
                                </span>
                            </div>
                            <div className="kk-kpi-value">
                                {formatMoney(summary.total_unpaid)}{' '}
                                <small className="kk-kpi-unit">unpaid</small>
                            </div>
                            <div className="kk-progress-track">
                                <div className="kk-progress-fill" style={{ width: `${paidPct}%`, background: '#10b981' }}></div>
                            </div>
                            <div className="kk-kpi-sub">
                                <span>Paid: {formatMoney(summary.total_paid)}</span>
                                <span>{paidPct}% Done</span>
                            </div>
                        </div>

                        <div className="kk-kpi-card" style={{ '--kpi-color': '#ea580c' }}>
                            <div className="kk-kpi-top">
                                <span className="kk-kpi-label">Total Card Statements</span>
                                <span className="kk-badge kk-badge-orange">{cards.length} Cards</span>
                            </div>
                            <div className="kk-kpi-value">{formatMoney(summary.total_cards_statement)}</div>
                            <div className="kk-kpi-sub">
                                <span>Card EMIs + Bills + Spends</span>
                            </div>
                        </div>

                        <div className="kk-kpi-card" style={{ '--kpi-color': '#0284c7' }}>
                            <div className="kk-kpi-top">
                                <span className="kk-kpi-label">Monthly EMIs</span>
                                <span className="kk-badge kk-badge-nocost">{summary.active_emis_count} Active</span>
                            </div>
                            <div className="kk-kpi-value">{formatMoney(summary.total_emi_outflow)}</div>
                            <div className="kk-kpi-sub">
                                <span>Total EMI Debt Left: {formatMoney(summary.total_remaining_emi_debt)}</span>
                            </div>
                        </div>

                        <div className="kk-kpi-card" style={{ '--kpi-color': '#f59e0b' }}>
                            <div className="kk-kpi-top">
                                <span className="kk-kpi-label">Fixed Expenses Due</span>
                                <span className="kk-badge kk-badge-orange">Rent &amp; Insurance</span>
                            </div>
                            <div className="kk-kpi-value">{formatMoney(summary.total_fixed_outflow)}</div>
                            <div className="kk-kpi-sub">
                                <span>Recurring bills due in {formatMonthDisplay(selectedMonth, true)}</span>
                            </div>
                        </div>
                    </section>

                    <div className="kk-dashboard-charts-grid">
                        {/* Card-Wise Bill Breakdown */}
                        <div className="kk-panel">
                            <div className="kk-panel-header">
                                <div>
                                    <h2 className="kk-panel-title">💳 Card-Wise Bill Breakdown</h2>
                                    <p className="kk-panel-subtitle">EMIs + Card Fixed Bills + Monthly Spends per Card</p>
                                </div>
                                <button type="button" className="kk-btn kk-btn-ghost kk-btn-sm" onClick={() => setActiveTab('cards')}>
                                    View Statements &#8594;
                                </button>
                            </div>
                            <div className="kk-cards-mini-list">
                                {!cards.length ? (
                                    <p className="kk-text-muted">No cards added yet. Click &ldquo;+ Add Card&rdquo; to start tracking card-wise EMIs and statements.</p>
                                ) : (
                                    cards.map(c => {
                                        const utilColor = c.utilization_percent > 70 ? '#f43f5e' : (c.utilization_percent > 40 ? '#f59e0b' : '#10b981');
                                        return (
                                            <div key={c.id} className="kk-card-mini-item">
                                                <div className="kk-card-mini-top">
                                                    <div className="kk-card-mini-name">
                                                        <span className="kk-color-dot" style={{ background: c.color }}></span>
                                                        <span>
                                                            {c.name}{' '}
                                                            <small className="kk-muted-inline">••{c.last4}</small>
                                                        </span>
                                                        <span className={`kk-badge ${c.is_paid_this_month ? 'kk-badge-paid' : 'kk-badge-unpaid'}`}>
                                                            {c.is_paid_this_month ? '✓ Statement Paid' : `Due ${getOrdinal(c.due_day)}`}
                                                        </span>
                                                    </div>
                                                    <strong className="kk-mini-stmt-amt">{formatMoney(c.statement_total)}</strong>
                                                </div>
                                                <div className="kk-progress-track">
                                                    <div className="kk-progress-fill" style={{ width: `${c.utilization_percent}%`, background: utilColor }}></div>
                                                </div>
                                                <div className="kk-card-mini-meta">
                                                    <span>EMIs ({c.active_emis_count}): <strong>{formatMoney(c.emi_total)}</strong></span>
                                                    <span>Fixed Bills ({c.fixed_bills_count}): <strong>{formatMoney(c.fixed_total)}</strong></span>
                                                    <span>Spends ({c.spends_count}): <strong>{formatMoney(c.spend_total)}</strong></span>
                                                    <span style={{ marginLeft: 'auto' }}>
                                                        Limit Used: <strong>{c.utilization_percent}%</strong> of {formatMoney(c.credit_limit)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Expense Distribution Donut */}
                        <div className="kk-panel">
                            <div className="kk-panel-header">
                                <div>
                                    <h2 className="kk-panel-title">🍩 Monthly Outflow by Category</h2>
                                    <p className="kk-panel-subtitle">Where your money goes in {formatMonthDisplay(selectedMonth)}</p>
                                </div>
                            </div>
                            <div className="kk-donut-container">
                                {donutTotal <= 0 ? (
                                    <p className="kk-text-muted">No outflow recorded for this month.</p>
                                ) : (
                                    <>
                                        <svg width="176" height="176" viewBox="0 0 176 176">
                                            {(() => {
                                                let cumulativePct = 0;
                                                const radius = 66;
                                                const circumference = 2 * Math.PI * radius;
                                                return donutEntries.map(([cat, val], idx) => {
                                                    const pct = val / donutTotal;
                                                    const strokeDasharray = `${pct * circumference} ${circumference}`;
                                                    const strokeDashoffset = -cumulativePct * circumference;
                                                    cumulativePct += pct;
                                                    const color = donutColors[idx % donutColors.length];
                                                    return (
                                                        <circle
                                                            key={cat}
                                                            r={radius}
                                                            cx="88"
                                                            cy="88"
                                                            fill="transparent"
                                                            stroke={color}
                                                            strokeWidth="24"
                                                            strokeDasharray={strokeDasharray}
                                                            strokeDashoffset={strokeDashoffset}
                                                            transform="rotate(-90 88 88)"
                                                        />
                                                    );
                                                });
                                            })()}
                                            <text x="88" y="82" textAnchor="middle" fill="currentColor" fontSize="11" opacity="0.65">Total</text>
                                            <text x="88" y="101" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="800">{formatMoney(donutTotal)}</text>
                                        </svg>
                                        <div className="kk-donut-legend">
                                            {donutEntries.map(([cat, val], idx) => {
                                                const pct = Math.round((val / donutTotal) * 100);
                                                const color = donutColors[idx % donutColors.length];
                                                return (
                                                    <div key={cat} className="kk-legend-row">
                                                        <div className="kk-legend-label">
                                                            <span className="kk-color-dot" style={{ background: color }}></span>
                                                            <span>{cat}</span>
                                                        </div>
                                                        <div>
                                                            <strong>{formatMoney(val)}</strong>
                                                            <small className="kk-muted-inline" style={{ marginLeft: 6 }}>({pct}%)</small>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="kk-dashboard-bottom-grid">
                        {/* 6-Month Cashflow & EMI Drop-off Forecast */}
                        <div className="kk-panel">
                            <div className="kk-panel-header">
                                <div>
                                    <h2 className="kk-panel-title">📉 6-Month Outflow Forecast (EMI Drop-Off)</h2>
                                    <p className="kk-panel-subtitle">See how your monthly obligation decreases as EMIs finish</p>
                                </div>
                            </div>
                            <div className="kk-projection-chart">
                                {projection.map(p => {
                                    const emiH = Math.round((p.emi_total / maxProjVal) * 165);
                                    const fixH = Math.round((p.fixed_total / maxProjVal) * 165);
                                    const spdH = Math.round((p.spend_total / maxProjVal) * 165);
                                    return (
                                        <div
                                            key={p.month}
                                            className="kk-proj-col"
                                            title={`EMIs: ${formatMoney(p.emi_total)} | Fixed: ${formatMoney(p.fixed_total)} | Spends: ${formatMoney(p.spend_total)}`}
                                        >
                                            <div className="kk-proj-val">{formatMoney(p.total)}</div>
                                            <div className="kk-proj-bar-wrap">
                                                <div className="kk-proj-seg-emi" style={{ height: `${emiH}px` }}></div>
                                                <div className="kk-proj-seg-fixed" style={{ height: `${fixH}px` }}></div>
                                                <div className="kk-proj-seg-spend" style={{ height: `${spdH}px` }}></div>
                                            </div>
                                            <div className="kk-proj-month">{formatMonthDisplay(p.month, true)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="kk-proj-legend">
                                <span><i className="kk-dot" style={{ background: '#f97316' }}></i> EMIs</span>
                                <span><i className="kk-dot" style={{ background: '#10b981' }}></i> Fixed Expenses</span>
                                <span><i className="kk-dot" style={{ background: '#0284c7' }}></i> Card Spends</span>
                            </div>
                        </div>

                        {/* One-Time Spends & One-Time Incomes This Month */}
                        <div className="kk-panel">
                            <div className="kk-panel-header">
                                <div>
                                    <h2 className="kk-panel-title">💸 One-Time Spends ({formatMonthDisplay(selectedMonth, true)})</h2>
                                    <p className="kk-panel-subtitle">All non-EMI spends via UPI, Cash, Bank, or Credit Card</p>
                                </div>
                                <button type="button" className="kk-btn kk-btn-primary kk-btn-sm" onClick={() => openAddSpendModal()}>
                                    + Add Spend
                                </button>
                            </div>
                            <div className="kk-quick-checklist">
                                {!cardSpends.length ? (
                                    <p className="kk-text-muted">No one-time spends logged for {formatMonthDisplay(selectedMonth)}.</p>
                                ) : (
                                    cardSpends.map(sp => (
                                        <div key={sp.id} className="kk-quick-item">
                                            <div className="kk-quick-item-left">
                                                <span className="kk-color-dot" style={{ background: sp.card_color || '#f97316' }}></span>
                                                <div>
                                                    <div className="kk-quick-item-title">{sp.title}</div>
                                                    <div className="kk-quick-item-sub">
                                                        {sp.category} • {sp.card_name || sp.payment_method || 'UPI / Cash'} • {sp.spend_date}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="kk-quick-item-right">
                                                <strong>{formatMoney(sp.amount)}</strong>
                                                <button
                                                    type="button"
                                                    className="kk-btn kk-btn-danger-ghost kk-btn-sm"
                                                    onClick={() => handleDeleteSpend(sp.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="kk-panel">
                            <div className="kk-panel-header">
                                <div>
                                    <h2 className="kk-panel-title">💰 One-Time Incomes ({formatMonthDisplay(selectedMonth, true)})</h2>
                                    <p className="kk-panel-subtitle">Salary, freelance, bonus, refund, or other income received</p>
                                </div>
                                <button type="button" className="kk-btn kk-btn-emerald kk-btn-sm" onClick={openAddIncomeModal}>
                                    + Add Income
                                </button>
                            </div>
                            <div className="kk-quick-checklist">
                                {!incomes.length ? (
                                    <p className="kk-text-muted">No one-time income entries logged for {formatMonthDisplay(selectedMonth)}.</p>
                                ) : (
                                    incomes.map(inc => (
                                        <div key={inc.id} className="kk-quick-item">
                                            <div className="kk-quick-item-left">
                                                <span className="kk-color-dot" style={{ background: '#10b981' }}></span>
                                                <div>
                                                    <div className="kk-quick-item-title">{inc.title}</div>
                                                    <div className="kk-quick-item-sub">
                                                        {inc.category} • {inc.payment_mode || 'Bank / UPI'} • {inc.income_date}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="kk-quick-item-right">
                                                <strong style={{ color: '#059669' }}>+{formatMoney(inc.amount)}</strong>
                                                <button
                                                    type="button"
                                                    className="kk-btn kk-btn-danger-ghost kk-btn-sm"
                                                    onClick={() => handleDeleteIncome(inc.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Actionable Dues This Month */}
                        <div className="kk-panel">
                            <div className="kk-panel-header">
                                <div>
                                    <h2 className="kk-panel-title">⚡ Actionable Dues This Month</h2>
                                    <p className="kk-panel-subtitle">Mark Rent, Insurance, or Card EMIs paid in one click</p>
                                </div>
                                <button type="button" className="kk-btn kk-btn-ghost kk-btn-sm" onClick={() => setActiveTab('checklist')}>
                                    Full Checklist &#8594;
                                </button>
                            </div>
                            <div className="kk-quick-checklist">
                                {!checklist.length ? (
                                    <p className="kk-text-muted">No items due in {formatMonthDisplay(selectedMonth)}.</p>
                                ) : (
                                    [...checklist]
                                        .sort((a, b) => (a.is_paid === b.is_paid ? a.due_day - b.due_day : (a.is_paid ? 1 : -1)))
                                        .map(item => (
                                            <div key={item.uid} className={`kk-quick-item ${item.is_paid ? 'paid' : ''}`}>
                                                <div className="kk-quick-item-left">
                                                    <span className="kk-color-dot" style={{ background: item.card_color }}></span>
                                                    <div>
                                                        <div className="kk-quick-item-title">{item.title}</div>
                                                        <div className="kk-quick-item-sub">
                                                            Due {getOrdinal(item.due_day)} • {item.subtitle}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="kk-quick-item-right">
                                                    <strong>{formatMoney(item.amount)}</strong>
                                                    <button
                                                        type="button"
                                                        className={`kk-btn kk-btn-sm ${item.is_paid ? 'kk-btn-secondary' : 'kk-btn-emerald'}`}
                                                        onClick={() => toggleChecklistPayment(item.item_type, item.item_id, !item.is_paid, item.amount)}
                                                    >
                                                        {item.is_paid ? '✓ Paid' : 'Mark Paid'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: MONTHLY CHECKLIST */}
            {activeTab === 'checklist' && (
                <div className="kk-tab-pane">
                    <div className="kk-panel">
                        <div className="kk-panel-header wrap-gap">
                            <div>
                                <h2 className="kk-panel-title">✅ Monthly Payment Checklist — {formatMonthDisplay(selectedMonth)}</h2>
                                <p className="kk-panel-subtitle">Track every EMI, Room Rent, Insurance Premium &amp; Utility Bill due this month</p>
                            </div>
                            <div className="kk-filter-pills">
                                {[
                                    { id: 'all', label: 'All Items' },
                                    { id: 'unpaid', label: 'Unpaid' },
                                    { id: 'paid', label: 'Paid' },
                                    { id: 'emi', label: 'EMIs Only' },
                                    { id: 'fixed', label: 'Fixed Bills (Rent/Insurance)' }
                                ].map(pill => (
                                    <button
                                        key={pill.id}
                                        type="button"
                                        className={`kk-pill ${checklistFilter === pill.id ? 'active' : ''}`}
                                        onClick={() => setChecklistFilter(pill.id)}
                                    >
                                        {pill.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="kk-item-cards-list">
                            {!filteredChecklist.length ? (
                                <p className="kk-text-muted" style={{ padding: '16px 0' }}>
                                    No matching checklist items for this filter in {formatMonthDisplay(selectedMonth)}.
                                </p>
                            ) : (
                                filteredChecklist.map(item => {
                                    const key = `${item.item_type}:${item.item_id}`;
                                    const currentAmt = inlineAmounts[key] !== undefined ? inlineAmounts[key] : item.amount;
                                    return (
                                        <div key={item.uid} className={`kk-item-card ${item.is_paid ? 'is-paid' : ''}`}>
                                            <div className="kk-item-main">
                                                <div className="kk-item-badges-row">
                                                    <span className="kk-badge kk-badge-orange">Due {getOrdinal(item.due_day)}</span>
                                                    <span className="kk-badge kk-badge-nocost">{item.category}</span>
                                                    {item.auto_pay && (
                                                        <span className="kk-badge kk-badge-orange">Auto-Pay</span>
                                                    )}
                                                    {item.is_paid ? (
                                                        <span className="kk-badge kk-badge-paid">
                                                            ✓ Paid {item.paid_date ? `(${item.paid_date})` : ''}
                                                        </span>
                                                    ) : (
                                                        <span className="kk-badge kk-badge-unpaid">⏳ Pending</span>
                                                    )}
                                                </div>
                                                <h3 className="kk-item-title">{item.title}</h3>
                                                <div className="kk-item-meta-line">
                                                    <span className="kk-inline-card">
                                                        <span className="kk-color-dot" style={{ background: item.card_color }}></span>
                                                        <strong>{item.card_name}</strong>
                                                    </span>
                                                    <span>•</span>
                                                    <span>{item.subtitle}</span>
                                                </div>
                                            </div>
                                            <div className="kk-item-actions">
                                                <div className="kk-amount-edit-wrap">
                                                    <span className="kk-curr-prefix">{settings.currency_symbol || '₹'}</span>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="kk-inline-amount-input"
                                                        value={currentAmt}
                                                        onChange={(e) => setInlineAmounts({ ...inlineAmounts, [key]: e.target.value })}
                                                        onBlur={(e) => {
                                                            const val = Number(e.target.value) || 0;
                                                            if (val !== Number(item.amount)) {
                                                                toggleChecklistPayment(item.item_type, item.item_id, item.is_paid, val);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    className={`kk-btn ${item.is_paid ? 'kk-btn-secondary' : 'kk-btn-emerald'}`}
                                                    onClick={() => toggleChecklistPayment(item.item_type, item.item_id, !item.is_paid, currentAmt)}
                                                >
                                                    {item.is_paid ? 'Undo Paid' : '✓ Mark Paid'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: CARDS & STATEMENTS */}
            {activeTab === 'cards' && (
                <div className="kk-tab-pane">
                    <div className="kk-section-toolbar">
                        <div>
                            <h2 className="kk-section-heading">💳 Credit &amp; EMI Cards — Statement Wise View</h2>
                            <p className="kk-section-subheading">
                                Each card automatically sums its active EMIs, card-linked Fixed Bills (like Insurance), and monthly spends.
                            </p>
                        </div>
                        <div className="kk-toolbar-btns">
                            <button type="button" className="kk-btn kk-btn-secondary" onClick={() => openAddSpendModal()}>
                                + Log Card Spend
                            </button>
                            <button type="button" className="kk-btn kk-btn-primary" onClick={openAddCardModal}>
                                + Add New Card
                            </button>
                        </div>
                    </div>

                    {!cards.length ? (
                        <div className="kk-panel">
                            <p className="kk-text-muted">No cards configured yet. Click &ldquo;+ Add New Card&rdquo; to add your Credit or EMI cards.</p>
                        </div>
                    ) : (
                        <div className="kk-cards-statement-grid">
                            {cards.map(card => (
                                <div key={card.id} className="kk-statement-card-box">
                                    <div className="kk-credit-card-visual" style={{ '--card-accent': card.color || '#f97316' }}>
                                        <div className="kk-cc-top">
                                            <div>
                                                <div className="kk-cc-bank">{card.bank || card.card_type}</div>
                                                <div className="kk-cc-name">{card.name}</div>
                                            </div>
                                            <div className="kk-cc-number">•••• {card.last4 || '0000'}</div>
                                        </div>

                                        <div className="kk-cc-middle">
                                            <div>
                                                <div className="kk-cc-bill-label">{formatMonthDisplay(selectedMonth, true)} Statement Total</div>
                                                <div className="kk-cc-bill-amount">{formatMoney(card.statement_total)}</div>
                                            </div>
                                            <div className="kk-cc-dates">
                                                <div>Statement: <strong>{getOrdinal(card.billing_day)}</strong></div>
                                                <div>Payment Due: <strong>{getOrdinal(card.due_day)}</strong></div>
                                            </div>
                                        </div>

                                        <div className="kk-cc-utilization">
                                            <div className="kk-cc-util-row">
                                                <span>Credit Limit Used (incl. Locked EMI Principal)</span>
                                                <strong>{card.utilization_percent}% ({formatMoney(card.total_utilized)} / {formatMoney(card.credit_limit)})</strong>
                                            </div>
                                            <div className="kk-progress-track" style={{ background: 'rgba(255,255,255,0.22)', margin: '4px 0 0' }}>
                                                <div className="kk-progress-fill" style={{ width: `${card.utilization_percent}%`, background: '#fff' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="kk-statement-body">
                                        <div className="kk-stmt-pills-row">
                                            <div className="kk-stmt-mini-box">
                                                <span>EMIs ({card.active_emis_count})</span>
                                                <strong>{formatMoney(card.emi_total)}</strong>
                                            </div>
                                            <div className="kk-stmt-mini-box">
                                                <span>Fixed Bills ({card.fixed_bills_count})</span>
                                                <strong>{formatMoney(card.fixed_total)}</strong>
                                            </div>
                                            <div className="kk-stmt-mini-box">
                                                <span>Spends ({card.spends_count})</span>
                                                <strong>{formatMoney(card.spend_total)}</strong>
                                            </div>
                                        </div>

                                        {card.emis?.length > 0 && (
                                            <div>
                                                <div className="kk-stmt-section-title">📅 Active EMIs on this Card</div>
                                                <div className="kk-stmt-items-list">
                                                    {card.emis.map(e => (
                                                        <div key={e.id} className="kk-stmt-line-item">
                                                            <div>
                                                                <strong>{e.title}</strong>
                                                                <span className="kk-badge kk-badge-orange" style={{ marginLeft: 6 }}>
                                                                    {e.installment_number}/{e.total_months}
                                                                </span>
                                                                <div className="kk-subtext">
                                                                    Ends {formatMonthDisplay(e.end_month, true)} • Left: {formatMoney(e.amount_remaining)}
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <strong>{formatMoney(e.paid_amount_this_month)}</strong>
                                                                <div>
                                                                    <span
                                                                        className={`kk-badge ${e.is_paid_this_month ? 'kk-badge-paid' : 'kk-badge-unpaid'}`}
                                                                        style={{ cursor: 'pointer' }}
                                                                        onClick={() => toggleChecklistPayment('emi', e.id, !e.is_paid_this_month, e.paid_amount_this_month)}
                                                                    >
                                                                        {e.is_paid_this_month ? '✓ Paid' : 'Mark Paid'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {card.fixed_bills?.length > 0 && (
                                            <div>
                                                <div className="kk-stmt-section-title">🛡️ Fixed Bills Charged to Card</div>
                                                <div className="kk-stmt-items-list">
                                                    {card.fixed_bills.map(f => (
                                                        <div key={f.id} className="kk-stmt-line-item">
                                                            <div>
                                                                <strong>{f.title}</strong>
                                                                <span className="kk-badge kk-badge-nocost" style={{ marginLeft: 6 }}>{f.category}</span>
                                                                <div className="kk-subtext">{f.frequency} bill on card</div>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <strong>{formatMoney(f.paid_amount_this_month)}</strong>
                                                                <div>
                                                                    <span
                                                                        className={`kk-badge ${f.is_paid_this_month ? 'kk-badge-paid' : 'kk-badge-unpaid'}`}
                                                                        style={{ cursor: 'pointer' }}
                                                                        onClick={() => toggleChecklistPayment('fixed', f.id, !f.is_paid_this_month, f.paid_amount_this_month)}
                                                                    >
                                                                        {f.is_paid_this_month ? '✓ Paid' : 'Mark Paid'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {card.spends?.length > 0 && (
                                            <div>
                                                <div className="kk-stmt-section-title">🛍️ One-Off Spends ({formatMonthDisplay(selectedMonth, true)})</div>
                                                <div className="kk-stmt-items-list">
                                                    {card.spends.map(sp => (
                                                        <div key={sp.id} className="kk-stmt-line-item">
                                                            <div>
                                                                <strong>{sp.title}</strong>
                                                                <div className="kk-subtext">{sp.category} • {sp.spend_date}</div>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <strong>{formatMoney(sp.amount)}</strong>
                                                                <button
                                                                    type="button"
                                                                    className="kk-icon-btn kk-icon-btn-sm"
                                                                    title="Delete Spend"
                                                                    onClick={() => handleDeleteSpend(sp.id)}
                                                                >
                                                                    &times;
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {!card.has_items && (
                                            <p className="kk-text-muted" style={{ margin: 'auto 0', textAlign: 'center' }}>
                                                No EMIs, bills, or spends on this card for {formatMonthDisplay(selectedMonth, true)}.
                                            </p>
                                        )}
                                    </div>

                                    <div className="kk-statement-footer">
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button type="button" className="kk-btn kk-btn-ghost kk-btn-sm" onClick={() => openEditCardModal(card)}>
                                                Edit Card
                                            </button>
                                            <button type="button" className="kk-btn kk-btn-ghost kk-btn-sm" onClick={() => openAddSpendModal(card.id)}>
                                                + Spend
                                            </button>
                                            <button type="button" className="kk-btn kk-btn-danger-ghost kk-btn-sm" onClick={() => handleDeleteCard(card.id)}>
                                                Delete
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            className={`kk-btn kk-btn-sm ${card.is_paid_this_month ? 'kk-btn-secondary' : 'kk-btn-emerald'}`}
                                            onClick={() => payFullCardStatement(card.id, !card.is_paid_this_month)}
                                        >
                                            {card.is_paid_this_month ? '✓ Full Bill Paid (Undo)' : 'Pay Full Card Bill'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 4: EMI TENURE TRACKER */}
            {activeTab === 'emis' && (
                <div className="kk-tab-pane">
                    <div className="kk-panel">
                        <div className="kk-panel-header wrap-gap">
                            <div>
                                <h2 className="kk-panel-title">📅 EMI Portfolio &amp; Tenure Tracker</h2>
                                <p className="kk-panel-subtitle">Track installment progress (e.g. 6/12 paid), remaining principal, and completion month</p>
                            </div>
                            <div className="kk-toolbar-filters">
                                <select
                                    className="kk-input-select"
                                    value={emiCardFilter}
                                    onChange={(e) => setEmiCardFilter(e.target.value)}
                                >
                                    <option value="all">All Cards &amp; Loans</option>
                                    {cards.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                    <option value="none">Direct Bank Loans</option>
                                </select>
                                <select
                                    className="kk-input-select"
                                    value={emiStatusFilter}
                                    onChange={(e) => setEmiStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="due">Due This Month</option>
                                    <option value="active">Active EMIs</option>
                                    <option value="completed">Completed / Foreclosed</option>
                                </select>
                                <button type="button" className="kk-btn kk-btn-primary" onClick={openAddEmiModal}>
                                    + Add New EMI
                                </button>
                            </div>
                        </div>

                        <div className="kk-item-cards-list">
                            {!filteredEmis.length ? (
                                <p className="kk-text-muted" style={{ padding: '16px 0' }}>No EMIs match the selected filters.</p>
                            ) : (
                                filteredEmis.map(e => {
                                    const completedCount = e.completed_installments ?? e.installments_completed ?? 0;
                                    const remainingCount = e.remaining_installments ?? e.installments_remaining ?? 0;
                                    return (
                                        <div key={e.id} className="kk-item-card">
                                            <div className="kk-item-main">
                                                <div className="kk-item-badges-row">
                                                    <span className="kk-badge kk-badge-orange">{e.category}</span>
                                                    {Number(e.interest_rate) === 0 ? (
                                                        <span className="kk-badge kk-badge-nocost">No-Cost 0%</span>
                                                    ) : (
                                                        <span className="kk-badge kk-badge-nocost">{e.interest_rate}% p.a.</span>
                                                    )}
                                                    {e.is_due_this_month ? (
                                                        <span className={`kk-badge ${e.is_paid_this_month ? 'kk-badge-paid' : 'kk-badge-unpaid'}`}>
                                                            {e.is_paid_this_month ? '✓ Paid This Month' : `Inst #${e.installment_number} Due`}
                                                        </span>
                                                    ) : (
                                                        <span className="kk-badge kk-badge-orange">
                                                            {remainingCount === 0 ? 'Completed' : `Not Due in ${formatMonthDisplay(selectedMonth, true)}`}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="kk-item-title">{e.title}</h3>
                                                <div className="kk-item-meta-line">
                                                    <span className="kk-inline-card">
                                                        <span className="kk-color-dot" style={{ background: e.card_color }}></span>
                                                        <strong>{e.card_name}</strong>
                                                    </span>
                                                    <span>•</span>
                                                    <span>Due {getOrdinal(e.effective_due_day)}</span>
                                                    <span>•</span>
                                                    <span>Principal: {formatMoney(e.total_principal)}</span>
                                                </div>
                                                <div className="kk-emi-progress-block">
                                                    <div className="kk-emi-progress-labels">
                                                        <span>{completedCount} of {e.total_months} Installments Paid ({e.progress_percent}%)</span>
                                                        <span>Left: <strong>{formatMoney(e.amount_remaining)}</strong> ({remainingCount} mo)</span>
                                                    </div>
                                                    <div className="kk-progress-track">
                                                        <div className="kk-progress-fill" style={{ width: `${e.progress_percent}%`, background: '#f97316' }}></div>
                                                    </div>
                                                    <div className="kk-subtext">
                                                        Tenure: {formatMonthDisplay(e.start_month, true)} &#8594; {formatMonthDisplay(e.end_month, true)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="kk-item-actions">
                                                <div className="kk-item-price-tag">
                                                    <strong>{formatMoney(e.monthly_emi)}</strong>
                                                    <small>/month</small>
                                                </div>
                                                <div className="kk-action-btn-pair">
                                                    <button type="button" className="kk-btn kk-btn-secondary kk-btn-sm" onClick={() => openEditEmiModal(e)}>
                                                        Edit
                                                    </button>
                                                    <button type="button" className="kk-btn kk-btn-danger-ghost kk-btn-sm" onClick={() => handleDeleteEmi(e.id)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: FIXED EXPENSES */}
            {activeTab === 'fixed' && (
                <div className="kk-tab-pane">
                    <div className="kk-panel">
                        <div className="kk-panel-header wrap-gap">
                            <div>
                                <h2 className="kk-panel-title">🏠 Recurring Fixed Expenses (Room Rent, Insurance, Bills)</h2>
                                <p className="kk-panel-subtitle">
                                    Supports Monthly, Quarterly, Half-Yearly &amp; Yearly premiums with monthly set-aside calculation
                                </p>
                            </div>
                            <div className="kk-toolbar-filters">
                                <select
                                    className="kk-input-select"
                                    value={fixedCategoryFilter}
                                    onChange={(e) => setFixedCategoryFilter(e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    <option value="Rent & Housing">Rent &amp; Housing</option>
                                    <option value="Insurance Premium">Insurance Premium</option>
                                    <option value="Utilities & Bills">Utilities &amp; Bills</option>
                                    <option value="Domestic Help">Domestic Help</option>
                                    <option value="Subscriptions">Subscriptions</option>
                                    <option value="Investments / SIP">Investments / SIP</option>
                                    <option value="Education / Kids">Education &amp; Tuition</option>
                                    <option value="Other">Other</option>
                                </select>
                                <button type="button" className="kk-btn kk-btn-emerald" onClick={openAddFixedModal}>
                                    + Add Fixed Expense
                                </button>
                            </div>
                        </div>

                        <div className="kk-burn-rate-banner">
                            True Monthly Burn Rate (including quarterly/annual insurance set-aside):{' '}
                            <strong>{formatMoney(totalMonthlyEquivalent)} / month</strong>
                        </div>

                        <div className="kk-item-cards-list">
                            {!filteredFixed.length ? (
                                <p className="kk-text-muted" style={{ padding: '16px 0' }}>No fixed expenses found for this category.</p>
                            ) : (
                                filteredFixed.map(f => (
                                    <div key={f.id} className="kk-item-card">
                                        <div className="kk-item-main">
                                            <div className="kk-item-badges-row">
                                                <span className="kk-badge kk-badge-orange">{f.category}</span>
                                                <span className="kk-badge kk-badge-nocost">{f.frequency}</span>
                                                <span className="kk-badge kk-badge-orange">Due {getOrdinal(f.effective_due_day)}</span>
                                                {f.auto_pay && (
                                                    <span className="kk-badge kk-badge-paid">Auto-Pay</span>
                                                )}
                                            </div>
                                            <h3 className="kk-item-title">{f.title}</h3>
                                            <div className="kk-item-meta-line">
                                                {f.card_name ? (
                                                    <span className="kk-inline-card">
                                                        <span className="kk-color-dot" style={{ background: f.card_color }}></span>
                                                        Credit Card: <strong>{f.card_name}</strong>
                                                    </span>
                                                ) : (
                                                    <span>{f.payment_method}</span>
                                                )}
                                                <span>•</span>
                                                <span>Monthly Burn: <strong>{formatMoney(f.monthly_equivalent)}/mo</strong></span>
                                                {f.notes && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{f.notes}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="kk-item-actions">
                                            <div className="kk-item-price-tag">
                                                <strong>{formatMoney(f.amount)}</strong>
                                                <small>/{f.frequency}</small>
                                            </div>
                                            <div className="kk-action-btn-pair">
                                                {f.is_due_this_month && (
                                                    <button
                                                        type="button"
                                                        className={`kk-btn kk-btn-sm ${f.is_paid_this_month ? 'kk-btn-secondary' : 'kk-btn-emerald'}`}
                                                        onClick={() => toggleChecklistPayment('fixed', f.id, !f.is_paid_this_month, f.paid_amount_this_month)}
                                                    >
                                                        {f.is_paid_this_month ? '✓ Paid' : 'Mark Paid'}
                                                    </button>
                                                )}
                                                <button type="button" className="kk-btn kk-btn-secondary kk-btn-sm" onClick={() => openEditFixedModal(f)}>
                                                    Edit
                                                </button>
                                                <button type="button" className="kk-btn kk-btn-danger-ghost kk-btn-sm" onClick={() => handleDeleteFixed(f.id)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 6: INVESTMENTS & SIP PORTFOLIO DASHBOARD */}
            {activeTab === 'investments' && (
                <div className="kk-tab-pane">
                    {/* Investment Portfolio Summary Strip */}
                    <div className="kk-kpi-grid" style={{ marginBottom: 14 }}>
                        <div className="kk-kpi-card" style={{ '--kpi-color': '#0284c7', gridColumn: 'span 1' }}>
                            <div className="kk-kpi-top">
                                <span className="kk-kpi-label">Total Invested</span>
                                <span className="kk-badge kk-badge-nocost">{investments.length} Assets</span>
                            </div>
                            <div className="kk-kpi-value">{formatMoney(totalPortfolioInv)}</div>
                            <div className="kk-kpi-sub">
                                <span>Principal Capital Deployed</span>
                            </div>
                        </div>

                        <div className="kk-kpi-card" style={{ '--kpi-color': '#10b981' }}>
                            <div className="kk-kpi-top">
                                <span className="kk-kpi-label">Current Portfolio Value</span>
                                <TrendingUp size={15} style={{ color: '#10b981' }} />
                            </div>
                            <div className="kk-kpi-value">{formatMoney(totalPortfolioVal)}</div>
                            <div className="kk-kpi-sub">
                                <span>Live / Estimated Value</span>
                            </div>
                        </div>

                        <div className="kk-kpi-card" style={{ '--kpi-color': totalPortfolioGain >= 0 ? '#10b981' : '#f43f5e' }}>
                            <div className="kk-kpi-top">
                                <span className="kk-kpi-label">Total Profit / Returns</span>
                                <span className={`kk-badge ${totalPortfolioGain >= 0 ? 'kk-badge-paid' : 'kk-badge-unpaid'}`}>
                                    {totalPortfolioGain >= 0 ? '+' : ''}{totalPortfolioGainPct}%
                                </span>
                            </div>
                            <div className="kk-kpi-value" style={{ color: totalPortfolioGain >= 0 ? '#059669' : '#e11d48' }}>
                                {totalPortfolioGain >= 0 ? '+' : ''}{formatMoney(totalPortfolioGain)}
                            </div>
                            <div className="kk-kpi-sub">
                                <span>Net Unrealized Gain</span>
                            </div>
                        </div>

                        <div className="kk-kpi-card" style={{ '--kpi-color': '#f97316' }}>
                            <div className="kk-kpi-top">
                                <span className="kk-kpi-label">Monthly SIP Commitment</span>
                                <span className="kk-badge kk-badge-orange">Active SIPs</span>
                            </div>
                            <div className="kk-kpi-value">{formatMoney(totalMonthlySip)}</div>
                            <div className="kk-kpi-sub">
                                <span>Auto-invested per month</span>
                            </div>
                        </div>
                    </div>

                    {/* Asset Allocation Breakdown Panel */}
                    {assetAllocationEntries.length > 0 && (
                        <div className="kk-panel" style={{ marginBottom: 14 }}>
                            <div className="kk-panel-header">
                                <div>
                                    <h2 className="kk-panel-title">📊 Asset Allocation Breakdown</h2>
                                    <p className="kk-panel-subtitle">Distribution of your portfolio across Mutual Funds, Stocks, FD, PPF &amp; Gold</p>
                                </div>
                            </div>
                            <div className="kk-donut-legend">
                                {assetAllocationEntries.map(([assetType, val], idx) => {
                                    const pct = totalPortfolioVal > 0 ? Math.round((val / totalPortfolioVal) * 100) : 0;
                                    const color = donutColors[idx % donutColors.length];
                                    return (
                                        <div key={assetType} className="kk-card-mini-item">
                                            <div className="kk-card-mini-top" style={{ marginBottom: 4 }}>
                                                <div className="kk-card-mini-name">
                                                    <span className="kk-color-dot" style={{ background: color }}></span>
                                                    <span>{assetType}</span>
                                                </div>
                                                <strong>{formatMoney(val)} ({pct}%)</strong>
                                            </div>
                                            <div className="kk-progress-track" style={{ margin: 0 }}>
                                                <div className="kk-progress-fill" style={{ width: `${pct}%`, background: color }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Investments Portfolio List Panel */}
                    <div className="kk-panel">
                        <div className="kk-panel-header wrap-gap">
                            <div>
                                <h2 className="kk-panel-title">📈 My Investments &amp; SIP Portfolio</h2>
                                <p className="kk-panel-subtitle">
                                    Track Mutual Fund SIPs, Stocks, Fixed Deposits (FD), PPF/NPS, and Gold investments
                                </p>
                            </div>
                            <div className="kk-toolbar-filters">
                                <select
                                    className="kk-input-select"
                                    value={investmentAssetFilter}
                                    onChange={(e) => setInvestmentAssetFilter(e.target.value)}
                                >
                                    <option value="all">All Asset Types</option>
                                    <option value="Mutual Fund / SIP">Mutual Fund / SIP</option>
                                    <option value="Stocks / Equity">Stocks / Equity</option>
                                    <option value="Fixed Deposit (FD)">Fixed Deposit (FD)</option>
                                    <option value="PPF / EPF / NPS">PPF / EPF / NPS</option>
                                    <option value="Gold / Silver">Gold / Silver</option>
                                    <option value="Real Estate / Crypto">Real Estate / Crypto</option>
                                    <option value="Other">Other</option>
                                </select>
                                <button type="button" className="kk-btn kk-btn-primary" onClick={openAddInvestmentModal}>
                                    + Add Investment / SIP
                                </button>
                            </div>
                        </div>

                        <div className="kk-item-cards-list">
                            {!filteredInvestments.length ? (
                                <p className="kk-text-muted" style={{ padding: '16px 0' }}>
                                    No investments added yet. Click &ldquo;+ Add Investment / SIP&rdquo; to track your Mutual Funds, Stocks, FD, or PPF.
                                </p>
                            ) : (
                                filteredInvestments.map(inv => {
                                    const isPositive = (inv.gain_amount || 0) >= 0;
                                    return (
                                        <div key={inv.id} className="kk-item-card">
                                            <div className="kk-item-main">
                                                <div className="kk-item-badges-row">
                                                    <span className="kk-badge kk-badge-orange">{inv.asset_type}</span>
                                                    <span className="kk-badge kk-badge-nocost">{inv.investment_mode}</span>
                                                    {inv.platform && (
                                                        <span className="kk-badge kk-badge-orange">{inv.platform}</span>
                                                    )}
                                                    <span className={`kk-badge ${isPositive ? 'kk-badge-paid' : 'kk-badge-unpaid'}`}>
                                                        {isPositive ? '+' : ''}{formatMoney(inv.gain_amount)} ({isPositive ? '+' : ''}{inv.gain_percent}%)
                                                    </span>
                                                </div>
                                                <h3 className="kk-item-title">{inv.title}</h3>
                                                <div className="kk-item-meta-line">
                                                    <span>Invested: <strong>{formatMoney(inv.total_invested)}</strong></span>
                                                    <span>•</span>
                                                    <span>Current Value: <strong style={{ color: '#059669' }}>{formatMoney(inv.current_value)}</strong></span>
                                                    {Number(inv.monthly_sip_amount) > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span>SIP: <strong>{formatMoney(inv.monthly_sip_amount)}/mo</strong> (Day {inv.sip_day || 5})</span>
                                                        </>
                                                    )}
                                                    {inv.expected_return_rate > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span>Target: {inv.expected_return_rate}% p.a.</span>
                                                        </>
                                                    )}
                                                </div>
                                                {inv.notes && <div className="kk-subtext">{inv.notes}</div>}
                                            </div>
                                            <div className="kk-item-actions">
                                                <div className="kk-item-price-tag">
                                                    <strong style={{ color: '#059669' }}>{formatMoney(inv.current_value)}</strong>
                                                    <small>value</small>
                                                </div>
                                                <div className="kk-action-btn-pair">
                                                    <button type="button" className="kk-btn kk-btn-secondary kk-btn-sm" onClick={() => openEditInvestmentModal(inv)}>
                                                        Edit
                                                    </button>
                                                    <button type="button" className="kk-btn kk-btn-danger-ghost kk-btn-sm" onClick={() => handleDeleteInvestment(inv.id)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {typeof document !== 'undefined' && createPortal(
                <div className={isDarkTheme ? 'kk-theme-dark' : 'kk-theme-light'}>
            {/* MODAL 1: ADD / EDIT CARD */}
            {cardModalOpen && (
                <div className="kk-modal-backdrop" onClick={() => setCardModalOpen(false)}>
                    <div className="kk-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="kk-modal-header">
                            <h3>{cardForm.id ? 'Edit Card' : 'Add Credit / EMI Card'}</h3>
                            <button type="button" className="kk-modal-close" onClick={() => setCardModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveCard}>
                            <div className="kk-form-grid">
                                <div className="kk-form-group">
                                    <label>Card Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. HDFC Regalia Gold"
                                        value={cardForm.name}
                                        onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Bank / Issuer</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. HDFC Bank, ICICI, SBI"
                                        value={cardForm.bank}
                                        onChange={(e) => setCardForm({ ...cardForm, bank: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Last 4 Digits</label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="e.g. 4829"
                                        value={cardForm.last4}
                                        onChange={(e) => setCardForm({ ...cardForm, last4: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Card Type</label>
                                    <select
                                        value={cardForm.card_type}
                                        onChange={(e) => setCardForm({ ...cardForm, card_type: e.target.value })}
                                    >
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="EMI Card">EMI Card (Bajaj/Bank)</option>
                                        <option value="Loan Account">Loan Account</option>
                                        <option value="Debit Card">Debit Card</option>
                                    </select>
                                </div>
                                <div className="kk-form-group">
                                    <label>Total Credit Limit</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={cardForm.credit_limit}
                                        onChange={(e) => setCardForm({ ...cardForm, credit_limit: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Card Theme Color</label>
                                    <input
                                        type="color"
                                        className="kk-color-input"
                                        value={cardForm.color}
                                        onChange={(e) => setCardForm({ ...cardForm, color: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Statement Billing Day (1-31)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        required
                                        value={cardForm.billing_day}
                                        onChange={(e) => setCardForm({ ...cardForm, billing_day: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Payment Due Day (1-31)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        required
                                        value={cardForm.due_day}
                                        onChange={(e) => setCardForm({ ...cardForm, due_day: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="kk-form-group">
                                <label>Notes (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Primary card for electronics & insurance"
                                    value={cardForm.notes}
                                    onChange={(e) => setCardForm({ ...cardForm, notes: e.target.value })}
                                />
                            </div>
                            <div className="kk-modal-footer">
                                <button type="button" className="kk-btn kk-btn-ghost" onClick={() => setCardModalOpen(false)}>Cancel</button>
                                <button type="submit" className="kk-btn kk-btn-primary">Save Card</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: ADD / EDIT EMI */}
            {emiModalOpen && (
                <div className="kk-modal-backdrop" onClick={() => setEmiModalOpen(false)}>
                    <div className="kk-modal-card kk-modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="kk-modal-header">
                            <h3>{emiForm.id ? 'Edit EMI' : 'Add Card / Loan EMI'}</h3>
                            <button type="button" className="kk-modal-close" onClick={() => setEmiModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveEmi}>
                            <div className="kk-form-grid">
                                <div className="kk-form-group span-2">
                                    <label>Item / Loan Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. MacBook Pro M4, iPhone 16, Home Interior Loan"
                                        value={emiForm.title}
                                        onChange={(e) => setEmiForm({ ...emiForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Linked Card (or Direct Bank Loan)</label>
                                    <select
                                        value={emiForm.card_id}
                                        onChange={(e) => setEmiForm({ ...emiForm, card_id: e.target.value })}
                                    >
                                        <option value="">-- Direct Bank Loan / No Card --</option>
                                        {cards.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.bank} ••{c.last4})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="kk-form-group">
                                    <label>Category</label>
                                    <select
                                        value={emiForm.category}
                                        onChange={(e) => setEmiForm({ ...emiForm, category: e.target.value })}
                                    >
                                        <option value="Electronics">Electronics &amp; Gadgets</option>
                                        <option value="Appliances">Home Appliances</option>
                                        <option value="Vehicle">Vehicle / Auto Loan</option>
                                        <option value="Home / Furniture">Home / Furniture</option>
                                        <option value="Personal Loan">Personal Loan</option>
                                        <option value="Medical">Medical</option>
                                        <option value="Travel">Travel</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="kk-form-group">
                                    <label>Total Principal / Purchase Price *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        placeholder="e.g. 120000"
                                        value={emiForm.total_principal}
                                        onChange={(e) => handleEmiCalcChange('total_principal', e.target.value)}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Tenure (Total Months) *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="360"
                                        required
                                        value={emiForm.total_months}
                                        onChange={(e) => handleEmiCalcChange('total_months', e.target.value)}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Annual Interest Rate % (0 for No-Cost EMI)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={emiForm.interest_rate}
                                        onChange={(e) => handleEmiCalcChange('interest_rate', e.target.value)}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Monthly EMI Amount *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        placeholder="Auto-calculated or enter manually"
                                        value={emiForm.monthly_emi}
                                        onChange={(e) => setEmiForm({ ...emiForm, monthly_emi: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>First Installment Month (Start Month) *</label>
                                    <input
                                        type="month"
                                        required
                                        value={emiForm.start_month}
                                        onChange={(e) => setEmiForm({ ...emiForm, start_month: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Due Day of Month (1-31)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={emiForm.due_day}
                                        onChange={(e) => setEmiForm({ ...emiForm, due_day: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>One-time Processing Fee</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={emiForm.processing_fee}
                                        onChange={(e) => setEmiForm({ ...emiForm, processing_fee: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Status</label>
                                    <select
                                        value={emiForm.status}
                                        onChange={(e) => setEmiForm({ ...emiForm, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="foreclosed">Foreclosed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="kk-emi-calc-preview">
                                {emiCalcPreviewData.emi ? (
                                    <>
                                        <strong>Calculated EMI: {formatMoney(emiCalcPreviewData.emi)} / month</strong> for {emiForm.total_months} months •{' '}
                                        Total Payable: <strong>{formatMoney(emiCalcPreviewData.totalPayable)}</strong>{' '}
                                        ({emiCalcPreviewData.totalInterest > 0
                                            ? `Interest cost: ${formatMoney(emiCalcPreviewData.totalInterest)}`
                                            : 'No-Cost 0% Interest'})
                                    </>
                                ) : (
                                    'Enter Principal & Tenure above to preview total payable & interest cost.'
                                )}
                            </div>

                            <div className="kk-form-group">
                                <label>Notes (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. No-Cost EMI on Amazon"
                                    value={emiForm.notes}
                                    onChange={(e) => setEmiForm({ ...emiForm, notes: e.target.value })}
                                />
                            </div>
                            <div className="kk-modal-footer">
                                <button type="button" className="kk-btn kk-btn-ghost" onClick={() => setEmiModalOpen(false)}>Cancel</button>
                                <button type="submit" className="kk-btn kk-btn-primary">Save EMI</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: ADD / EDIT FIXED EXPENSE */}
            {fixedModalOpen && (
                <div className="kk-modal-backdrop" onClick={() => setFixedModalOpen(false)}>
                    <div className="kk-modal-card kk-modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="kk-modal-header">
                            <h3>{fixedForm.id ? 'Edit Recurring Fixed Expense' : 'Add Recurring Fixed Expense'}</h3>
                            <button type="button" className="kk-modal-close" onClick={() => setFixedModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveFixed}>
                            <div className="kk-form-grid">
                                <div className="kk-form-group span-2">
                                    <label>Expense Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Apartment Room Rent, Health Insurance Premium, Society Maintenance"
                                        value={fixedForm.title}
                                        onChange={(e) => setFixedForm({ ...fixedForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Category *</label>
                                    <select
                                        value={fixedForm.category}
                                        onChange={(e) => setFixedForm({ ...fixedForm, category: e.target.value })}
                                    >
                                        <option value="Rent & Housing">🏠 Rent &amp; Housing</option>
                                        <option value="Insurance Premium">🛡️ Insurance Premium</option>
                                        <option value="Utilities & Bills">⚡ Utilities &amp; Bills (Electricity, Wi-Fi)</option>
                                        <option value="Domestic Help">🧹 Domestic Help / Salary</option>
                                        <option value="Subscriptions">📺 Subscriptions &amp; Memberships</option>
                                        <option value="Investments / SIP">📈 Investments / SIP</option>
                                        <option value="Education / Kids">🎓 Education &amp; Tuition</option>
                                        <option value="Other">📌 Other Fixed Expense</option>
                                    </select>
                                </div>
                                <div className="kk-form-group">
                                    <label>Amount *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        placeholder="e.g. 24000"
                                        value={fixedForm.amount}
                                        onChange={(e) => setFixedForm({ ...fixedForm, amount: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Billing Frequency *</label>
                                    <select
                                        value={fixedForm.frequency}
                                        onChange={(e) => setFixedForm({ ...fixedForm, frequency: e.target.value })}
                                    >
                                        <option value="monthly">Monthly (Every Month)</option>
                                        <option value="quarterly">Quarterly (Every 3 Months)</option>
                                        <option value="half-yearly">Half-Yearly (Every 6 Months)</option>
                                        <option value="yearly">Yearly / Annual Renewal</option>
                                    </select>
                                </div>
                                <div className="kk-form-group">
                                    <label>Start / Renewal Month *</label>
                                    <input
                                        type="month"
                                        required
                                        value={fixedForm.start_month}
                                        onChange={(e) => setFixedForm({ ...fixedForm, start_month: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Payment Method</label>
                                    <select
                                        value={fixedForm.payment_method}
                                        onChange={(e) => {
                                            const method = e.target.value;
                                            let nextCardId = fixedForm.card_id;
                                            if (method === 'Credit Card' && !nextCardId && cards[0]) {
                                                nextCardId = cards[0].id;
                                            } else if (method !== 'Credit Card') {
                                                nextCardId = '';
                                            }
                                            setFixedForm({ ...fixedForm, payment_method: method, card_id: nextCardId });
                                        }}
                                    >
                                        <option value="UPI / Bank Transfer">UPI / Bank Transfer</option>
                                        <option value="Credit Card">Charged to Credit Card</option>
                                        <option value="Auto-Debit (NACH)">Bank Auto-Debit (NACH)</option>
                                        <option value="Cash">Cash</option>
                                    </select>
                                </div>
                                <div className="kk-form-group">
                                    <label>Link to Credit Card (Optional — adds to Card Bill)</label>
                                    <select
                                        value={fixedForm.card_id}
                                        onChange={(e) => setFixedForm({ ...fixedForm, card_id: e.target.value })}
                                    >
                                        <option value="">-- None (Direct UPI / Bank) --</option>
                                        {cards.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} (Due {getOrdinal(c.due_day)})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="kk-form-group">
                                    <label>Due Day of Month (1-31)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        required
                                        value={fixedForm.due_day}
                                        onChange={(e) => setFixedForm({ ...fixedForm, due_day: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group kk-checkbox-group">
                                    <label className="kk-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={fixedForm.auto_pay}
                                            onChange={(e) => setFixedForm({ ...fixedForm, auto_pay: e.target.checked })}
                                        />
                                        <span>Auto-Pay / Standing Instruction Enabled</span>
                                    </label>
                                </div>
                            </div>
                            <div className="kk-form-group">
                                <label>Notes (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Policy number, Landlord UPI ID, etc."
                                    value={fixedForm.notes}
                                    onChange={(e) => setFixedForm({ ...fixedForm, notes: e.target.value })}
                                />
                            </div>
                            <div className="kk-modal-footer">
                                <button type="button" className="kk-btn kk-btn-ghost" onClick={() => setFixedModalOpen(false)}>Cancel</button>
                                <button type="submit" className="kk-btn kk-btn-emerald">Save Fixed Expense</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: ADD ONE-TIME SPEND (UPI / CASH / BANK OR CREDIT CARD) */}
            {spendModalOpen && (
                <div className="kk-modal-backdrop" onClick={() => setSpendModalOpen(false)}>
                    <div className="kk-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="kk-modal-header">
                            <h3>Add One-Time Spend</h3>
                            <button type="button" className="kk-modal-close" onClick={() => setSpendModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveSpend}>
                            <div className="kk-form-grid">
                                <div className="kk-form-group span-2">
                                    <label>Spend Description *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Groceries, Fuel, Shopping, Dinner"
                                        value={spendForm.title}
                                        onChange={(e) => setSpendForm({ ...spendForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Amount *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        placeholder="e.g. 1500"
                                        value={spendForm.amount}
                                        onChange={(e) => setSpendForm({ ...spendForm, amount: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Category</label>
                                    <select
                                        value={spendForm.category}
                                        onChange={(e) => setSpendForm({ ...spendForm, category: e.target.value })}
                                    >
                                        <option value="Shopping">Shopping</option>
                                        <option value="Groceries">Groceries</option>
                                        <option value="Dining">Dining &amp; Food</option>
                                        <option value="Fuel & Travel">Fuel &amp; Travel</option>
                                        <option value="Bills & Recharge">Bills &amp; Recharge</option>
                                        <option value="Medical">Medical</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="kk-form-group span-2">
                                    <label>Paid Via (UPI / Cash / Bank or Credit Card)</label>
                                    <select
                                        value={spendForm.card_id || ''}
                                        onChange={(e) => {
                                            const cid = e.target.value;
                                            setSpendForm({
                                                ...spendForm,
                                                card_id: cid,
                                                payment_method: cid ? 'Credit Card' : 'UPI / Cash / Bank'
                                            });
                                        }}
                                    >
                                        <option value="">UPI / Cash / Bank Transfer (Direct)</option>
                                        {cards.map(c => (
                                            <option key={c.id} value={c.id}>
                                                Credit Card: {c.name} ({c.bank})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="kk-form-group">
                                    <label>Month *</label>
                                    <input
                                        type="month"
                                        required
                                        value={spendForm.month}
                                        onChange={(e) => setSpendForm({ ...spendForm, month: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={spendForm.spend_date}
                                        onChange={(e) => setSpendForm({ ...spendForm, spend_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="kk-modal-footer">
                                <button type="button" className="kk-btn kk-btn-ghost" onClick={() => setSpendModalOpen(false)}>Cancel</button>
                                <button type="submit" className="kk-btn kk-btn-primary">Save One-Time Spend</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4B: ADD ONE-TIME INCOME */}
            {incomeModalOpen && (
                <div className="kk-modal-backdrop" onClick={() => setIncomeModalOpen(false)}>
                    <div className="kk-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="kk-modal-header">
                            <h3>Add One-Time Income</h3>
                            <button type="button" className="kk-modal-close" onClick={() => setIncomeModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveIncome}>
                            <div className="kk-form-grid">
                                <div className="kk-form-group span-2">
                                    <label>Income Source / Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Monthly Salary, Freelance Project, Bonus, Refund"
                                        value={incomeForm.title}
                                        onChange={(e) => setIncomeForm({ ...incomeForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Amount *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        placeholder="e.g. 50000"
                                        value={incomeForm.amount}
                                        onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Category</label>
                                    <select
                                        value={incomeForm.category}
                                        onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                                    >
                                        <option value="Salary / Business">Salary / Business</option>
                                        <option value="Freelance / Consulting">Freelance / Consulting</option>
                                        <option value="Bonus / Incentive">Bonus / Incentive</option>
                                        <option value="Refund / Cashback">Refund / Cashback</option>
                                        <option value="Investment / Dividend">Investment / Dividend</option>
                                        <option value="Gift / Other">Gift / Other</option>
                                    </select>
                                </div>
                                <div className="kk-form-group">
                                    <label>Received In</label>
                                    <select
                                        value={incomeForm.payment_mode}
                                        onChange={(e) => setIncomeForm({ ...incomeForm, payment_mode: e.target.value })}
                                    >
                                        <option value="Bank / UPI">Bank Account / UPI</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Wallet / Card">Wallet / Card</option>
                                    </select>
                                </div>
                                <div className="kk-form-group">
                                    <label>Month *</label>
                                    <input
                                        type="month"
                                        required
                                        value={incomeForm.month}
                                        onChange={(e) => setIncomeForm({ ...incomeForm, month: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={incomeForm.income_date}
                                        onChange={(e) => setIncomeForm({ ...incomeForm, income_date: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Notes (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Optional note"
                                        value={incomeForm.notes}
                                        onChange={(e) => setIncomeForm({ ...incomeForm, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="kk-modal-footer">
                                <button type="button" className="kk-btn kk-btn-ghost" onClick={() => setIncomeModalOpen(false)}>Cancel</button>
                                <button type="submit" className="kk-btn kk-btn-emerald">Save Income</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4C: ADD / EDIT INVESTMENT & SIP */}
            {investmentModalOpen && (
                <div className="kk-modal-backdrop" onClick={() => setInvestmentModalOpen(false)}>
                    <div className="kk-modal-card kk-modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="kk-modal-header">
                            <h3>{investmentForm.id ? 'Edit Investment / SIP' : 'Add Investment / SIP'}</h3>
                            <button type="button" className="kk-modal-close" onClick={() => setInvestmentModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveInvestment}>
                            <div className="kk-form-grid">
                                <div className="kk-form-group span-2">
                                    <label>Investment / Fund / Asset Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Parag Parikh Flexi Cap SIP, Nifty 50 Index, HDFC FD, PPF"
                                        value={investmentForm.title}
                                        onChange={(e) => setInvestmentForm({ ...investmentForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Asset Type</label>
                                    <select
                                        value={investmentForm.asset_type}
                                        onChange={(e) => setInvestmentForm({ ...investmentForm, asset_type: e.target.value })}
                                    >
                                        <option value="Mutual Fund / SIP">Mutual Fund / SIP</option>
                                        <option value="Stocks / Equity">Stocks / Equity</option>
                                        <option value="Fixed Deposit (FD)">Fixed Deposit (FD)</option>
                                        <option value="PPF / EPF / NPS">PPF / EPF / NPS</option>
                                        <option value="Gold / Silver">Gold / Silver</option>
                                        <option value="Real Estate / Crypto">Real Estate / Crypto</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="kk-form-group">
                                    <label>Investment Mode</label>
                                    <select
                                        value={investmentForm.investment_mode}
                                        onChange={(e) => setInvestmentForm({ ...investmentForm, investment_mode: e.target.value })}
                                    >
                                        <option value="SIP (Monthly)">SIP (Monthly)</option>
                                        <option value="One-Time (Lump Sum)">One-Time (Lump Sum)</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </div>
                                <div className="kk-form-group">
                                    <label>Total Invested So Far *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        placeholder="e.g. 120000"
                                        value={investmentForm.total_invested}
                                        onChange={(e) => setInvestmentForm({ ...investmentForm, total_invested: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Current Portfolio Value (Optional)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Leave blank if same as invested"
                                        value={investmentForm.current_value}
                                        onChange={(e) => setInvestmentForm({ ...investmentForm, current_value: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Monthly SIP Amount (If SIP)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="e.g. 10000"
                                        value={investmentForm.monthly_sip_amount}
                                        onChange={(e) => setInvestmentForm({ ...investmentForm, monthly_sip_amount: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Expected Return Rate (% p.a.)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g. 12"
                                        value={investmentForm.expected_return_rate}
                                        onChange={(e) => setInvestmentForm({ ...investmentForm, expected_return_rate: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Platform / App / Bank</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Groww, Zerodha, HDFC Bank, SBI"
                                        value={investmentForm.platform}
                                        onChange={(e) => setInvestmentForm({ ...investmentForm, platform: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>SIP Auto-Debit Day (1-31)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={31}
                                        value={investmentForm.sip_day}
                                        onChange={(e) => setInvestmentForm({ ...investmentForm, sip_day: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={investmentForm.start_date}
                                        onChange={(e) => setInvestmentForm({ ...investmentForm, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Status</label>
                                    <select
                                        value={investmentForm.status}
                                        onChange={(e) => setInvestmentForm({ ...investmentForm, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="redeemed">Redeemed / Closed</option>
                                    </select>
                                </div>
                                <div className="kk-form-group span-2">
                                    <label>Notes (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Folio number, goal name, maturity date..."
                                        value={investmentForm.notes}
                                        onChange={(e) => setInvestmentForm({ ...investmentForm, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="kk-modal-footer">
                                <button type="button" className="kk-btn kk-btn-ghost" onClick={() => setInvestmentModalOpen(false)}>Cancel</button>
                                <button type="submit" className="kk-btn kk-btn-primary">Save Investment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 5: SETTINGS, MULTI-CURRENCY & MONGODB BACKUP */}
            {settingsModalOpen && (
                <div className="kk-modal-backdrop" onClick={() => setSettingsModalOpen(false)}>
                    <div className="kk-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="kk-modal-header">
                            <h3>⚙️ Settings, Currency &amp; MongoDB Backup</h3>
                            <button type="button" className="kk-modal-close" onClick={() => setSettingsModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveSettings}>
                            <div className="kk-form-grid">
                                <div className="kk-form-group">
                                    <label>Currency Preset</label>
                                    <select
                                        value={settingsForm.currencyPreset}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const [, sym] = val.split('|');
                                            setSettingsForm({
                                                ...settingsForm,
                                                currencyPreset: val,
                                                currency_symbol: sym || settingsForm.currency_symbol
                                            });
                                        }}
                                    >
                                        <option value="INR|₹">Indian Rupee (₹ INR)</option>
                                        <option value="USD|$">US Dollar ($ USD)</option>
                                        <option value="EUR|€">Euro (€ EUR)</option>
                                        <option value="GBP|£">British Pound (£ GBP)</option>
                                        <option value="AED|AED ">UAE Dirham (AED)</option>
                                        <option value="SGD|S$">Singapore Dollar (S$ SGD)</option>
                                        <option value="CAD|C$">Canadian Dollar (C$ CAD)</option>
                                        <option value="AUD|A$">Australian Dollar (A$ AUD)</option>
                                        <option value="JPY|¥">Japanese Yen (¥ JPY)</option>
                                    </select>
                                </div>
                                <div className="kk-form-group">
                                    <label>Custom Currency Symbol</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="₹ or $"
                                        value={settingsForm.currency_symbol}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, currency_symbol: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Monthly Net Income / Budget Target</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="e.g. 150000"
                                        value={settingsForm.monthly_income}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, monthly_income: e.target.value })}
                                    />
                                </div>
                                <div className="kk-form-group">
                                    <label>Appearance Theme</label>
                                    <select
                                        value={settingsForm.theme}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, theme: e.target.value })}
                                    >
                                        <option value="light">CS Corp Light (Signature Orange)</option>
                                        <option value="dark">Dark Mode (Slate Night)</option>
                                    </select>
                                </div>
                            </div>

                            <hr className="kk-divider" />

                            <div className="kk-backup-section">
                                <h4>📦 Reports &amp; Backup</h4>
                                <p className="kk-text-muted">
                                    Export your monthly expense report as CSV or download a backup file anytime.
                                </p>
                                <div className="kk-backup-btns">
                                    <button type="button" className="kk-btn kk-btn-secondary kk-btn-sm" onClick={exportMonthlyCsv}>
                                        <Download size={14} /> Export Month CSV
                                    </button>
                                    <button type="button" className="kk-btn kk-btn-secondary kk-btn-sm" onClick={exportJsonBackup}>
                                        <Download size={14} /> Download JSON Backup
                                    </button>
                                    <label className="kk-btn kk-btn-secondary kk-btn-sm" style={{ cursor: 'pointer' }}>
                                        <Upload size={14} /> Restore JSON Backup
                                        <input type="file" accept=".json" onChange={importJsonBackup} hidden />
                                    </label>
                                </div>
                                <div className="kk-backup-btns" style={{ marginTop: 8 }}>
                                    <button type="button" className="kk-btn kk-btn-danger-ghost kk-btn-sm" onClick={clearAllData}>
                                        <Trash2 size={14} /> Clear All My Data (Start Fresh)
                                    </button>
                                </div>
                            </div>

                            <div className="kk-modal-footer">
                                <button type="button" className="kk-btn kk-btn-ghost" onClick={() => setSettingsModalOpen(false)}>Close</button>
                                <button type="submit" className="kk-btn kk-btn-primary">Save Settings</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="kk-toast-container">
                    <div className="kk-toast">{toast}</div>
                </div>
            )}

            {/* Mobile Sticky Bottom App Navigation Bar */}
            <nav className="kk-mobile-bottom-nav" aria-label="KhataKit Mobile Navigation">
                <button
                    type="button"
                    className={`kk-mob-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <PieChart size={19} />
                    <span>Overview</span>
                </button>
                <button
                    type="button"
                    className={`kk-mob-nav-item ${activeTab === 'checklist' ? 'active' : ''}`}
                    onClick={() => setActiveTab('checklist')}
                >
                    <div className="kk-mob-icon-wrap">
                        <CheckCircle2 size={19} />
                        {unpaidCount > 0 && <span className="kk-mob-badge">{unpaidCount}</span>}
                    </div>
                    <span>Checklist</span>
                </button>
                <button
                    type="button"
                    className={`kk-mob-nav-item ${activeTab === 'cards' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cards')}
                >
                    <div className="kk-mob-icon-wrap">
                        <CreditCard size={19} />
                        {cards.length > 0 && <span className="kk-mob-badge secondary">{cards.length}</span>}
                    </div>
                    <span>Cards</span>
                </button>
                <button
                    type="button"
                    className={`kk-mob-nav-item ${activeTab === 'emis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('emis')}
                >
                    <div className="kk-mob-icon-wrap">
                        <Calendar size={19} />
                        {summary.active_emis_count > 0 && <span className="kk-mob-badge secondary">{summary.active_emis_count}</span>}
                    </div>
                    <span>EMIs</span>
                </button>
                <button
                    type="button"
                    className={`kk-mob-nav-item ${activeTab === 'fixed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('fixed')}
                >
                    <Home size={19} />
                    <span>Fixed</span>
                </button>
                <button
                    type="button"
                    className={`kk-mob-nav-item ${activeTab === 'investments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('investments')}
                >
                    <div className="kk-mob-icon-wrap">
                        <TrendingUp size={19} />
                        {investments.length > 0 && <span className="kk-mob-badge secondary">{investments.length}</span>}
                    </div>
                    <span>Invest</span>
                </button>
            </nav>
                </div>,
                document.body
            )}
        </div>
    );
};

export default KhataKit;
