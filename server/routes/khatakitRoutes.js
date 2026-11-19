import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    KhataKitSetting,
    KhataKitCard,
    KhataKitEmi,
    KhataKitFixedExpense,
    KhataKitCardSpend,
    KhataKitIncome,
    KhataKitInvestment,
    KhataKitMonthlyPayment
} from '../models/KhataKit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const DEFAULT_SETTINGS = {
    currency_code: 'INR',
    currency_symbol: '₹',
    monthly_income: '0',
    theme: 'light'
};

// Local JSON persistence for per-user fallback when MongoDB URI is not yet active
const LOCAL_STORE_DIR = path.join(__dirname, '..', 'uploads');
const LOCAL_STORE_FILE = path.join(LOCAL_STORE_DIR, 'khatakit-users.json');

let fallbackUsers = {};
function loadLocalStore() {
    try {
        if (fs.existsSync(LOCAL_STORE_FILE)) {
            const raw = fs.readFileSync(LOCAL_STORE_FILE, 'utf8');
            fallbackUsers = JSON.parse(raw) || {};
        }
    } catch (e) {
        fallbackUsers = {};
    }
}
function saveLocalStore() {
    try {
        if (!fs.existsSync(LOCAL_STORE_DIR)) {
            fs.mkdirSync(LOCAL_STORE_DIR, { recursive: true });
        }
        fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(fallbackUsers, null, 2), 'utf8');
    } catch (e) {
        console.error('Failed to persist local KhataKit store:', e.message);
    }
}
loadLocalStore();

function getUserFallback(userId) {
    const key = String(userId).toLowerCase().trim();
    if (!fallbackUsers[key]) {
        fallbackUsers[key] = {
            settings: { ...DEFAULT_SETTINGS },
            cards: [],
            emis: [],
            fixed_expenses: [],
            card_spends: [],
            incomes: [],
            investments: [],
            monthly_payments: []
        };
        saveLocalStore();
    }
    if (!Array.isArray(fallbackUsers[key].incomes)) {
        fallbackUsers[key].incomes = [];
    }
    if (!Array.isArray(fallbackUsers[key].investments)) {
        fallbackUsers[key].investments = [];
    }
    return fallbackUsers[key];
}

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Middleware: Require authenticated user_id for all KhataKit routes
router.use((req, res, next) => {
    const rawUserId = req.headers['x-user-id'] || req.query.user_id || req.body?.user_id;
    if (!rawUserId || String(rawUserId).trim() === '') {
        return res.status(401).json({
            success: false,
            error: 'Authentication required. Please sign in to access your personal KhataKit expenses.'
        });
    }
    req.khataUserId = String(rawUserId).toLowerCase().trim();
    next();
});

// Helper: Month arithmetic (YYYY-MM)
function parseYearMonth(ym) {
    const [y, m] = (ym || '2026-11').split('-').map(Number);
    return { year: y || 2026, month: m || 11 };
}

function formatYearMonth(year, month) {
    const y = year + Math.floor((month - 1) / 12);
    const m = (((month - 1) % 12) + 12) % 12 + 1;
    return `${y}-${String(m).padStart(2, '0')}`;
}

function monthsDiff(startYM, targetYM) {
    const s = parseYearMonth(startYM);
    const t = parseYearMonth(targetYM);
    return (t.year - s.year) * 12 + (t.month - s.month);
}

function addMonths(ym, count) {
    const { year, month } = parseYearMonth(ym);
    return formatYearMonth(year, month + count);
}

function isFixedDueInMonth(expense, targetMonth) {
    if (!expense.active) return false;
    const diff = monthsDiff(expense.start_month || '2026-01', targetMonth);
    if (diff < 0) return false;
    const freq = (expense.frequency || 'monthly').toLowerCase();
    if (freq === 'monthly') return true;
    if (freq === 'quarterly') return diff % 3 === 0;
    if (freq === 'half-yearly') return diff % 6 === 0;
    if (freq === 'yearly') return diff % 12 === 0;
    return true;
}

function getMonthlyEquivalent(expense) {
    const amt = Number(expense.amount) || 0;
    const freq = (expense.frequency || 'monthly').toLowerCase();
    if (freq === 'quarterly') return amt / 3;
    if (freq === 'half-yearly') return amt / 6;
    if (freq === 'yearly') return amt / 12;
    return amt;
}

// Ensure default settings exist for the user (no dummy data by default)
async function ensureUserSettings(userId) {
    if (isMongoConnected()) {
        try {
            // Clean up any legacy un-scoped records without user_id once
            await Promise.all([
                KhataKitCard.deleteMany({ user_id: { $exists: false } }),
                KhataKitEmi.deleteMany({ user_id: { $exists: false } }),
                KhataKitFixedExpense.deleteMany({ user_id: { $exists: false } }),
                KhataKitCardSpend.deleteMany({ user_id: { $exists: false } }),
                KhataKitMonthlyPayment.deleteMany({ user_id: { $exists: false } }),
                KhataKitSetting.deleteMany({ user_id: { $exists: false } })
            ]);

            for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
                await KhataKitSetting.updateOne(
                    { user_id: userId, key: k },
                    { $setOnInsert: { user_id: userId, key: k, value: String(v) } },
                    { upsert: true }
                );
            }
        } catch (err) {
            console.error('KhataKit user settings init error:', err.message);
        }
    } else {
        getUserFallback(userId);
    }
}

// Fetch raw data for a specific user & month
async function getRawStateForMonth(userId, selectedMonth) {
    await ensureUserSettings(userId);

    if (isMongoConnected()) {
        const [settingsDocs, cardsDocs, emisDocs, fixedDocs, spendsDocs, incomesDocs, investmentsDocs, paymentsDocs] = await Promise.all([
            KhataKitSetting.find({ user_id: userId }),
            KhataKitCard.find({ user_id: userId }).sort({ created_at: 1 }),
            KhataKitEmi.find({ user_id: userId }).sort({ due_day: 1, created_at: 1 }),
            KhataKitFixedExpense.find({ user_id: userId }).sort({ due_day: 1, created_at: 1 }),
            KhataKitCardSpend.find({ user_id: userId, month: selectedMonth }).sort({ spend_date: -1, created_at: -1 }),
            KhataKitIncome.find({ user_id: userId, month: selectedMonth }).sort({ income_date: -1, created_at: -1 }),
            KhataKitInvestment.find({ user_id: userId }).sort({ created_at: -1 }),
            KhataKitMonthlyPayment.find({ user_id: userId, month: selectedMonth })
        ]);

        const settings = { ...DEFAULT_SETTINGS };
        for (const s of settingsDocs) settings[s.key] = s.value;

        return {
            settings,
            cards: cardsDocs.map(d => d.toJSON()),
            emisRaw: emisDocs.map(d => d.toJSON()),
            fixedRaw: fixedDocs.map(d => d.toJSON()),
            spendsRaw: spendsDocs.map(d => d.toJSON()),
            incomesRaw: incomesDocs.map(d => d.toJSON()),
            investmentsRaw: investmentsDocs.map(d => d.toJSON()),
            paymentsRaw: paymentsDocs.map(d => d.toJSON())
        };
    }

    const userStore = getUserFallback(userId);
    return {
        settings: { ...DEFAULT_SETTINGS, ...userStore.settings },
        cards: [...userStore.cards],
        emisRaw: [...userStore.emis],
        fixedRaw: [...userStore.fixed_expenses],
        spendsRaw: userStore.card_spends.filter(s => s.month === selectedMonth),
        incomesRaw: (userStore.incomes || []).filter(inc => inc.month === selectedMonth),
        investmentsRaw: [...(userStore.investments || [])],
        paymentsRaw: userStore.monthly_payments.filter(p => p.month === selectedMonth)
    };
}

// Build complete dashboard payload for userId and selectedMonth (YYYY-MM)
async function buildMonthPayload(userId, selectedMonth) {
    const { settings, cards, emisRaw, fixedRaw, spendsRaw, incomesRaw, investmentsRaw, paymentsRaw } = await getRawStateForMonth(userId, selectedMonth);

    const cardMap = new Map(cards.map(c => [String(c.id), c]));
    const investmentMap = new Map((investmentsRaw || []).map(inv => [String(inv.id), inv]));
    const paymentMap = new Map();
    for (const p of paymentsRaw) {
        paymentMap.set(`${p.item_type}:${String(p.item_id)}`, p);
    }

    // Enrich EMIs with tenure progress for selectedMonth
    const emis = emisRaw.map(emi => {
        const emiIdStr = String(emi.id);
        const diff = monthsDiff(emi.start_month, selectedMonth);
        const installmentNumber = diff + 1;
        const endMonth = addMonths(emi.start_month, emi.total_months - 1);
        const isActiveInMonth = emi.status === 'active' && installmentNumber >= 1 && installmentNumber <= emi.total_months;
        const isCompletedBeforeMonth = installmentNumber > emi.total_months || emi.status === 'completed';
        const isUpcoming = installmentNumber < 1;

        const completedInstallments = Math.max(0, Math.min(emi.total_months, installmentNumber));
        const remainingInstallments = Math.max(0, emi.total_months - completedInstallments);
        const totalPayable = Number(emi.monthly_emi) * Number(emi.total_months);
        const amountPaidSoFar = completedInstallments * Number(emi.monthly_emi);
        const amountRemaining = remainingInstallments * Number(emi.monthly_emi);
        const progressPercent = emi.total_months > 0
            ? Math.min(100, Math.max(0, Math.round((completedInstallments / emi.total_months) * 100)))
            : 0;

        const card = emi.card_id ? cardMap.get(String(emi.card_id)) : null;
        const payRecord = paymentMap.get(`emi:${emiIdStr}`);

        return {
            ...emi,
            id: emiIdStr,
            card_id: emi.card_id ? String(emi.card_id) : null,
            card_name: card ? card.name : 'Direct / Unassigned',
            card_bank: card ? card.bank : '',
            card_color: card ? card.color : '#64748b',
            card_last4: card ? card.last4 : '',
            effective_due_day: emi.due_day || (card ? card.due_day : 5),
            end_month: endMonth,
            installment_number: installmentNumber,
            is_due_this_month: isActiveInMonth,
            is_completed_before_month: isCompletedBeforeMonth,
            is_upcoming: isUpcoming,
            completed_installments: completedInstallments,
            remaining_installments: remainingInstallments,
            total_payable: totalPayable,
            amount_paid_so_far: amountPaidSoFar,
            amount_remaining: amountRemaining,
            progress_percent: progressPercent,
            is_paid_this_month: payRecord ? Boolean(payRecord.is_paid) : false,
            paid_amount_this_month: payRecord ? Number(payRecord.paid_amount) : Number(emi.monthly_emi),
            paid_date: payRecord ? payRecord.paid_date : ''
        };
    });

    // Enrich Fixed Expenses for selectedMonth
    const fixedExpenses = fixedRaw.map(fx => {
        const fxIdStr = String(fx.id);
        const dueThisMonth = isFixedDueInMonth(fx, selectedMonth);
        const card = fx.card_id ? cardMap.get(String(fx.card_id)) : null;
        const linkedInv = fx.investment_id ? investmentMap.get(String(fx.investment_id)) : null;
        const payRecord = paymentMap.get(`fixed:${fxIdStr}`);
        const monthlyEquivalent = getMonthlyEquivalent(fx);

        return {
            ...fx,
            id: fxIdStr,
            card_id: fx.card_id ? String(fx.card_id) : null,
            card_name: card ? card.name : null,
            card_color: card ? card.color : null,
            card_last4: card ? card.last4 : null,
            investment_id: fx.investment_id ? String(fx.investment_id) : null,
            investment_title: linkedInv ? linkedInv.title : null,
            investment_asset_type: linkedInv ? linkedInv.asset_type : null,
            effective_due_day: fx.due_day || (card ? card.due_day : (linkedInv ? linkedInv.sip_day : 5)),
            is_due_this_month: dueThisMonth,
            monthly_equivalent: monthlyEquivalent,
            is_paid_this_month: payRecord ? Boolean(payRecord.is_paid) : false,
            paid_amount_this_month: payRecord ? Number(payRecord.paid_amount) : Number(fx.amount),
            paid_date: payRecord ? payRecord.paid_date : ''
        };
    });

    // Enrich Cards with monthly statement aggregation
    const cardSummaries = cards.map(card => {
        const cardIdStr = String(card.id);
        const cardEmis = emis.filter(e => String(e.card_id) === cardIdStr && e.is_due_this_month);
        const allActiveCardEmis = emis.filter(e => String(e.card_id) === cardIdStr && e.status === 'active' && !e.is_completed_before_month);
        const cardFixed = fixedExpenses.filter(f => String(f.card_id) === cardIdStr && f.is_due_this_month);
        const cardSpends = spendsRaw
            .filter(s => String(s.card_id) === cardIdStr)
            .map(s => ({ ...s, id: String(s.id), card_id: String(s.card_id) }));

        const emiTotal = cardEmis.reduce((s, e) => s + Number(e.paid_amount_this_month), 0);
        const fixedTotal = cardFixed.reduce((s, f) => s + Number(f.paid_amount_this_month), 0);
        const spendTotal = cardSpends.reduce((s, sp) => s + Number(sp.amount), 0);
        const statementTotal = emiTotal + fixedTotal + spendTotal;

        const lockedEmiBalance = allActiveCardEmis.reduce((s, e) => s + Number(e.amount_remaining), 0);
        const totalUtilized = lockedEmiBalance + fixedTotal + spendTotal;
        const utilizationPercent = card.credit_limit > 0
            ? Math.min(100, Math.round((totalUtilized / card.credit_limit) * 100))
            : 0;

        const cardBillPayment = paymentMap.get(`card_bill:${cardIdStr}`);
        const hasItems = cardEmis.length + cardFixed.length + cardSpends.length > 0;
        const allSubItemsPaid = (cardEmis.length + cardFixed.length > 0)
            ? (cardEmis.every(e => e.is_paid_this_month) && cardFixed.every(f => f.is_paid_this_month))
            : false;
        const isCardPaid = cardBillPayment ? Boolean(cardBillPayment.is_paid) : allSubItemsPaid;

        return {
            ...card,
            id: cardIdStr,
            emi_total: emiTotal,
            fixed_total: fixedTotal,
            spend_total: spendTotal,
            statement_total: statementTotal,
            locked_emi_balance: lockedEmiBalance,
            total_utilized: totalUtilized,
            utilization_percent: utilizationPercent,
            active_emis_count: cardEmis.length,
            fixed_bills_count: cardFixed.length,
            spends_count: cardSpends.length,
            has_items: hasItems,
            is_paid_this_month: isCardPaid,
            emis: cardEmis,
            fixed_bills: cardFixed,
            spends: cardSpends
        };
    });

    // Build unified Monthly Checklist items for selectedMonth
    const checklist = [];

    for (const e of emis.filter(x => x.is_due_this_month)) {
        checklist.push({
            uid: `emi:${e.id}`,
            item_type: 'emi',
            item_id: e.id,
            title: e.title,
            subtitle: `Installment ${e.installment_number} of ${e.total_months} • ${e.card_name}`,
            category: `EMI (${e.category})`,
            card_id: e.card_id,
            card_name: e.card_name,
            card_color: e.card_color,
            due_day: e.effective_due_day,
            expected_amount: Number(e.monthly_emi),
            amount: Number(e.paid_amount_this_month),
            is_paid: e.is_paid_this_month,
            paid_date: e.paid_date,
            auto_pay: false,
            badge: `${e.installment_number}/${e.total_months}`
        });
    }

    for (const f of fixedExpenses.filter(x => x.is_due_this_month)) {
        checklist.push({
            uid: `fixed:${f.id}`,
            item_type: 'fixed',
            item_id: f.id,
            title: f.title,
            subtitle: f.investment_title
                ? `Linked SIP: ${f.investment_title} • ${f.payment_method}`
                : (f.card_name ? `Charged to ${f.card_name} (${f.frequency})` : `${f.payment_method} (${f.frequency})`),
            category: f.category,
            investment_id: f.investment_id,
            investment_title: f.investment_title,
            card_id: f.card_id,
            card_name: f.card_name || f.payment_method,
            card_color: f.card_color || '#10b981',
            due_day: f.effective_due_day,
            expected_amount: Number(f.amount),
            amount: Number(f.paid_amount_this_month),
            is_paid: f.is_paid_this_month,
            paid_date: f.paid_date,
            auto_pay: Boolean(f.auto_pay),
            badge: f.investment_title ? `SIP • ${f.frequency}` : f.frequency
        });
    }

    checklist.sort((a, b) => a.due_day - b.due_day || a.title.localeCompare(b.title));

    // Compute 6-month projection (from selectedMonth to +5 months)
    const projection = [];
    for (let i = 0; i < 6; i++) {
        const m = addMonths(selectedMonth, i);
        let mEmiTotal = 0;
        let mFixedTotal = 0;

        for (const emi of emisRaw) {
            if (emi.status !== 'active') continue;
            const d = monthsDiff(emi.start_month, m) + 1;
            if (d >= 1 && d <= emi.total_months) {
                mEmiTotal += Number(emi.monthly_emi);
            }
        }
        for (const fx of fixedRaw) {
            if (isFixedDueInMonth(fx, m)) {
                mFixedTotal += Number(fx.amount);
            }
        }
        const mSpends = i === 0
            ? spendsRaw.reduce((s, sp) => s + Number(sp.amount), 0)
            : 0;

        projection.push({
            month: m,
            emi_total: mEmiTotal,
            fixed_total: mFixedTotal,
            spend_total: mSpends,
            total: mEmiTotal + mFixedTotal + mSpends
        });
    }

    const totalEmiOutflow = emis.filter(e => e.is_due_this_month).reduce((s, e) => s + Number(e.paid_amount_this_month), 0);
    const totalFixedOutflow = fixedExpenses.filter(f => f.is_due_this_month).reduce((s, f) => s + Number(f.paid_amount_this_month), 0);
    const totalVariableSpends = spendsRaw.reduce((s, sp) => s + Number(sp.amount), 0);
    const totalMonthlyOutflow = totalEmiOutflow + totalFixedOutflow + totalVariableSpends;

    const totalOneTimeIncome = (incomesRaw || []).reduce((s, inc) => s + (Number(inc.amount) || 0), 0);
    const baseMonthlyIncome = Number(settings.monthly_income) || 0;
    const totalIncomeThisMonth = baseMonthlyIncome + totalOneTimeIncome;

    const totalPaidChecklist = checklist.filter(c => c.is_paid).reduce((s, c) => s + c.amount, 0);
    const totalUnpaidChecklist = checklist.filter(c => !c.is_paid).reduce((s, c) => s + c.amount, 0);

    const enrichedSpends = spendsRaw.map(s => {
        const card = s.card_id ? cardMap.get(String(s.card_id)) : null;
        return {
            ...s,
            id: String(s.id),
            card_id: s.card_id ? String(s.card_id) : null,
            card_name: card ? card.name : (s.payment_method || 'UPI / Cash / Bank'),
            card_color: card ? card.color : '#0284c7'
        };
    });

    const enrichedInvestments = (investmentsRaw || []).map(inv => {
        const invested = Number(inv.total_invested) || 0;
        const currVal = inv.current_value !== undefined && Number(inv.current_value) > 0
            ? Number(inv.current_value)
            : invested;
        const gainAmt = currVal - invested;
        const gainPct = invested > 0 ? Number(((gainAmt / invested) * 100).toFixed(1)) : 0;
        return {
            ...inv,
            id: String(inv.id),
            total_invested: invested,
            current_value: currVal,
            gain_amount: gainAmt,
            gain_percent: gainPct
        };
    });

    const activeInvestments = enrichedInvestments.filter(i => i.status !== 'redeemed');
    const totalPortfolioInvested = activeInvestments.reduce((s, i) => s + i.total_invested, 0);
    const totalPortfolioCurrentValue = activeInvestments.reduce((s, i) => s + i.current_value, 0);
    const totalPortfolioGain = totalPortfolioCurrentValue - totalPortfolioInvested;
    const totalPortfolioGainPct = totalPortfolioInvested > 0
        ? Number(((totalPortfolioGain / totalPortfolioInvested) * 100).toFixed(1))
        : 0;
    const totalMonthlySip = enrichedInvestments
        .filter(i => i.status === 'active' && i.investment_mode === 'SIP (Monthly)')
        .reduce((s, i) => s + (Number(i.monthly_sip_amount) || 0), 0);

    return {
        success: true,
        brand: 'Chaudhary & Sons (CS Corp) • KhataKit',
        user_id: userId,
        selected_month: selectedMonth,
        settings,
        summary: {
            total_monthly_outflow: totalMonthlyOutflow,
            total_emi_outflow: totalEmiOutflow,
            total_fixed_outflow: totalFixedOutflow,
            total_variable_spends: totalVariableSpends,
            total_one_time_income: totalOneTimeIncome,
            total_income_this_month: totalIncomeThisMonth,
            net_balance: totalIncomeThisMonth - totalMonthlyOutflow,
            total_cards_statement: cardSummaries.reduce((s, c) => s + c.statement_total, 0),
            total_paid: totalPaidChecklist,
            total_unpaid: totalUnpaidChecklist,
            paid_items_count: checklist.filter(c => c.is_paid).length,
            total_items_count: checklist.length,
            active_emis_count: emis.filter(e => e.is_due_this_month).length,
            total_remaining_emi_debt: emis.filter(e => e.status === 'active').reduce((s, e) => s + e.amount_remaining, 0),
            total_portfolio_invested: totalPortfolioInvested,
            total_portfolio_current_value: totalPortfolioCurrentValue,
            total_portfolio_gain: totalPortfolioGain,
            total_portfolio_gain_pct: totalPortfolioGainPct,
            total_monthly_sip: totalMonthlySip,
            active_investments_count: activeInvestments.length
        },
        cards: cardSummaries,
        emis,
        fixed_expenses: fixedExpenses,
        card_spends: enrichedSpends,
        incomes: (incomesRaw || []).map(inc => ({ ...inc, id: String(inc.id) })),
        investments: enrichedInvestments,
        checklist,
        projection
    };
}

// ============================================================================
// ROUTES (Mounted at both /khatakit and /api/khatakit, scoped by req.khataUserId)
// ============================================================================

// 1. GET /khatakit & /khatakit/dashboard
router.get(['/', '/dashboard'], async (req, res) => {
    try {
        const month = req.query.month || '2026-11';
        const payload = await buildMonthPayload(req.khataUserId, month);
        return res.json(payload);
    } catch (err) {
        console.error('KhataKit dashboard error:', err);
        return res.status(500).json({ error: err.message || 'Error loading KhataKit dashboard' });
    }
});

// 2. POST /khatakit/settings
router.post('/settings', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const body = req.body || {};
        if (isMongoConnected()) {
            for (const [k, v] of Object.entries(body)) {
                if (k === 'user_id') continue;
                await KhataKitSetting.updateOne(
                    { user_id: userId, key: k },
                    { $set: { user_id: userId, key: k, value: String(v) } },
                    { upsert: true }
                );
            }
        } else {
            const userStore = getUserFallback(userId);
            for (const [k, v] of Object.entries(body)) {
                if (k === 'user_id') continue;
                userStore.settings[k] = String(v);
            }
            saveLocalStore();
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 3. CARDS CRUD
router.post('/cards', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const b = req.body || {};
        const cardData = {
            user_id: userId,
            name: b.name || 'Unnamed Card',
            bank: b.bank || '',
            last4: b.last4 || '',
            card_type: b.card_type || 'Credit Card',
            credit_limit: Number(b.credit_limit) || 0,
            billing_day: Number(b.billing_day) || 15,
            due_day: Number(b.due_day) || 5,
            color: b.color || '#f97316',
            notes: b.notes || ''
        };

        if (isMongoConnected()) {
            const created = await KhataKitCard.create(cardData);
            return res.status(201).json({ id: created._id.toString() });
        } else {
            const userStore = getUserFallback(userId);
            const newId = 'c_' + Date.now();
            userStore.cards.push({ id: newId, ...cardData });
            saveLocalStore();
            return res.status(201).json({ id: newId });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.put('/cards/:id', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const { id } = req.params;
        const b = req.body || {};
        const updateData = {
            name: b.name || 'Unnamed Card',
            bank: b.bank || '',
            last4: b.last4 || '',
            card_type: b.card_type || 'Credit Card',
            credit_limit: Number(b.credit_limit) || 0,
            billing_day: Number(b.billing_day) || 15,
            due_day: Number(b.due_day) || 5,
            color: b.color || '#f97316',
            notes: b.notes || ''
        };

        if (isMongoConnected()) {
            await KhataKitCard.findOneAndUpdate({ _id: id, user_id: userId }, updateData);
        } else {
            const userStore = getUserFallback(userId);
            const idx = userStore.cards.findIndex(c => String(c.id) === String(id));
            if (idx !== -1) {
                userStore.cards[idx] = { ...userStore.cards[idx], ...updateData };
                saveLocalStore();
            }
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.delete('/cards/:id', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const { id } = req.params;
        if (isMongoConnected()) {
            await Promise.all([
                KhataKitCard.findOneAndDelete({ _id: id, user_id: userId }),
                KhataKitEmi.updateMany({ user_id: userId, card_id: String(id) }, { $set: { card_id: null } }),
                KhataKitFixedExpense.updateMany({ user_id: userId, card_id: String(id) }, { $set: { card_id: null } }),
                KhataKitCardSpend.deleteMany({ user_id: userId, card_id: String(id) }),
                KhataKitMonthlyPayment.deleteMany({ user_id: userId, item_type: 'card_bill', item_id: String(id) })
            ]);
        } else {
            const userStore = getUserFallback(userId);
            userStore.cards = userStore.cards.filter(c => String(c.id) !== String(id));
            userStore.emis.forEach(e => { if (String(e.card_id) === String(id)) e.card_id = null; });
            userStore.fixed_expenses.forEach(f => { if (String(f.card_id) === String(id)) f.card_id = null; });
            userStore.card_spends = userStore.card_spends.filter(s => String(s.card_id) !== String(id));
            saveLocalStore();
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 4. EMIs CRUD
router.post('/emis', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const b = req.body || {};
        const emiData = {
            user_id: userId,
            title: b.title || 'New EMI',
            card_id: b.card_id ? String(b.card_id) : null,
            category: b.category || 'Electronics',
            total_principal: Number(b.total_principal) || 0,
            monthly_emi: Number(b.monthly_emi) || 0,
            interest_rate: Number(b.interest_rate) || 0,
            processing_fee: Number(b.processing_fee) || 0,
            total_months: Number(b.total_months) || 6,
            start_month: b.start_month || '2026-11',
            due_day: Number(b.due_day) || 5,
            status: b.status || 'active',
            notes: b.notes || ''
        };

        if (isMongoConnected()) {
            const created = await KhataKitEmi.create(emiData);
            return res.status(201).json({ id: created._id.toString() });
        } else {
            const userStore = getUserFallback(userId);
            const newId = 'e_' + Date.now();
            userStore.emis.push({ id: newId, ...emiData });
            saveLocalStore();
            return res.status(201).json({ id: newId });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.put('/emis/:id', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const { id } = req.params;
        const b = req.body || {};
        const updateData = {
            title: b.title || 'New EMI',
            card_id: b.card_id ? String(b.card_id) : null,
            category: b.category || 'Electronics',
            total_principal: Number(b.total_principal) || 0,
            monthly_emi: Number(b.monthly_emi) || 0,
            interest_rate: Number(b.interest_rate) || 0,
            processing_fee: Number(b.processing_fee) || 0,
            total_months: Number(b.total_months) || 6,
            start_month: b.start_month || '2026-11',
            due_day: Number(b.due_day) || 5,
            status: b.status || 'active',
            notes: b.notes || ''
        };

        if (isMongoConnected()) {
            await KhataKitEmi.findOneAndUpdate({ _id: id, user_id: userId }, updateData);
        } else {
            const userStore = getUserFallback(userId);
            const idx = userStore.emis.findIndex(e => String(e.id) === String(id));
            if (idx !== -1) {
                userStore.emis[idx] = { ...userStore.emis[idx], ...updateData };
                saveLocalStore();
            }
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.delete('/emis/:id', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const { id } = req.params;
        if (isMongoConnected()) {
            await Promise.all([
                KhataKitEmi.findOneAndDelete({ _id: id, user_id: userId }),
                KhataKitMonthlyPayment.deleteMany({ user_id: userId, item_type: 'emi', item_id: String(id) })
            ]);
        } else {
            const userStore = getUserFallback(userId);
            userStore.emis = userStore.emis.filter(e => String(e.id) !== String(id));
            userStore.monthly_payments = userStore.monthly_payments.filter(
                p => !(p.item_type === 'emi' && String(p.item_id) === String(id))
            );
            saveLocalStore();
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 5. FIXED EXPENSES CRUD
router.post('/fixed', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const b = req.body || {};
        const fixedData = {
            user_id: userId,
            title: b.title || 'Fixed Expense',
            category: b.category || 'Rent & Housing',
            amount: Number(b.amount) || 0,
            frequency: b.frequency || 'monthly',
            start_month: b.start_month || '2026-01',
            due_day: Number(b.due_day) || 5,
            payment_method: b.payment_method || 'UPI / Bank Transfer',
            card_id: b.card_id ? String(b.card_id) : null,
            investment_id: b.investment_id ? String(b.investment_id) : null,
            auto_pay: Boolean(b.auto_pay),
            active: b.active !== undefined ? Boolean(b.active) : true,
            notes: b.notes || ''
        };

        if (isMongoConnected()) {
            const created = await KhataKitFixedExpense.create(fixedData);
            return res.status(201).json({ id: created._id.toString() });
        } else {
            const userStore = getUserFallback(userId);
            const newId = 'f_' + Date.now();
            userStore.fixed_expenses.push({ id: newId, ...fixedData });
            saveLocalStore();
            return res.status(201).json({ id: newId });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.put('/fixed/:id', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const { id } = req.params;
        const b = req.body || {};
        const updateData = {
            title: b.title || 'Fixed Expense',
            category: b.category || 'Rent & Housing',
            amount: Number(b.amount) || 0,
            frequency: b.frequency || 'monthly',
            start_month: b.start_month || '2026-01',
            due_day: Number(b.due_day) || 5,
            payment_method: b.payment_method || 'UPI / Bank Transfer',
            card_id: b.card_id ? String(b.card_id) : null,
            investment_id: b.investment_id ? String(b.investment_id) : null,
            auto_pay: Boolean(b.auto_pay),
            active: b.active !== undefined ? Boolean(b.active) : true,
            notes: b.notes || ''
        };

        if (isMongoConnected()) {
            await KhataKitFixedExpense.findOneAndUpdate({ _id: id, user_id: userId }, updateData);
        } else {
            const userStore = getUserFallback(userId);
            const idx = userStore.fixed_expenses.findIndex(f => String(f.id) === String(id));
            if (idx !== -1) {
                userStore.fixed_expenses[idx] = { ...userStore.fixed_expenses[idx], ...updateData };
                saveLocalStore();
            }
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.delete('/fixed/:id', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const { id } = req.params;
        if (isMongoConnected()) {
            await Promise.all([
                KhataKitFixedExpense.findOneAndDelete({ _id: id, user_id: userId }),
                KhataKitMonthlyPayment.deleteMany({ user_id: userId, item_type: 'fixed', item_id: String(id) })
            ]);
        } else {
            const userStore = getUserFallback(userId);
            userStore.fixed_expenses = userStore.fixed_expenses.filter(f => String(f.id) !== String(id));
            userStore.monthly_payments = userStore.monthly_payments.filter(
                p => !(p.item_type === 'fixed' && String(p.item_id) === String(id))
            );
            saveLocalStore();
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 6. ONE-TIME SPENDS CRUD (Supports UPI/Cash/Bank OR Credit Card)
router.post('/spends', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const b = req.body || {};
        const cardId = (b.card_id && String(b.card_id).trim() && String(b.card_id) !== 'none')
            ? String(b.card_id).trim()
            : null;
        const spendData = {
            user_id: userId,
            card_id: cardId,
            payment_method: b.payment_method || (cardId ? 'Credit Card' : 'UPI / Cash / Bank'),
            title: b.title || 'One-Time Spend',
            category: b.category || 'Shopping',
            amount: Number(b.amount) || 0,
            month: b.month || '2026-11',
            spend_date: b.spend_date || new Date().toISOString().slice(0, 10),
            notes: b.notes || ''
        };

        if (isMongoConnected()) {
            const created = await KhataKitCardSpend.create(spendData);
            return res.status(201).json({ id: created._id.toString() });
        } else {
            const userStore = getUserFallback(userId);
            const newId = 's_' + Date.now();
            userStore.card_spends.push({ id: newId, ...spendData });
            saveLocalStore();
            return res.status(201).json({ id: newId });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.delete('/spends/:id', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const { id } = req.params;
        if (isMongoConnected()) {
            await KhataKitCardSpend.findOneAndDelete({ _id: id, user_id: userId });
        } else {
            const userStore = getUserFallback(userId);
            userStore.card_spends = userStore.card_spends.filter(s => String(s.id) !== String(id));
            saveLocalStore();
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 6B. ONE-TIME INCOMES CRUD
router.post('/incomes', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const b = req.body || {};
        const incomeData = {
            user_id: userId,
            title: b.title || 'Income',
            category: b.category || 'Salary / Business',
            amount: Number(b.amount) || 0,
            month: b.month || '2026-11',
            income_date: b.income_date || new Date().toISOString().slice(0, 10),
            payment_mode: b.payment_mode || 'Bank / UPI',
            notes: b.notes || ''
        };

        if (isMongoConnected()) {
            const created = await KhataKitIncome.create(incomeData);
            return res.status(201).json({ id: created._id.toString() });
        } else {
            const userStore = getUserFallback(userId);
            const newId = 'inc_' + Date.now();
            userStore.incomes.push({ id: newId, ...incomeData });
            saveLocalStore();
            return res.status(201).json({ id: newId });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.delete('/incomes/:id', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const { id } = req.params;
        if (isMongoConnected()) {
            await KhataKitIncome.findOneAndDelete({ _id: id, user_id: userId });
        } else {
            const userStore = getUserFallback(userId);
            userStore.incomes = (userStore.incomes || []).filter(inc => String(inc.id) !== String(id));
            saveLocalStore();
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 6C. INVESTMENTS & SIP PORTFOLIO CRUD
router.post('/investments', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const b = req.body || {};
        const totalInvested = Number(b.total_invested) || 0;
        const currentValue = (b.current_value !== undefined && b.current_value !== '' && Number(b.current_value) >= 0)
            ? Number(b.current_value)
            : totalInvested;

        const invData = {
            user_id: userId,
            title: b.title || 'New Investment',
            asset_type: b.asset_type || 'Mutual Fund / SIP',
            investment_mode: b.investment_mode || 'SIP (Monthly)',
            monthly_sip_amount: Number(b.monthly_sip_amount) || 0,
            total_invested: totalInvested,
            current_value: currentValue,
            expected_return_rate: Number(b.expected_return_rate) || 12,
            platform: b.platform || '',
            sip_day: Number(b.sip_day) || 5,
            start_date: b.start_date || new Date().toISOString().slice(0, 10),
            status: b.status || 'active',
            notes: b.notes || ''
        };

        if (isMongoConnected()) {
            const created = await KhataKitInvestment.create(invData);
            return res.status(201).json({ id: created._id.toString() });
        } else {
            const userStore = getUserFallback(userId);
            const newId = 'inv_' + Date.now();
            userStore.investments.unshift({ id: newId, ...invData });
            saveLocalStore();
            return res.status(201).json({ id: newId });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.put('/investments/:id', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const { id } = req.params;
        const b = req.body || {};
        const totalInvested = Number(b.total_invested) || 0;
        const currentValue = (b.current_value !== undefined && b.current_value !== '' && Number(b.current_value) >= 0)
            ? Number(b.current_value)
            : totalInvested;

        const updateData = {
            title: b.title || 'Investment',
            asset_type: b.asset_type || 'Mutual Fund / SIP',
            investment_mode: b.investment_mode || 'SIP (Monthly)',
            monthly_sip_amount: Number(b.monthly_sip_amount) || 0,
            total_invested: totalInvested,
            current_value: currentValue,
            expected_return_rate: Number(b.expected_return_rate) || 12,
            platform: b.platform || '',
            sip_day: Number(b.sip_day) || 5,
            start_date: b.start_date || '',
            status: b.status || 'active',
            notes: b.notes || ''
        };

        if (isMongoConnected()) {
            await KhataKitInvestment.findOneAndUpdate({ _id: id, user_id: userId }, updateData);
        } else {
            const userStore = getUserFallback(userId);
            const idx = (userStore.investments || []).findIndex(x => String(x.id) === String(id));
            if (idx !== -1) {
                userStore.investments[idx] = { ...userStore.investments[idx], ...updateData };
                saveLocalStore();
            }
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.delete('/investments/:id', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const { id } = req.params;
        if (isMongoConnected()) {
            await KhataKitInvestment.findOneAndDelete({ _id: id, user_id: userId });
        } else {
            const userStore = getUserFallback(userId);
            userStore.investments = (userStore.investments || []).filter(x => String(x.id) !== String(id));
            saveLocalStore();
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 7. PAYMENTS TOGGLE & PAY FULL CARD STATEMENT
router.post('/payments/toggle', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const b = req.body || {};
        const month = b.month || '2026-11';
        const itemType = b.item_type;
        const itemId = String(b.item_id);
        const isPaid = Boolean(b.is_paid);
        const paidAmount = Number(b.paid_amount) || 0;
        const paidDate = isPaid ? (b.paid_date || new Date().toISOString().slice(0, 10)) : '';
        const notes = b.notes || '';

        if (isMongoConnected()) {
            await KhataKitMonthlyPayment.updateOne(
                { user_id: userId, month, item_type: itemType, item_id: itemId },
                {
                    $set: {
                        user_id: userId,
                        paid_amount: paidAmount,
                        is_paid: isPaid,
                        paid_date: paidDate,
                        notes
                    }
                },
                { upsert: true }
            );
        } else {
            const userStore = getUserFallback(userId);
            const idx = userStore.monthly_payments.findIndex(
                p => p.month === month && p.item_type === itemType && String(p.item_id) === itemId
            );
            if (idx !== -1) {
                userStore.monthly_payments[idx] = {
                    ...userStore.monthly_payments[idx],
                    paid_amount: paidAmount,
                    is_paid: isPaid,
                    paid_date: paidDate,
                    notes
                };
            } else {
                userStore.monthly_payments.push({
                    id: 'p_' + Date.now(),
                    user_id: userId,
                    month,
                    item_type: itemType,
                    item_id: itemId,
                    paid_amount: paidAmount,
                    is_paid: isPaid,
                    paid_date: paidDate,
                    notes
                });
            }
            saveLocalStore();
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.post('/payments/pay-card', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const b = req.body || {};
        const month = b.month || '2026-11';
        const cardId = String(b.card_id);
        const isPaid = Boolean(b.is_paid);
        const today = isPaid ? new Date().toISOString().slice(0, 10) : '';

        const payload = await buildMonthPayload(userId, month);
        const cardSummary = payload.cards.find(c => String(c.id) === cardId);
        if (!cardSummary) {
            return res.status(404).json({ error: 'Card not found' });
        }

        const upsertPayment = async (itemType, itemId, paidAmount, noteText) => {
            if (isMongoConnected()) {
                await KhataKitMonthlyPayment.updateOne(
                    { user_id: userId, month, item_type: itemType, item_id: String(itemId) },
                    {
                        $set: {
                            user_id: userId,
                            paid_amount: Number(paidAmount) || 0,
                            is_paid: isPaid,
                            paid_date: today,
                            notes: noteText
                        }
                    },
                    { upsert: true }
                );
            } else {
                const userStore = getUserFallback(userId);
                const idx = userStore.monthly_payments.findIndex(
                    p => p.month === month && p.item_type === itemType && String(p.item_id) === String(itemId)
                );
                if (idx !== -1) {
                    userStore.monthly_payments[idx] = {
                        ...userStore.monthly_payments[idx],
                        paid_amount: Number(paidAmount) || 0,
                        is_paid: isPaid,
                        paid_date: today,
                        notes: noteText
                    };
                } else {
                    userStore.monthly_payments.push({
                        id: 'p_' + Date.now() + '_' + Math.random(),
                        user_id: userId,
                        month,
                        item_type: itemType,
                        item_id: String(itemId),
                        paid_amount: Number(paidAmount) || 0,
                        is_paid: isPaid,
                        paid_date: today,
                        notes: noteText
                    });
                }
            }
        };

        for (const e of cardSummary.emis) {
            await upsertPayment('emi', e.id, e.paid_amount_this_month, 'Card statement payment');
        }
        for (const f of cardSummary.fixed_bills) {
            await upsertPayment('fixed', f.id, f.paid_amount_this_month, 'Card statement payment');
        }
        await upsertPayment('card_bill', cardId, cardSummary.statement_total, 'Full card statement');

        if (!isMongoConnected()) saveLocalStore();
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 8. BACKUP EXPORT / IMPORT / CLEAR ALL (Per User)
router.get('/backup/export', async (req, res) => {
    try {
        const userId = req.khataUserId;
        await ensureUserSettings(userId);
        if (isMongoConnected()) {
            const [settings, cards, emis, fixed_expenses, card_spends, monthly_payments] = await Promise.all([
                KhataKitSetting.find({ user_id: userId }),
                KhataKitCard.find({ user_id: userId }),
                KhataKitEmi.find({ user_id: userId }),
                KhataKitFixedExpense.find({ user_id: userId }),
                KhataKitCardSpend.find({ user_id: userId }),
                KhataKitMonthlyPayment.find({ user_id: userId })
            ]);
            return res.json({
                exported_at: new Date().toISOString(),
                user_id: userId,
                database: 'MongoDB',
                settings: settings.map(s => ({ key: s.key, value: s.value })),
                cards: cards.map(c => c.toJSON()),
                emis: emis.map(e => e.toJSON()),
                fixed_expenses: fixed_expenses.map(f => f.toJSON()),
                card_spends: card_spends.map(s => s.toJSON()),
                monthly_payments: monthly_payments.map(p => p.toJSON())
            });
        }

        const userStore = getUserFallback(userId);
        return res.json({
            exported_at: new Date().toISOString(),
            user_id: userId,
            database: 'Local Persistent DB',
            settings: Object.entries(userStore.settings).map(([key, value]) => ({ key, value })),
            cards: userStore.cards,
            emis: userStore.emis,
            fixed_expenses: userStore.fixed_expenses,
            card_spends: userStore.card_spends,
            monthly_payments: userStore.monthly_payments
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.post('/backup/import', async (req, res) => {
    try {
        const userId = req.khataUserId;
        const b = req.body || {};
        if (isMongoConnected()) {
            await Promise.all([
                KhataKitMonthlyPayment.deleteMany({ user_id: userId }),
                KhataKitCardSpend.deleteMany({ user_id: userId }),
                KhataKitEmi.deleteMany({ user_id: userId }),
                KhataKitFixedExpense.deleteMany({ user_id: userId }),
                KhataKitCard.deleteMany({ user_id: userId })
            ]);

            if (Array.isArray(b.settings)) {
                for (const s of b.settings) {
                    if (s && s.key) {
                        await KhataKitSetting.updateOne(
                            { user_id: userId, key: s.key },
                            { $set: { user_id: userId, key: s.key, value: String(s.value ?? '') } },
                            { upsert: true }
                        );
                    }
                }
            }

            const cardIdMap = new Map();
            const emiIdMap = new Map();
            const fixedIdMap = new Map();

            if (Array.isArray(b.cards)) {
                for (const c of b.cards) {
                    const created = await KhataKitCard.create({
                        user_id: userId,
                        name: c.name || 'Unnamed Card',
                        bank: c.bank || '',
                        last4: c.last4 || '',
                        card_type: c.card_type || 'Credit Card',
                        credit_limit: Number(c.credit_limit) || 0,
                        billing_day: Number(c.billing_day) || 15,
                        due_day: Number(c.due_day) || 5,
                        color: c.color || '#f97316',
                        notes: c.notes || ''
                    });
                    if (c.id !== undefined) cardIdMap.set(String(c.id), created._id.toString());
                }
            }

            if (Array.isArray(b.emis)) {
                for (const e of b.emis) {
                    const mappedCardId = e.card_id ? (cardIdMap.get(String(e.card_id)) || String(e.card_id)) : null;
                    const created = await KhataKitEmi.create({
                        user_id: userId,
                        title: e.title || 'EMI',
                        card_id: mappedCardId,
                        category: e.category || 'Electronics',
                        total_principal: Number(e.total_principal) || 0,
                        monthly_emi: Number(e.monthly_emi) || 0,
                        interest_rate: Number(e.interest_rate) || 0,
                        processing_fee: Number(e.processing_fee) || 0,
                        total_months: Number(e.total_months) || 6,
                        start_month: e.start_month || '2026-11',
                        due_day: Number(e.due_day) || 5,
                        status: e.status || 'active',
                        notes: e.notes || ''
                    });
                    if (e.id !== undefined) emiIdMap.set(String(e.id), created._id.toString());
                }
            }

            if (Array.isArray(b.fixed_expenses)) {
                for (const f of b.fixed_expenses) {
                    const mappedCardId = f.card_id ? (cardIdMap.get(String(f.card_id)) || String(f.card_id)) : null;
                    const created = await KhataKitFixedExpense.create({
                        user_id: userId,
                        title: f.title || 'Fixed Expense',
                        category: f.category || 'Rent & Housing',
                        amount: Number(f.amount) || 0,
                        frequency: f.frequency || 'monthly',
                        start_month: f.start_month || '2026-01',
                        due_day: Number(f.due_day) || 5,
                        payment_method: f.payment_method || 'UPI / Bank Transfer',
                        card_id: mappedCardId,
                        auto_pay: Boolean(f.auto_pay),
                        active: f.active !== undefined ? Boolean(f.active) : true,
                        notes: f.notes || ''
                    });
                    if (f.id !== undefined) fixedIdMap.set(String(f.id), created._id.toString());
                }
            }

            if (Array.isArray(b.card_spends)) {
                for (const s of b.card_spends) {
                    const mappedCardId = cardIdMap.get(String(s.card_id)) || String(s.card_id);
                    await KhataKitCardSpend.create({
                        user_id: userId,
                        card_id: mappedCardId,
                        title: s.title || 'Card Spend',
                        category: s.category || 'Shopping',
                        amount: Number(s.amount) || 0,
                        month: s.month || '2026-11',
                        spend_date: s.spend_date || '',
                        notes: s.notes || ''
                    });
                }
            }

            if (Array.isArray(b.monthly_payments)) {
                for (const p of b.monthly_payments) {
                    let mappedItemId = String(p.item_id);
                    if (p.item_type === 'emi' && emiIdMap.has(mappedItemId)) mappedItemId = emiIdMap.get(mappedItemId);
                    if (p.item_type === 'fixed' && fixedIdMap.has(mappedItemId)) mappedItemId = fixedIdMap.get(mappedItemId);
                    if (p.item_type === 'card_bill' && cardIdMap.has(mappedItemId)) mappedItemId = cardIdMap.get(mappedItemId);

                    await KhataKitMonthlyPayment.updateOne(
                        { user_id: userId, month: p.month, item_type: p.item_type, item_id: mappedItemId },
                        {
                            $set: {
                                user_id: userId,
                                paid_amount: Number(p.paid_amount) || 0,
                                is_paid: Boolean(p.is_paid),
                                paid_date: p.paid_date || '',
                                notes: p.notes || ''
                            }
                        },
                        { upsert: true }
                    );
                }
            }

            return res.json({ ok: true });
        }

        // Fallback import for user
        const userStore = getUserFallback(userId);
        if (Array.isArray(b.settings)) {
            for (const s of b.settings) {
                if (s && s.key) userStore.settings[s.key] = String(s.value ?? '');
            }
        }
        userStore.cards = Array.isArray(b.cards) ? b.cards.map(c => ({ ...c, user_id: userId, id: String(c.id) })) : [];
        userStore.emis = Array.isArray(b.emis) ? b.emis.map(e => ({ ...e, user_id: userId, id: String(e.id), card_id: e.card_id ? String(e.card_id) : null })) : [];
        userStore.fixed_expenses = Array.isArray(b.fixed_expenses) ? b.fixed_expenses.map(f => ({ ...f, user_id: userId, id: String(f.id), card_id: f.card_id ? String(f.card_id) : null })) : [];
        userStore.card_spends = Array.isArray(b.card_spends) ? b.card_spends.map(s => ({ ...s, user_id: userId, id: String(s.id), card_id: String(s.card_id) })) : [];
        userStore.monthly_payments = Array.isArray(b.monthly_payments) ? b.monthly_payments.map(p => ({ ...p, user_id: userId, id: String(p.id), item_id: String(p.item_id) })) : [];
        saveLocalStore();
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.post('/backup/clear-all', async (req, res) => {
    try {
        const userId = req.khataUserId;
        if (isMongoConnected()) {
            await Promise.all([
                KhataKitMonthlyPayment.deleteMany({ user_id: userId }),
                KhataKitCardSpend.deleteMany({ user_id: userId }),
                KhataKitEmi.deleteMany({ user_id: userId }),
                KhataKitFixedExpense.deleteMany({ user_id: userId }),
                KhataKitCard.deleteMany({ user_id: userId })
            ]);
        } else {
            const userStore = getUserFallback(userId);
            userStore.cards = [];
            userStore.emis = [];
            userStore.fixed_expenses = [];
            userStore.card_spends = [];
            userStore.monthly_payments = [];
            saveLocalStore();
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
