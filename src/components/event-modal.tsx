"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserEventData } from "@/lib/storage";
import { Event } from "./calendar-view";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CalendarPlus, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: Event[];
  userData: UserEventData[];
  onSave: (data: UserEventData[]) => void;
}

export default function EventModal({ isOpen, onClose, date, events, userData, onSave }: EventModalProps) {
  const [localUserData, setLocalUserData] = useState<UserEventData[]>([]);

  useEffect(() => {
    if (userData && userData.length > 0) {
      setLocalUserData(userData);
    } else {
      setLocalUserData([{ make_art: false, description: "", done: false }]);
    }
  }, [userData]);

  const updateEntry = (index: number, fields: Partial<UserEventData>) => {
    const updated = [...localUserData];
    updated[index] = { ...updated[index], ...fields, updated_at: new Date().toISOString() };
    
    if (fields.done === true) {
      updated[index].done_at = new Date().toISOString();
    }
    
    setLocalUserData(updated);
  };

  const addCustomEvent = () => {
    setLocalUserData([...localUserData, { 
      make_art: false, 
      description: "", 
      done: false, 
      is_custom: true, 
      custom_title: "", 
      custom_summary: "" 
    }]);
  };

  const removeEntry = (index: number) => {
    setLocalUserData(localUserData.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(localUserData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden font-body">
        <DialogHeader className="p-6 bg-primary/10 border-b">
          <DialogTitle className="text-2xl font-headline flex items-center gap-2">
            {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Planejamento para o dia {format(date, "dd/MM/yyyy")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Eventos Oficiais</h3>
              {events.filter(e => e.scope !== "CUSTOM").length === 0 ? (
                <p className="text-sm italic text-muted-foreground">Nenhum evento oficial nesta data.</p>
              ) : (
                <div className="grid gap-3">
                  {events.filter(e => e.scope !== "CUSTOM").map((e) => (
                    <div key={e.id} className="p-3 rounded-lg border bg-muted/20 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{e.title}</span>
                        <Badge variant={e.type === "HOLIDAY" ? "destructive" : "secondary"} className="text-[10px]">
                          {e.scope} • {e.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{e.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Planejamento de Arte</h3>
                <Button variant="ghost" size="sm" onClick={addCustomEvent} className="h-8 text-xs flex gap-1">
                  <CalendarPlus className="h-3 w-3" /> Data Especial
                </Button>
              </div>

              <div className="space-y-6">
                {localUserData.map((entry, idx) => (
                  <div key={idx} className={cn(
                    "p-4 rounded-xl border-2 transition-colors space-y-4",
                    entry.make_art ? "border-primary/50 bg-primary/5" : "border-dashed border-muted bg-transparent"
                  )}>
                    {entry.is_custom && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          <Input 
                            placeholder="Título Especial" 
                            value={entry.custom_title} 
                            onChange={(e) => updateEntry(idx, { custom_title: e.target.value })}
                            className="h-8 font-bold text-sm"
                          />
                          <Input 
                            placeholder="Breve descrição" 
                            value={entry.custom_summary} 
                            onChange={(e) => updateEntry(idx, { custom_summary: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeEntry(idx)} className="text-destructive h-8 w-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id={`make-art-${idx}`} 
                          checked={entry.make_art} 
                          onCheckedChange={(val) => updateEntry(idx, { make_art: val, done: val ? entry.done : false })}
                        />
                        <Label htmlFor={`make-art-${idx}`} className="text-sm font-bold cursor-pointer">
                          Fazer Arte para Instagram
                        </Label>
                      </div>
                      
                      {entry.make_art && (
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`done-${idx}`} 
                            checked={entry.done} 
                            onCheckedChange={(val) => updateEntry(idx, { done: val === true })}
                          />
                          <Label htmlFor={`done-${idx}`} className="text-sm font-bold cursor-pointer text-green-700">
                            Feito
                          </Label>
                        </div>
                      )}
                    </div>

                    {entry.make_art && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Descrição / Briefing</Label>
                        <Textarea 
                          placeholder="Escreva detalhes da arte, ideias de legenda, etc..."
                          value={entry.description}
                          onChange={(e) => updateEntry(idx, { description: e.target.value })}
                          className="min-h-[100px] text-sm bg-white"
                        />
                      </div>
                    )}

                    {!entry.make_art && !entry.is_custom && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-xs">Ative para começar o planejamento desta data.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 bg-muted/30 border-t sm:justify-between flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
            Fechar
          </Button>
          <Button onClick={handleSave} className="flex-1 sm:flex-none flex items-center gap-2">
            <Save className="h-4 w-4" /> Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
