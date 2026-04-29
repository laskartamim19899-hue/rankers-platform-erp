"use client";

import { useState, useEffect } from "react";
import { inventoryApi, studentApi } from "@/lib/api";
import Link from "next/link";
import { exportToCSV } from "@/lib/utils";

const CATEGORIES = ["BOOK", "EQUIPMENT", "STATIONERY", "OTHER"];
const CAT_COLORS: Record<string, string> = {
  BOOK: "bg-blue-50 text-blue-700 border-blue-200",
  EQUIPMENT: "bg-purple-50 text-purple-700 border-purple-200",
  STATIONERY: "bg-green-50 text-green-700 border-green-200",
  OTHER: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stock" | "issued">("stock");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showIssueItem, setShowIssueItem] = useState<any>(null);

  const [itemForm, setItemForm] = useState({ name: "", category: "BOOK", totalQty: 1, description: "" });
  const [issueForm, setIssueForm] = useState({ studentId: "", dueDate: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExport = () => {
    if (activeTab === "stock") {
      const exportData = items.map(item => ({
        "Item Name": item.name,
        "Category": item.category,
        "Total Quantity": item.totalQty,
        "Available": item.availableQty,
        "Description": item.description || ""
      }));
      exportToCSV(exportData, "Inventory_Stock");
    } else {
      const exportData = issues.map(issue => ({
        "Item Name": issue.item?.name,
        "Student Name": issue.student?.user?.name,
        "Registration No": issue.student?.regNo,
        "Issued On": new Date(issue.issuedOn).toLocaleDateString(),
        "Due Date": new Date(issue.dueDate).toLocaleDateString(),
        "Returned On": issue.returnedOn ? new Date(issue.returnedOn).toLocaleDateString() : "PENDING",
        "Condition": issue.condition || "N/A"
      }));
      exportToCSV(exportData, "Inventory_Issues");
    }
  };

  const fetchData = async () => {
    try {
      const [itemsRes, issuesRes, studentsRes] = await Promise.all([
        inventoryApi.getAll(),
        inventoryApi.getAllIssues(),
        studentApi.getAll(),
      ]);
      setItems(itemsRes.data);
      setIssues(issuesRes.data);
      setStudents(studentsRes.data.filter((s: any) => s.status === "APPROVED"));
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await inventoryApi.create(itemForm);
      await fetchData();
      setShowAddItem(false);
      setItemForm({ name: "", category: "BOOK", totalQty: 1, description: "" });
    } catch { alert("Failed to add item"); }
    finally { setIsSubmitting(false); }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showIssueItem) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.issue({ itemId: showIssueItem.id, ...issueForm });
      await fetchData();
      setShowIssueItem(null);
      setIssueForm({ studentId: "", dueDate: "" });
      alert("✅ Item issued successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to issue item");
    } finally { setIsSubmitting(false); }
  };

  const handleReturn = async (issueId: string) => {
    if (!confirm("Mark this item as returned?")) return;
    try {
      await inventoryApi.return(issueId, { condition: "GOOD" });
      await fetchData();
    } catch { alert("Failed to process return"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item from inventory?")) return;
    try {
      await inventoryApi.delete(id);
      await fetchData();
    } catch { alert("Failed to delete"); }
  };

  const pendingIssues = issues.filter(i => !i.returnedOn);
  const overdueIssues = pendingIssues.filter(i => new Date(i.dueDate) < new Date());
  const lowStockItems = items.filter(i => i.availableQty <= 2);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined">arrow_back</span></Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center"><span className="material-symbols-outlined text-purple-600">inventory_2</span></div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Inventory & Library</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Stock Management & Issue Tracker</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="bg-white text-slate-600 border-2 border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            CSV
          </button>
          <button onClick={() => setShowAddItem(true)} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-sm">add</span> Add Item
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Items</p>
            <p className="text-3xl font-black text-primary">{items.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-purple-200 p-5 shadow-sm">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Currently Issued</p>
            <p className="text-3xl font-black text-purple-600">{pendingIssues.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Overdue Returns</p>
            <p className="text-3xl font-black text-red-600">{overdueIssues.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Low Stock</p>
            <p className="text-3xl font-black text-amber-600">{lowStockItems.length}</p>
          </div>
        </div>

        {overdueIssues.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">warning</span>
            <div>
              <p className="font-black text-red-900">{overdueIssues.length} item{overdueIssues.length > 1 ? 's are' : ' is'} overdue for return!</p>
              <p className="text-sm text-red-700">Please follow up with the respective students immediately.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-2xl overflow-hidden">
          {(['stock', 'issued'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
              {tab === 'stock' ? '📦 Stock Register' : `📋 Issued Items (${pendingIssues.length})`}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div></div>
        ) : activeTab === "stock" ? (
          <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Name</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Issued</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      {item.description && <p className="text-xs text-slate-400">{item.description}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${CAT_COLORS[item.category]}`}>{item.category}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{item.totalQty}</td>
                    <td className="px-6 py-4">
                      <span className={`font-black text-lg ${item.availableQty <= 2 ? 'text-red-600' : 'text-emerald-600'}`}>{item.availableQty}</span>
                      {item.availableQty <= 2 && <span className="block text-[9px] text-red-500 font-black uppercase">LOW STOCK</span>}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-500">{item.issues?.length || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setShowIssueItem(item)} disabled={item.availableQty === 0}
                          className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-30" title="Issue to Student">
                          <span className="material-symbols-outlined text-sm">assignment_ind</span>
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all" title="Delete">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold">No inventory items yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Issued On</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {issues.map(issue => {
                  const overdue = !issue.returnedOn && new Date(issue.dueDate) < new Date();
                  return (
                    <tr key={issue.id} className={`hover:bg-slate-50 ${overdue ? 'bg-red-50/30' : ''}`}>
                      <td className="px-6 py-4 font-bold text-slate-900">{issue.item?.name}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold">{issue.student?.user?.name}</p>
                        <p className="text-[10px] text-slate-400">{issue.student?.regNo}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{new Date(issue.issuedOn).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={overdue ? 'text-red-600 font-black' : 'text-slate-600'}>{new Date(issue.dueDate).toLocaleDateString('en-IN')}</span>
                        {overdue && <span className="block text-[9px] text-red-500 font-black">OVERDUE</span>}
                      </td>
                      <td className="px-6 py-4">
                        {issue.returnedOn
                          ? <span className="text-[10px] font-black px-2 py-1 bg-green-100 text-green-700 rounded-full">Returned</span>
                          : overdue
                            ? <span className="text-[10px] font-black px-2 py-1 bg-red-100 text-red-700 rounded-full">Overdue</span>
                            : <span className="text-[10px] font-black px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Issued</span>}
                      </td>
                      <td className="px-6 py-4">
                        {!issue.returnedOn && (
                          <button onClick={() => handleReturn(issue.id)} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all" title="Mark Returned">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {issues.length === 0 && (
                  <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold">No items have been issued yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-black text-xl">Add Inventory Item</h2>
              <button onClick={() => setShowAddItem(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Item Name *</label>
                <input required type="text" placeholder="e.g. HC Verma Vol. 1" value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Category *</label>
                  <select value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none font-bold">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Quantity *</label>
                  <input required type="number" min="1" value={itemForm.totalQty} onChange={e => setItemForm({ ...itemForm, totalQty: parseInt(e.target.value) })} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none font-bold" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description (optional)</label>
                <input type="text" placeholder="Edition, author, notes..." value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddItem(false)} className="flex-1 h-11 border-2 border-slate-200 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-11 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50">{isSubmitting ? "Adding..." : "Add Item"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Item Modal */}
      {showIssueItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-black text-xl">Issue Item</h2>
                <p className="text-xs text-primary font-bold">{showIssueItem.name} — {showIssueItem.availableQty} available</p>
              </div>
              <button onClick={() => setShowIssueItem(null)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleIssue} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Student *</label>
                <select required value={issueForm.studentId} onChange={e => setIssueForm({ ...issueForm, studentId: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-700">
                  <option value="">-- Select Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.user.name} ({s.regNo})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Return Due Date *</label>
                <input required type="date" value={issueForm.dueDate} onChange={e => setIssueForm({ ...issueForm, dueDate: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none font-bold" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowIssueItem(null)} className="flex-1 h-11 border-2 border-slate-200 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-11 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50">{isSubmitting ? "Issuing..." : "Issue Item"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
