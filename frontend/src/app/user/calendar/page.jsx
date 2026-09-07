"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays, ChevronLeft, ChevronRight, Briefcase, Landmark, Wrench, GraduationCap,
  ClipboardCheck, ExternalLink, Loader2, Clock, X,
} from "lucide-react";
import UserSidebar from "@/components/UserSidebar";

const CATS = {
  job:            { label: "Jobs",                      bg: "bg-blue-500",   dot: "bg-blue-400",   badge: "bg-blue-50 text-blue-700 border-blue-200" },
  "govt-job":     { label: "Govt Jobs",                 bg: "bg-amber-500",  dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 border-amber-200" },
  scheme:         { label: "Schemes & Internships",     bg: "bg-emerald-500",dot: "bg-emerald-400",badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  apprenticeship: { label: "Apprenticeship & Training", bg: "bg-purple-500", dot: "bg-purple-400", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  exam:           { label: "Exams",                     bg: "bg-rose-500",   dot: "bg-rose-400",   badge: "bg-rose-50 text-rose-700 border-rose-200" },
  result:         { label: "Results",                   bg: "bg-teal-500",   dot: "bg-teal-400",   badge: "bg-teal-50 text-teal-700 border-teal-200" },
};

const CAT_ICONS = { job: Briefcase, "govt-job": Landmark, scheme: Landmark, apprenticeship: Wrench, exam: ClipboardCheck, result: GraduationCap };

const STATUS_LABEL = {
  posted: "Posted", deadline: "Deadline", "app-open": "Applications Open",
  "admit-card": "Admit Card", "exam-day": "Exam Day", result: "Result",
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function toKey(d) {
  const dt = new Date(d);
  return dt.getFullYear() + "-" + String(dt.getMonth()+1).padStart(2,"0") + "-" + String(dt.getDate()).padStart(2,"0");
}

function fmtShort(d) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }
function fmtFull(d) { return new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
function fmtMedium(d) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filter, setFilter] = useState("all");
  const [pickedDate, setPickedDate] = useState(null);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(2026);
  const [todayKey, setTodayKey] = useState("");

  useEffect(() => {
    const n = new Date();
    setMonth(n.getMonth());
    setYear(n.getFullYear());
    setTodayKey(toKey(n));
    setMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/candidate/calendar");
        const d = await r.json();
        if (d.success) setEvents(d.events);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const list = useMemo(() => {
    if (filter === "all") return events;
    return events.filter(function(e) { return e.type === filter; });
  }, [events, filter]);

  const byDate = useMemo(() => {
    var m = {};
    for (var i = 0; i < list.length; i++) {
      var k = toKey(list[i].date);
      if (!m[k]) m[k] = [];
      m[k].push(list[i]);
    }
    return m;
  }, [list]);

  var prevMonth = function() {
    if (month === 0) { setMonth(11); setYear(function(y) { return y - 1; }); }
    else setMonth(function(m) { return m - 1; });
  };
  var nextMonth = function() {
    if (month === 11) { setMonth(0); setYear(function(y) { return y + 1; }); }
    else setMonth(function(m) { return m + 1; });
  };
  var goToday = function() {
    var n = new Date();
    setMonth(n.getMonth());
    setYear(n.getFullYear());
  };

  var firstDow = new Date(year, month, 1).getDay();
  var dim = new Date(year, month + 1, 0).getDate();
  var prevDim = new Date(year, month, 0).getDate();

  var cells = [];
  for (var i = firstDow - 1; i >= 0; i--) cells.push({ day: prevDim - i, outside: true });
  for (var d = 1; d <= dim; d++) cells.push({ day: d, outside: false });
  var remaining = 42 - cells.length;
  for (var d2 = 1; d2 <= remaining; d2++) cells.push({ day: d2, outside: true });

  var picked = pickedDate ? (byDate[pickedDate] || []) : [];

  var upcoming = useMemo(function() {
    var n = new Date();
    return list.filter(function(e) { return new Date(e.date) >= n; })
      .sort(function(a, b) { return new Date(a.date) - new Date(b.date); })
      .slice(0, 25);
  }, [list]);

  var recent = useMemo(function() {
    var n = new Date();
    return list.filter(function(e) { return new Date(e.date) < n; })
      .sort(function(a, b) { return new Date(b.date) - new Date(a.date); })
      .slice(0, 15);
  }, [list]);

  if (!mounted) {
    return (
      <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
        <UserSidebar onCollapseChange={setIsSidebarCollapsed} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
          <div className="flex justify-center items-center py-32">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <CalendarDays className="h-7 w-7 text-blue-600" /> Events Calendar
            </h1>
            <p className="mt-1 text-sm text-gray-500">Deadlines, exams, results, job postings, schemes &amp; training — all in one view.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            <button onClick={function() { setFilter("all"); }}
              className={"px-3 py-1.5 rounded-full text-xs font-semibold transition-colors " + (filter === "all" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
              All Events
            </button>
            {Object.keys(CATS).map(function(k) {
              var c = CATS[k];
              var Icon = CAT_ICONS[k];
              return (
                <button key={k} onClick={function() { setFilter(k); }}
                  className={"px-3 py-1.5 rounded-full text-xs font-semibold transition-colors inline-flex items-center gap-1 " +
                    (filter === k ? c.bg + " text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                  <Icon className="h-3 w-3" /> {c.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
          ) : (
            <div className="flex flex-col xl:flex-row gap-5">

              {/* Calendar grid */}
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                  {/* Month nav */}
                  <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100">
                    <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"><ChevronLeft className="h-5 w-5" /></button>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">{MONTHS[month]} {year}</h2>
                      <button onClick={goToday} className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100">Today</button>
                    </div>
                    <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"><ChevronRight className="h-5 w-5" /></button>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                    {WEEKDAYS.map(function(w) {
                      return <div key={w} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">{w}</div>;
                    })}
                  </div>

                  {/* Day cells */}
                  <div className="grid grid-cols-7">
                    {cells.map(function(cell, idx) {
                      var cellKey = cell.outside
                        ? "out-" + idx
                        : year + "-" + String(month+1).padStart(2,"0") + "-" + String(cell.day).padStart(2,"0");
                      var dayEvts = cell.outside ? [] : (byDate[cellKey] || []);
                      var isToday = cellKey === todayKey;
                      var isPicked = cellKey === pickedDate;
                      var dotTypes = [];
                      var seen = {};
                      for (var j = 0; j < dayEvts.length && dotTypes.length < 5; j++) {
                        if (!seen[dayEvts[j].type]) { dotTypes.push(dayEvts[j].type); seen[dayEvts[j].type] = true; }
                      }

                      return (
                        <div key={"c-" + idx}
                          onClick={function() { if (!cell.outside) setPickedDate(cellKey === pickedDate ? null : cellKey); }}
                          className={
                            "relative border-b border-r border-gray-100 p-1 sm:p-1.5 transition-colors " +
                            (cell.outside ? "bg-gray-50/50 cursor-default h-16 sm:h-20 " : "cursor-pointer hover:bg-blue-50/40 h-16 sm:h-24 ") +
                            (isPicked ? "bg-blue-50 ring-2 ring-blue-400 ring-inset z-10 " : "")
                          }>
                          <div className="flex items-center justify-between">
                            <span className={
                              "inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full " +
                              (cell.outside ? "text-gray-300" : isToday ? "bg-blue-600 text-white" : "text-gray-700")
                            }>
                              {cell.day}
                            </span>
                            {dayEvts.length > 0 && (
                              <span className="text-[10px] font-bold text-gray-400">{dayEvts.length}</span>
                            )}
                          </div>

                          {dotTypes.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {dotTypes.map(function(t) {
                                return <div key={t} className={"w-2 h-2 rounded-full " + (CATS[t] ? CATS[t].dot : "bg-gray-300")} />;
                              })}
                            </div>
                          )}

                          {dayEvts.length > 0 && (
                            <p className="hidden sm:block text-[10px] leading-tight text-gray-500 mt-1 truncate">
                              {dayEvts[0].title.length > 24 ? dayEvts[0].title.slice(0, 22) + "..." : dayEvts[0].title}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected date events */}
                {pickedDate && (
                  <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                        {fmtFull(pickedDate + "T00:00:00")}
                      </h3>
                      <button onClick={function() { setPickedDate(null); }} className="p-1 rounded hover:bg-gray-100 text-gray-400">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {picked.length === 0 ? (
                      <p className="text-sm text-gray-400">No events on this date.</p>
                    ) : (
                      <div className="space-y-2">
                        {picked.map(function(ev) {
                          var c = CATS[ev.type] || CATS.job;
                          return (
                            <div key={ev.id} className={"flex items-start gap-3 p-3 rounded-lg border " + c.badge}>
                              <div className={"shrink-0 mt-1 w-2.5 h-2.5 rounded-full " + c.bg} />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900">{ev.title}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  {ev.subtitle && <span className="text-xs text-gray-500">{ev.subtitle}</span>}
                                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-white/70">
                                    {STATUS_LABEL[ev.status] || ev.status}
                                  </span>
                                </div>
                              </div>
                              {ev.link && (
                                <a href={ev.link} target="_blank" rel="noopener noreferrer"
                                  className="shrink-0 p-1.5 rounded-md hover:bg-white text-blue-600">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right panel */}
              <div className="w-full xl:w-80 shrink-0 space-y-5">

                {/* Upcoming */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-gray-900">Upcoming Events</h3>
                    <span className="ml-auto text-xs font-semibold text-gray-400">{upcoming.length}</span>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                    {upcoming.length === 0 ? (
                      <p className="text-sm text-gray-400 p-4">No upcoming events.</p>
                    ) : upcoming.map(function(ev) {
                      var c = CATS[ev.type] || CATS.job;
                      return (
                        <div key={ev.id} className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-2">
                            <div className={"shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 " + c.dot} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-gray-800 leading-snug truncate">{ev.title}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-gray-400">{fmtShort(ev.date)}</span>
                                {ev.status && ev.status !== "posted" && (
                                  <span className={"text-[10px] font-semibold px-1 py-px rounded " + c.badge}>
                                    {STATUS_LABEL[ev.status] || ev.status}
                                  </span>
                                )}
                              </div>
                            </div>
                            {ev.link && (
                              <a href={ev.link} target="_blank" rel="noopener noreferrer" className="shrink-0 text-gray-300 hover:text-blue-600 mt-0.5">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recently ended */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <h3 className="font-bold text-sm text-gray-900">Recently Ended</h3>
                    <span className="ml-auto text-xs font-semibold text-gray-400">{recent.length}</span>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-50">
                    {recent.length === 0 ? (
                      <p className="text-sm text-gray-400 p-4">Nothing recently ended.</p>
                    ) : recent.map(function(ev) {
                      var c = CATS[ev.type] || CATS.job;
                      return (
                        <div key={ev.id} className="px-4 py-2.5 hover:bg-gray-50 transition-colors opacity-60">
                          <div className="flex items-start gap-2">
                            <div className={"shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 " + c.dot} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-gray-600 leading-snug truncate">{ev.title}</p>
                              <span className="text-xs text-gray-400">{fmtMedium(ev.date)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2.5">Legend</h3>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                    {Object.keys(CATS).map(function(k) {
                      var c = CATS[k];
                      return (
                        <div key={k} className="flex items-center gap-2">
                          <div className={"w-2.5 h-2.5 rounded-full " + c.bg} />
                          <span className="text-xs text-gray-600">{c.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
