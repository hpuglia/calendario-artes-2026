
import CalendarView from "@/components/calendar-view";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-headline font-bold text-accent-foreground mb-2">
            Calendário de Artes
          </h1>
          <p className="text-muted-foreground font-body text-lg">
            Santa Fé do Sul – 2026
          </p>
        </header>
        
        <CalendarView />
        
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2026 Santa Fé Arts Calendar • Uso Pessoal</p>
        </footer>
      </div>
    </main>
  );
}
