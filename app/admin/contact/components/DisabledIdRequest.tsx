"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface RequestItem {
  _id: string;
  userName: string;
  userEmail: string;
  reason: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // States for Custom Modal and Toggle Framework
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<RequestItem | null>(null);
  const [actionStatus, setActionStatus] = useState<"approved" | "rejected">("approved");
  const [replyText, setReplyText] = useState("");

  const getReasonLabel = (reason: string) => {
    return reason
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/disabled-requests/list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      } else {
        alert(data.message || "Failed to fetch requests");
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Open custom modal with default parameters
  const openReplyModal = (req: RequestItem) => {
    setSelectedReq(req);
    setActionStatus("approved"); // default toggle value
    setReplyText("");
    setIsModalOpen(true);
  };

  // 🔄 SUBMIT DISPATCHER FROM CUSTOM MODAL
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    const adminUserCookie = Cookies.get("adminUser");
    if (!adminUserCookie) {
      alert("Admin session not found! Please login again.");
      return;
    }

    if (!replyText.trim()) {
      alert("Please enter a reply message for the user.");
      return;
    }

    const adminData = JSON.parse(adminUserCookie);
    const adminEmail = adminData.email; // 1. Admin ki email cookies se
    const userEmail = selectedReq.userEmail; // 2. Target User ki email card data se
    const targetId = selectedReq._id;

    try {
      setActionLoading(targetId);
      setIsModalOpen(false); // Modal close immediately for UX smoothness

      const res = await fetch(`/api/admin/disabled-requests/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionStatus,
          adminEmail: adminEmail, // Admin Email passing here 🛡️
          userEmail: userEmail,   // User Email passing here 👤
          replyMessage: replyText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Action processed successfully! Request is now ${actionStatus}.`);
        fetchRequests();
      } else {
        alert(data.message || "Action execution failed");
      }
    } catch (err) {
      console.error("Error updating request documents:", err);
    } finally {
      setActionLoading(null);
      setSelectedReq(null);
    }
  };

  const handleEnableUserAccount = async (userEmail: string, requestId: string) => {
    try {
      setActionLoading(`${requestId}-enable`);
      const res = await fetch("/api/admin/enable-user-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("User account has been successfully enabled!");
      } else {
        alert(data.message || "Failed to enable account");
      }
    } catch (err) {
      console.error("Error enabling account:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050814] text-white p-6 md:p-10 relative">
      <div className="max-w-6xl mx-auto">

        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/10 bg-gradient-to-br from-blue-600/10 via-[#07101f] to-indigo-600/10 p-8 mb-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-blue-400 text-xs font-bold tracking-[0.2em] uppercase">Security Center</span>
              <h1 className="text-4xl font-black mt-2">Disabled ID Requests</h1>
              <p className="text-slate-400 mt-2 text-sm">Review, reply, and reactivate employee accounts securely.</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-slate-500 text-xs uppercase">Total Requests</p>
              <h2 className="text-5xl font-black text-blue-400">{requests.length}</h2>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-amber-500/10 bg-[#07101f] p-5">
            <p className="text-xs text-slate-500 uppercase">Pending</p>
            <h3 className="text-3xl font-black text-amber-400">{requests.filter((r) => r.status === "pending").length}</h3>
          </div>
          <div className="rounded-2xl border border-emerald-500/10 bg-[#07101f] p-5">
            <p className="text-xs text-slate-500 uppercase">Approved</p>
            <h3 className="text-3xl font-black text-emerald-400">{requests.filter((r) => r.status === "approved").length}</h3>
          </div>
          <div className="rounded-2xl border border-rose-500/10 bg-[#07101f] p-5">
            <p className="text-xs text-slate-500 uppercase">Rejected</p>
            <h3 className="text-3xl font-black text-rose-400">{requests.filter((r) => r.status === "rejected").length}</h3>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500">Fetching requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-blue-500/20 bg-[#07101f] p-16 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold">No Requests Found</h3>
            <p className="text-slate-400 mt-2">Everything looks good. No pending reactivation requests.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => (
              <div key={req._id} className="group relative overflow-hidden rounded-3xl border border-blue-500/10 bg-gradient-to-br from-[#081120] to-[#0f172a] p-6 transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-lg font-black text-white shadow-lg">
                      {req.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{req.userName}</h3>
                      <p className="text-blue-400 text-sm">{req.userEmail}</p>
                      <div className="mt-3">
                        <span className="text-[11px] uppercase tracking-wider text-slate-500">Reason</span>
                        <div className="mt-1">
                          <span className="inline-flex px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
                            {getReasonLabel(req.reason)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${req.status === "pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : req.status === "approved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-5">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">Appeal Message</p>
                  <p className="text-slate-300 leading-7">{req.message}</p>
                </div>

                {/* Footer Functional Row */}
                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="flex flex-col sm:flex-row gap-3">
                    
                    {/* Trigger Custom Modal */}
                    <button
                      onClick={() => openReplyModal(req)}
                      disabled={actionLoading !== null}
                      className="flex-1 h-11 rounded-xl border border-blue-500/30 bg-blue-600/10 text-blue-400 font-bold hover:bg-blue-600 hover:text-white transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                      <span>💬</span> Take Action & Reply
                    </button>

                    {/* Direct Activation */}
                    <button
                      onClick={() => handleEnableUserAccount(req.userEmail, req._id)}
                      disabled={actionLoading !== null}
                      className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all text-sm"
                    >
                      {actionLoading === `${req._id}-enable` ? "Enabling..." : "⚡ Quick Reactivate ID"}
                    </button>
                  </div>

                  <div className="mt-4 text-right text-xs text-slate-500">
                    Submitted on {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== CUSTOM PREMIUM ALIGNMENT DIALOG MODAL ==================== */}
      {isModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div 
            className="w-full max-w-lg bg-[#07101f] border border-gray-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all transform scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400" />
            
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
              <div>
                <h3 className="text-xl font-black text-white">Action & Feedback Control</h3>
                <p className="text-xs text-slate-400 mt-0.5">Replying to {selectedReq.userName}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 hover:text-white text-sm transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-5">
              
              {/* TOGGLE COMPONENT SEGMENT */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">
                  Select System Action Decision
                </label>
                <div className="grid grid-cols-2 p-1 bg-[#0b1526] border border-gray-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActionStatus("approved")}
                    className={`py-2 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      actionStatus === "approved"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>✓</span> APPROVE APPEAL
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionStatus("rejected")}
                    className={`py-2 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      actionStatus === "rejected"
                        ? "bg-rose-600 text-white shadow-md shadow-rose-900/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>✕</span> REJECT APPEAL
                  </button>
                </div>
              </div>

              {/* REPLY TEXTAREA */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">
                  Official Communication Remarks
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Enter specific resolution guidelines or verification notes to be sent to user's registered inbox..."
                  rows={4}
                  className="w-full bg-[#0b1526] border border-gray-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 resize-none transition-all"
                  required
                />
              </div>

              {/* MODAL ACTION EXECUTION FOOTER */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-gray-800 text-slate-300 font-bold text-xs hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 h-10 rounded-xl text-white font-bold text-xs transition-all shadow-md ${
                    actionStatus === "approved" 
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20" 
                      : "bg-rose-600 hover:bg-rose-500 shadow-rose-900/20"
                  }`}
                >
                  Submit & Dispatch Notification
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}