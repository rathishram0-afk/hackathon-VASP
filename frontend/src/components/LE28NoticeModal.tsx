"use client";

import { useState } from "react";
import { useForensicStore } from "@/store/useForensicStore";
import { ShieldAlert, X, CheckCircle, FileText, Lock, Send } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LE28NoticeModal() {
  const router = useRouter();
  const { isLE28ModalOpen, setLE28ModalOpen, le28Form, submitLE28Form, candidates } =
    useForensicStore();

  const [formData, setFormData] = useState({
    vaspName: le28Form.vaspName,
    targetAddress: le28Form.targetAddress,
    seizureAmountBtc: le28Form.seizureAmountBtc,
    urgencyLevel: le28Form.urgencyLevel,
    justificationText: le28Form.justificationText,
  });

  if (!isLE28ModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLE28Form(formData);
    setLE28ModalOpen(false);
    router.push("/notice");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-error-container/30 border border-error-container text-error">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-on-surface">
                FORM LE-28: ASSET FREEZE NOTICE
              </h3>
              <p className="font-mono text-xs text-outline">
                ISO/IEC 27037 Compliant Emergency Legal Order • Case #{le28Form.caseRef}
              </p>
            </div>
          </div>
          <button
            onClick={() => setLE28ModalOpen(false)}
            className="text-outline hover:text-on-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4">
          <div className="p-3 rounded-lg bg-error-container/10 border border-error-container/30 text-error-container text-xs flex items-start gap-2">
            <Lock className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
            <p className="text-on-surface-variant leading-relaxed">
              This notice commands the receiving Virtual Asset Service Provider (VASP) to
              immediately restrict outgoing transfers for the specified deposit address for 72
              hours pending formal mutual legal assistance treaty (MLAT) requests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target VASP */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs font-semibold text-outline uppercase tracking-wider">
                Target VASP / Exchange
              </label>
              <select
                value={formData.vaspName}
                onChange={(e) => setFormData({ ...formData, vaspName: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2 font-mono text-xs text-on-surface focus:outline-none focus:border-secondary-container"
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.confidenceScore}% Conf)
                  </option>
                ))}
              </select>
            </div>

            {/* Seizure Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs font-semibold text-outline uppercase tracking-wider">
                Seizure Value (BTC)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.seizureAmountBtc}
                onChange={(e) =>
                  setFormData({ ...formData, seizureAmountBtc: parseFloat(e.target.value) || 0 })
                }
                className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2 font-mono text-xs text-secondary-container font-semibold focus:outline-none focus:border-secondary-container"
              />
            </div>
          </div>

          {/* Deposit Address */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-xs font-semibold text-outline uppercase tracking-wider">
              Target Deposit Vault Address
            </label>
            <input
              type="text"
              value={formData.targetAddress}
              onChange={(e) => setFormData({ ...formData, targetAddress: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2 font-mono text-xs text-on-surface focus:outline-none focus:border-secondary-container"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-[10px] text-outline uppercase">Officer Name</span>
              <span className="font-mono text-xs text-on-surface font-semibold">
                {le28Form.officerName}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-[10px] text-outline uppercase">Badge ID</span>
              <span className="font-mono text-xs text-on-surface font-semibold">
                {le28Form.badgeNumber}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-[10px] text-outline uppercase">Agency</span>
              <span className="font-mono text-xs text-on-surface font-semibold">
                {le28Form.agencyName}
              </span>
            </div>
          </div>

          {/* Justification Text */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-xs font-semibold text-outline uppercase tracking-wider">
              Evidentiary Justification & Forensic Summary
            </label>
            <textarea
              rows={4}
              value={formData.justificationText}
              onChange={(e) => setFormData({ ...formData, justificationText: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-3 font-mono text-xs text-on-surface focus:outline-none focus:border-secondary-container"
            />
          </div>

          {/* Cryptographic Signature Preview */}
          <div className="p-3 rounded-lg bg-surface-container-highest/60 border border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <div className="flex flex-col">
                <span className="font-label-sm text-[10px] text-outline uppercase">
                  Digital ECDSA Secp256k1 Signature
                </span>
                <span className="font-mono text-[10px] text-secondary truncate max-w-sm">
                  SIG_ECDSA_Secp256k1_9918a77f00192a8847c...
                </span>
              </div>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={() => setLE28ModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-xs transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-error-container hover:bg-error text-on-primary-container font-label-md text-xs font-semibold transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>TRANSMIT FORM LE-28 NOTICE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
