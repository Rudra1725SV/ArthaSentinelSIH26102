"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/AppSidebar";
import { ALL_AUDIT_EVENTS, formatTimestamp, AuditEvent } from "@/lib/mock-data";
import { getAuditTrail } from "@/lib/api";

export default function AuditTrailPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actorFilter, setActorFilter] = useState("ALL");
  const [events, setEvents] = useState<AuditEvent[]>(ALL_AUDIT_EVENTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    getAuditTrail(1, 50)
      .then((res) => {
        if (!isCancelled && res?.events) {
          setEvents(res.events);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) setIsLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
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
  }, [events, searchTerm, actorFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header Enclosed in Navy Blue Flexbox Container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-[#0B1528] text-white border border-[#1E3A8A]/40 shadow-lg">
          <div className="space-y-1.5">
            <div className="font-emphasis text-xs sm:text-sm font-bold tracking-wider text-orange-400 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              IMMUTABLE COMPLIANCE LEDGER · AUDIT TRAIL
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Audit Trail</h1>
            <p className="font-sans text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Chronological record of automated data ingestion pipelines, validation results, and investigator reviews.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-300 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 shrink-0">
            <span>EVENTS: <strong className="text-white">{filteredEvents.length}</strong></span>
            <span className="text-white/20">|</span>
            <span className="text-emerald-400">VERIFIED LOGS</span>
          </div>
        </div>

        {/* Filters in Inter */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4">
          <div className="relative flex-1 min-w-[240px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by work ID, action, actor, or outcome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 font-sans text-sm sm:text-base bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 font-sans text-sm sm:text-base font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">All Actors</option>
            <option value="system">System (Data Pipeline)</option>
            <option value="validator">Validator (Pydantic / DB)</option>
            <option value="investigator">Investigator / Reviewer</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-sm font-data text-slate-600">
          <span><strong className="text-slate-900 font-semibold">{filteredEvents.length}</strong> recorded events matching query</span>
          {isLoading && <span className="text-blue-600 text-xs animate-pulse">Syncing live audit logs...</span>}
        </div>

        {/* Chronological Timeline — Structured Flexbox Bento Cards */}
        <div className="space-y-3 pt-2">
          {filteredEvents.map((evt, idx) => {
            const targetWorkId = evt.object.startsWith("INV-") || evt.object.startsWith("Row #") ? undefined : evt.object.split(" ")[0];

            return (
              <div
                key={evt.id || idx}
                className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-300 transition-all"
              >
                {/* Status Dot & Type Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  evt.actorType === "system" ? "bg-blue-50 text-blue-700 border-blue-200" :
                  evt.actorType === "validator" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  evt.actorType === "supervisor" ? "bg-orange-50 text-orange-700 border-orange-200" :
                  "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-current"></span>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-base sm:text-lg font-bold text-slate-900">{evt.action}</span>
                      <span className="text-slate-300">·</span>
                      {targetWorkId ? (
                        <Link href={`/investigations/${targetWorkId}`} className="font-data text-sm font-bold text-blue-700 hover:underline">
                          {evt.object}
                        </Link>
                      ) : (
                        <span className="font-data text-sm font-bold text-slate-700">{evt.object}</span>
                      )}
                    </div>
                    <span className={`font-emphasis text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                      evt.actorType === "system" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      evt.actorType === "validator" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      evt.actorType === "supervisor" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                      "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {evt.actorType}
                    </span>
                  </div>

                  <p className="font-sans text-sm sm:text-base text-slate-600 leading-relaxed">{evt.result}</p>

                  <div className="font-data text-xs sm:text-sm text-slate-500 pt-1 flex items-center gap-2" suppressHydrationWarning>
                    <span className="font-medium text-slate-800">{evt.actor}</span>
                    <span className="text-slate-300">•</span>
                    <span>{formatTimestamp(evt.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
