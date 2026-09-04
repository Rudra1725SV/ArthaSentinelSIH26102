"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/AppSidebar";
import { ALL_AUDIT_EVENTS } from "@/lib/mock-data";

export default function AuditTrailPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actorFilter, setActorFilter] = useState("ALL");

  const filteredEvents = useMemo(() => {
    return ALL_AUDIT_EVENTS.filter((evt) => {
      if (actorFilter !== "ALL" && evt.actorType !== actorFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          evt.action.toLowerCase().includes(q) ||
          evt.object.toLowerCase().includes(q) ||
          evt.actor.toLowerCase().includes(q) ||
          evt.result.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchTerm, actorFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <div className="font-emphasis text-xs font-bold tracking-wider text-slate-600 uppercase">
            IMMUTABLE COMPLIANCE LEDGER · AUDIT TRAIL
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950 mt-1">Audit Trail</h1>
          <p className="font-sans text-sm sm:text-base text-slate-600 mt-1">
            Chronological record of automated anomaly detections, investigator reviews, and vigilance escalations.
          </p>
        </div>

        {/* Filters in Inter */}
        <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-2xs">
          <div className="relative flex-1 min-w-[240px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by work ID, action, actor, or outcome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 font-sans text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-sans text-xs sm:text-sm font-semibold text-slate-700"
          >
            <option value="ALL">All Actors</option>
            <option value="system">System (AI Engine)</option>
            <option value="investigator">Investigator</option>
            <option value="supervisor">Supervisor / Vigilance</option>
          </select>
        </div>

        <div className="text-xs font-data text-slate-500">{filteredEvents.length} recorded events matching query</div>

        {/* Chronological Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="space-y-0">
            {filteredEvents.map((evt, idx) => {
              const targetWorkId = evt.object.startsWith("INV-") ? undefined : evt.object.split(" ")[0];

              return (
                <div key={evt.id || idx} className="flex gap-4 py-4 border-l-2 border-slate-200 pl-6 ml-3 relative group hover:border-blue-400 transition-colors">
                  {/* Dot */}
                  <div className={`absolute -left-[9px] top-[22px] w-4 h-4 rounded-full border-2 transition-transform group-hover:scale-125 ${
                    evt.actorType === "system" ? "bg-blue-100 border-blue-600" :
                    evt.actorType === "supervisor" ? "bg-orange-100 border-orange-600" :
                    "bg-emerald-100 border-emerald-600"
                  }`}></div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-sans text-sm font-bold text-slate-900">{evt.action}</span>
                      <span className="text-slate-300">·</span>
                      {targetWorkId ? (
                        <Link href={`/investigations/${targetWorkId}`} className="font-data text-xs font-bold text-blue-700 hover:underline">
                          {evt.object}
                        </Link>
                      ) : (
                        <span className="font-data text-xs font-bold text-slate-700">{evt.object}</span>
                      )}
                      <span className={`font-emphasis text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        evt.actorType === "system" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        evt.actorType === "supervisor" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                        "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {evt.actorType}
                      </span>
                    </div>

                    <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed">{evt.result}</p>

                    <div className="font-data text-[11px] text-slate-400 pt-1">
                      <span>{evt.actor}</span>
                      <span className="mx-2">·</span>
                      <span>
                        {new Date(evt.timestamp).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
