import { Component, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { interval, Subscription } from "rxjs";

@Component({
  selector: "app-wod-timer",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./wod-timer.html",
  styleUrl: "./wod-timer.css",
})
export class WodTimerComponent implements OnDestroy {
  // For Time: cronómetro simple
  fortimeTiempoTranscurrido: number = 0; // segundos
  fortimeEnCurso: boolean = false;

  // Control común
  timer$: Subscription | null = null;

  ngOnDestroy(): void {
    this.detenerTimer();
  }

  iniciarTimer(): void {
    if (this.timer$) return;

    this.timer$ = interval(1000).subscribe(() => {
      this.fortimeTiempoTranscurrido++;
    });

    this.fortimeEnCurso = true;
  }

  pausarTimer(): void {
    this.detenerTimer();
  }

  detenerTimer(): void {
    if (this.timer$) {
      this.timer$.unsubscribe();
      this.timer$ = null;
    }
    this.fortimeEnCurso = false;
  }

  resetearTimer(): void {
    this.fortimeTiempoTranscurrido = 0;
  }

  formatearTiempo(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const seg = Math.floor(segundos % 60);

    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, "0")}:${seg
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutos}:${seg.toString().padStart(2, "0")}`;
  }
}
