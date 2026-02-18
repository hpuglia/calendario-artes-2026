"use client";

import React, { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isToday, isPast, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Search, CheckCircle2, Circle, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import eventsDataset from "@/app/events_2026_santafe_sp_br.json";
import { getStoredData, saveDayData, CalendarStorage, UserEventData } from "@/lib/storage";
import EventModal from "./event-modal";

export type Event = {
  id: string;
  date: string;
  title: string;
  summary: string;
  scope: "BR" | "SP" | "SANTA_FE_DO_SUL" | "POPULAR" | "CUSTOM";
  type: "HOLIDAY" | "OPTIONAL" | "COMMEMORATIVE";
};

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 0, 1));
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyMarked, setOnlyMarked] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [storageData, setStorageData] = useState<CalendarStorage>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Definimos o mês atual baseado na data real de hoje apenas no cliente para evitar erros de hidratação
    const today = new Date();
    // Se estivermos em 2026, usamos a data real. Se não, usamos Jan 2026 para planejamento antecipado.
    if (today.getFullYear() === 2026) {
      setCurrentMonth(today);
    } else {
      setCurrentMonth(new Date(2026, 0, 1));
    }
    
    setStorageData(getStoredData());
    setIsHydrated(true);
  }, []);

  const days = useMemo(() => {
    if (!isHydrated) return [];
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
  }, [currentMonth, isHydrated]);

  const getDayEvents = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const standardEvents = (eventsDataset as Event[]).filter(e => e.date === dateStr);
    const userData = storageData[dateStr] || [];
    
    const customEvents = userData
      .filter(u => u.is_custom)
      .map((u, idx) => ({
        id: `custom-${dateStr}-${idx}`,
        date: dateStr,
        title: u.custom_title || "Evento Especial",
        summary: u.custom_summary || "",
        scope: "CUSTOM" as const,
        type: "COMMEMORATIVE" as const,
      }));

    return [...standardEvents, ...customEvents];
  };

  const getDayStatus = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const userData = storageData[dateStr] || [];
    const hasMakeArt = userData.some(u => u.make_art);
    const hasDone = hasMakeArt && userData.every(u => u.make_art ? u.done : true);
    return { hasMakeArt, hasDone };
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToday = () => {
    const today = new Date();
    setCurrentMonth(today.getFullYear() === 2026 ? today : new Date(2026, 0, 1));
  };

  const handleSave = (date: string, events: UserEventData[]) => {
    saveDayData(date, events);
    setStorageData(getStoredData());
    setSelectedDay(null);
  };

  const exportData = (type: 'csv' | 'json') => {
    const allEvents: any[] = [];
    const stored = getStoredData();
    const standardEvents = eventsDataset as Event[];
    
    standardEvents.forEach(e => {
      const uDataArray = stored[e.date] || [];
      const uData = uDataArray[0] || {}; 

      if (onlyMarked && !uData.make_art) return;

      allEvents.push({
        date: e.date,
        title: e.title,
        scope: e.scope,
        type: e.type,
        make_art: uData.make_art || false,
        done: uData.done || false,
        description: uData.description || "",
        is_custom: false,
        updated_at: uData.updated_at || "",
        done_at: uData.done_at || ""
      });
    });

    Object.entries(stored).forEach(([date, entries]) => {
      entries.forEach(entry => {
        if (entry.is_custom) {
          if (onlyMarked && !entry.make_art) return;
          allEvents.push({
            date,
            title: entry.custom_title,
            scope: "CUSTOM",
            type: "COMMEMORATIVE",
            make_art: entry.make_art || false,
            done: entry.done || false,
            description: entry.description || "",
            is_custom: true,
            updated_at: entry.updated_at || "",
            done_at: entry.done_at || ""
          });
        }
      });
    });

    if (type === 'json') {
      const blob = new Blob([JSON.stringify(allEvents, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `artes_santafe_2026.json`;
      a.click();
    } else {
      const headers = ["date", "title", "scope", "type", "make_art", "done", "description", "is_custom", "updated_at", "done_at"];
      const csvContent = [
        headers.join(","),
        ...allEvents.map(e => headers.map(h => `"${(e[h] || '').toString().replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `artes_santafe_2026.csv`;
      a.click();
    }
  };

  if (!isHydrated) return <div className="min-h-[400px] flex items-center justify-center">Carregando calendário...</div>;

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6 shadow-md border-none bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-headline font-bold min-w-[180px] text-center capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-full">
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button variant="ghost" onClick={goToday} className="ml-2 font-body font-semibold">
              Hoje
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar evento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-primary/20"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="filter-marked" checked={onlyMarked} onCheckedChange={setOnlyMarked} />
              <Label htmlFor="filter-marked" className="text-sm font-body cursor-pointer flex items-center gap-1">
                <Filter className="h-3 w-3" /> Somente marcados
              </Label>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => exportData('csv')} className="flex items-center gap-1">
                <Download className="h-4 w-4" /> CSV
              </Button>
              <Button variant="secondary" size="sm" onClick={() => exportData('json')} className="flex items-center gap-1">
                <Download className="h-4 w-4" /> JSON
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border overflow-hidden rounded-lg border shadow-sm">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className="bg-muted/50 p-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {d}
            </div>
          ))}
          
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
            <div key={`pad-${i}`} className="bg-background min-h-[100px] md:min-h-[120px] opacity-30" />
          ))}

          {days.map((day) => {
            const dayEvents = getDayEvents(day);
            const { hasMakeArt, hasDone } = getDayStatus(day);
            const isDayToday = isToday(day);
            const isDayPast = isPast(day) && !isDayToday;
            
            const filteredEvents = dayEvents.filter(e => 
              e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              e.summary.toLowerCase().includes(searchQuery.toLowerCase())
            );

            const shouldHide = (searchQuery && filteredEvents.length === 0) || (onlyMarked && !hasMakeArt);

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "bg-background p-2 min-h-[100px] md:min-h-[120px] transition-all cursor-pointer hover:bg-primary/10 relative group",
                  isDayPast && "opacity-60 bg-muted/20",
                  isDayToday && "ring-2 ring-inset ring-accent z-10",
                  hasMakeArt && !hasDone && "bg-primary/10",
                  hasDone && "bg-green-50",
                  shouldHide && "opacity-20 grayscale pointer-events-none"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={cn(
                    "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full",
                    isDayToday ? "bg-accent text-accent-foreground" : "text-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                  {hasDone ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : hasMakeArt ? (
                    <Circle className="h-4 w-4 text-primary fill-primary" />
                  ) : null}
                </div>

                <div className="space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className={cn(
                        "text-[10px] md:text-xs px-1 py-0.5 rounded truncate font-medium",
                        e.type === "HOLIDAY" ? "bg-red-100 text-red-700" : 
                        e.scope === "CUSTOM" ? "bg-accent/30 text-accent-foreground" : "bg-primary/30 text-primary-foreground"
                      )}
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[9px] text-muted-foreground font-bold pl-1">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {selectedDay && (
        <EventModal
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          date={selectedDay}
          events={getDayEvents(selectedDay)}
          userData={storageData[format(selectedDay, "yyyy-MM-dd")] || []}
          onSave={(updated) => handleSave(format(selectedDay, "yyyy-MM-dd"), updated)}
        />
      )}
    </div>
  );
}