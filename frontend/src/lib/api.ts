import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject JWT token into requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  changePassword: (data: any) => api.post('/auth/change-password', data),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
};

export const studentApi = {
  create: (data: any) => api.post('/students', data),
  getAll: () => api.get('/students'),
  getPending: () => api.get('/students/pending'),
  approve: (id: string) => api.post(`/students/${id}/approve`),
  getById: (id: string) => api.get(`/students/${id}`),
  update: (id: string, data: any) => api.patch(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
  searchByRegNo: (regNo: string) => api.get(`/students/search/${regNo}`),
};

export const financeApi = {
  getFees: (studentId: string) => api.get(`/finance/student/${studentId}`),
  payFee: (paymentData: any) => api.post('/finance/payment', paymentData),
  getAllDues: () => api.get('/finance/dues'),
  allocate: (data: any) => api.post('/finance/allocate', data),
  getPayment: (id: string) => api.get(`/finance/payment/${id}`),
  deletePayment: (id: string) => api.delete(`/finance/payment/${id}`),
  ledgerSearch: (q: string) => api.get(`/finance/ledger/search`, { params: { q } }),
};

export const academicApi = {
  getSummary: (studentId: string) => api.get(`/academic/student/${studentId}`),
  getCourses: () => api.get('/academic/courses'),
  createCourse: (data: any) => api.post('/academic/courses', data),
  deleteCourse: (id: string) => api.delete(`/academic/courses/${id}`),
  getBatches: () => api.get('/academic/batches'),
  createBatch: (data: any) => api.post('/academic/batches', data),
  deleteBatch: (id: string) => api.delete(`/academic/batches/${id}`),
  assignTeacher: (id: string, teacherId: string) => api.patch(`/academic/batches/${id}/assign`, { teacherId }),
  getTeachers: () => api.get('/academic/teachers'),
  getTests: () => api.get('/academic/tests'),
  createTest: (data: any) => api.post('/academic/tests', data),
  addTestResult: (data: any) => api.post('/academic/results', data),
};

export const userApi = {
  getStaff: () => api.get('/users/staff'),
  createStaff: (data: any) => api.post('/users/staff', data),
  deleteStaff: (id: string) => api.delete(`/users/staff/${id}`),
  updateProfilePic: (formData: FormData) => api.post('/users/profile-pic', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  removeProfilePic: (userId: string) => api.delete('/users/profile-pic', { data: { userId } }),
};

export const inquiryApi = {
  apply: (data: any) => api.post('/inquiries/apply', data),
  getAll: () => api.get('/inquiries'),
  updateStatus: (id: string, status: string) => api.patch(`/inquiries/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/inquiries/${id}`),
};

export const residentialApi = {
  getHostels: () => api.get('/residential/hostels'),
  createHostel: (data: any) => api.post('/residential/hostels', data),
  deleteHostel: (id: string) => api.delete(`/residential/hostels/${id}`),
  allocate: (data: any) => api.post('/residential/allocate', data),
  deallocate: (studentId: string) => api.delete(`/residential/deallocate/${studentId}`),
};

export const communicationApi = {
  getAnnouncements: (audience?: string) => api.get('/communication', { params: { audience } }),
  createAnnouncement: (data: any) => api.post('/communication', data),
  deleteAnnouncement: (id: string) => api.delete(`/communication/${id}`),
};

export const reportApi = {
  getFinanceSummary: () => api.get('/reports/finance'),
  getAcademicAnalytics: () => api.get('/reports/academic'),
  getPayrollReport: () => api.get('/reports/payroll'),
};

export const expenseApi = {
  getAll: () => api.get('/expenses'),
  getById: (id: string) => api.get(`/expenses/${id}`),
  create: (data: any) => api.post('/expenses', data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

export const transactionApi = {
  getHistory: () => api.get('/transactions'),
  verify: (txnId: string) => api.get(`/transactions/verify/${encodeURIComponent(txnId)}`),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
  waiveLateFee: (feeId: string) => api.post(`/settings/waive-late-fee/${feeId}`),
};

export const leaveApi = {
  getAll: () => api.get('/leaves'),
  getById: (id: string) => api.get(`/leaves/${id}`),
  issue: (data: any) => api.post('/leaves', data),
  updateStatus: (id: string, data: any) => api.patch(`/leaves/${id}/status`, data),
  delete: (id: string) => api.delete(`/leaves/${id}`),
  apply: (data: any) => api.post('/leaves/apply', data),
  approve: (id: string, data: any) => api.patch(`/leaves/${id}/approve`, data),
  reject: (id: string) => api.patch(`/leaves/${id}/reject`, {}),
  checkStatus: (regNo: string) => api.get(`/leaves/status/${encodeURIComponent(regNo)}`),
};

export const timetableApi = {
  getAll: () => api.get('/timetable'),
  getByBatch: (batchId: string) => api.get(`/timetable/${batchId}`),
  upsert: (data: any) => api.post('/timetable', data),
  deleteSlot: (id: string) => api.delete(`/timetable/slot/${id}`),
};

export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  getAllIssues: () => api.get('/inventory/issues'),
  create: (data: any) => api.post('/inventory', data),
  issue: (data: any) => api.post('/inventory/issue', data),
  return: (id: string, data: any) => api.patch(`/inventory/return/${id}`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
};

export const meritApi = {
  getBoard: () => api.get('/merit'),
  autoAssign: () => api.post('/merit/auto-assign'),
  updateTier: (id: string, tier: string) => api.patch(`/merit/${id}/tier`, { scholarshipTier: tier }),
};

export const salaryApi = {
  getAll: () => api.get('/salary'),
  upsertProfile: (data: any) => api.post('/salary/profile', data),
  disburse: (data: any) => api.post('/salary/disburse', data),
  getRecord: (id: string) => api.get(`/salary/record/${id}`),
  getHistory: (profileId: string) => api.get(`/salary/history/${profileId}`),
  deleteRecord: (id: string) => api.delete(`/salary/record/${id}`),
};

export const guestApi = {
  getAll: () => api.get('/guest'),
  create: (data: any) => api.post('/guest', data),
  update: (id: string, data: any) => api.patch(`/guest/${id}`, data),
  remove: (id: string) => api.delete(`/guest/${id}`),
  pay: (data: any) => api.post('/guest/pay', data),
  getPayment: (id: string) => api.get(`/guest/payment/${id}`),
  getHistory: (id: string) => api.get(`/guest/history/${id}`),
  deletePayment: (id: string) => api.delete(`/guest/payment/${id}`),
};

export const dataApi = {
  export: () => api.get('/data/export'),
  reset: (confirmPhrase: string) => api.post('/data/reset', { confirmPhrase }),
  import: (payload: any) => api.post('/data/import', payload),
};

export default api;
