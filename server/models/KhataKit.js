import mongoose from 'mongoose';

const toJsonConfig = {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};

// 1. Settings Schema (Per User)
const khataKitSettingSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true, trim: true },
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true }
}, {
    collection: 'khatakit_settings',
    timestamps: true,
    toJSON: toJsonConfig
});
khataKitSettingSchema.index({ user_id: 1, key: 1 }, { unique: true });

// 2. Credit / EMI Cards Schema (Per User)
const khataKitCardSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    bank: { type: String, default: '', trim: true },
    last4: { type: String, default: '', trim: true },
    card_type: { type: String, default: 'Credit Card' },
    credit_limit: { type: Number, default: 0 },
    billing_day: { type: Number, default: 15 },
    due_day: { type: Number, default: 5 },
    color: { type: String, default: '#f97316' },
    notes: { type: String, default: '' }
}, {
    collection: 'khatakit_cards',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: toJsonConfig
});

// 3. EMIs Schema (Per User)
const khataKitEmiSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    card_id: { type: String, default: null },
    category: { type: String, default: 'Electronics' },
    total_principal: { type: Number, required: true, default: 0 },
    monthly_emi: { type: Number, required: true, default: 0 },
    interest_rate: { type: Number, default: 0 },
    processing_fee: { type: Number, default: 0 },
    total_months: { type: Number, required: true, default: 6 },
    start_month: { type: String, required: true },
    due_day: { type: Number, default: 5 },
    status: { type: String, default: 'active', enum: ['active', 'completed', 'foreclosed'] },
    notes: { type: String, default: '' }
}, {
    collection: 'khatakit_emis',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: toJsonConfig
});

// 4. Recurring Fixed Expenses Schema (Per User)
const khataKitFixedExpenseSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'Rent & Housing' },
    amount: { type: Number, required: true, default: 0 },
    frequency: { type: String, default: 'monthly' },
    start_month: { type: String, default: '2026-01' },
    due_day: { type: Number, default: 5 },
    payment_method: { type: String, default: 'UPI / Bank Transfer' },
    card_id: { type: String, default: null },
    auto_pay: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    notes: { type: String, default: '' }
}, {
    collection: 'khatakit_fixed_expenses',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: toJsonConfig
});

// 5. One-Off / One-Time Spends Schema (Per User - supports UPI/Cash/Bank or Credit Card)
const khataKitCardSpendSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true, trim: true },
    card_id: { type: String, default: null },
    payment_method: { type: String, default: 'UPI / Cash / Bank' },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'Shopping' },
    amount: { type: Number, required: true, default: 0 },
    month: { type: String, required: true },
    spend_date: { type: String, default: '' },
    notes: { type: String, default: '' }
}, {
    collection: 'khatakit_card_spends',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: toJsonConfig
});

// 6. One-Time / Monthly Incomes Schema (Per User)
const khataKitIncomeSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'Salary / Business' },
    amount: { type: Number, required: true, default: 0 },
    month: { type: String, required: true },
    income_date: { type: String, default: '' },
    payment_mode: { type: String, default: 'Bank / UPI' },
    notes: { type: String, default: '' }
}, {
    collection: 'khatakit_incomes',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: toJsonConfig
});

// 7. Investments & SIP Portfolio Schema (Per User)
const khataKitInvestmentSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    asset_type: { type: String, default: 'Mutual Fund / SIP' },
    investment_mode: { type: String, default: 'SIP (Monthly)' },
    monthly_sip_amount: { type: Number, default: 0 },
    total_invested: { type: Number, required: true, default: 0 },
    current_value: { type: Number, default: 0 },
    expected_return_rate: { type: Number, default: 12 },
    platform: { type: String, default: '', trim: true },
    sip_day: { type: Number, default: 5 },
    start_date: { type: String, default: '' },
    status: { type: String, default: 'active', enum: ['active', 'paused', 'redeemed'] },
    notes: { type: String, default: '' }
}, {
    collection: 'khatakit_investments',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: toJsonConfig
});

// 8. Monthly Payments Status Schema (Per User)
const khataKitMonthlyPaymentSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true, trim: true },
    month: { type: String, required: true },
    item_type: { type: String, required: true, enum: ['emi', 'fixed', 'card_bill'] },
    item_id: { type: String, required: true },
    paid_amount: { type: Number, required: true, default: 0 },
    is_paid: { type: Boolean, default: false },
    paid_date: { type: String, default: '' },
    notes: { type: String, default: '' }
}, {
    collection: 'khatakit_monthly_payments',
    timestamps: true,
    toJSON: toJsonConfig
});

khataKitMonthlyPaymentSchema.index({ user_id: 1, month: 1, item_type: 1, item_id: 1 }, { unique: true });

export const KhataKitSetting = mongoose.model('KhataKitSetting', khataKitSettingSchema);
export const KhataKitCard = mongoose.model('KhataKitCard', khataKitCardSchema);
export const KhataKitEmi = mongoose.model('KhataKitEmi', khataKitEmiSchema);
export const KhataKitFixedExpense = mongoose.model('KhataKitFixedExpense', khataKitFixedExpenseSchema);
export const KhataKitCardSpend = mongoose.model('KhataKitCardSpend', khataKitCardSpendSchema);
export const KhataKitIncome = mongoose.model('KhataKitIncome', khataKitIncomeSchema);
export const KhataKitInvestment = mongoose.model('KhataKitInvestment', khataKitInvestmentSchema);
export const KhataKitMonthlyPayment = mongoose.model('KhataKitMonthlyPayment', khataKitMonthlyPaymentSchema);
