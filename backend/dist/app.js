"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const finance_routes_1 = __importDefault(require("./routes/finance.routes"));
const academic_routes_1 = __importDefault(require("./routes/academic.routes"));
const residential_routes_1 = __importDefault(require("./routes/residential.routes"));
const communication_routes_1 = __importDefault(require("./routes/communication.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const inquiry_routes_1 = __importDefault(require("./routes/inquiry.routes"));
const leave_routes_1 = __importDefault(require("./routes/leave.routes"));
const timetable_routes_1 = __importDefault(require("./routes/timetable.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const merit_routes_1 = __importDefault(require("./routes/merit.routes"));
const salary_routes_1 = __importDefault(require("./routes/salary.routes"));
const guest_routes_1 = __importDefault(require("./routes/guest.routes"));
const data_routes_1 = __importDefault(require("./routes/data.routes"));
const transport_routes_1 = __importDefault(require("./routes/transport.routes"));
const certificate_routes_1 = __importDefault(require("./routes/certificate.routes"));
const otherIncome_routes_1 = __importDefault(require("./routes/otherIncome.routes"));
const cbt_routes_1 = __importDefault(require("./routes/cbt.routes"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({ origin: '*' }));
// Security Middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
}));
app.use('/uploads', express_1.default.static('uploads'));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/students', student_routes_1.default);
app.use('/api/finance', finance_routes_1.default);
app.use('/api/academic', academic_routes_1.default);
app.use('/api/residential', residential_routes_1.default);
app.use('/api/communication', communication_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/expenses', expense_routes_1.default);
app.use('/api/transactions', transaction_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/inquiries', inquiry_routes_1.default);
app.use('/api/leaves', leave_routes_1.default);
app.use('/api/timetable', timetable_routes_1.default);
app.use('/api/inventory', inventory_routes_1.default);
app.use('/api/merit', merit_routes_1.default);
app.use('/api/salary', salary_routes_1.default);
app.use('/api/guest', guest_routes_1.default);
app.use('/api/data', data_routes_1.default);
app.use('/api/transport', transport_routes_1.default);
app.use('/api/certificates', certificate_routes_1.default);
app.use('/api/other-income', otherIncome_routes_1.default);
app.use('/api/cbt', cbt_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map