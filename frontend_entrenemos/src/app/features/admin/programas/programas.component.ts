import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { EntrenamientoService } from "../../../core/services/entrenamiento.service";
import { EjercicioService } from "../../../core/services/ejercicio.service";
import { Entrenamiento } from "../../../shared/models/entrenamiento.model";
import { Ejercicio } from "../../../shared/models/ejercicio.model";

@Component({
  selector: "app-programas",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./programas.component.html",
  styleUrl: "./programas.component.css",
})
export class ProgramasComponent implements OnInit {
  private entrenamientoService = inject(EntrenamientoService);
  private ejercicioService = inject(EjercicioService);

  entrenamientos: Entrenamiento[] = [];
  ejercicios: Ejercicio[] = [];
  cargando = false;
  error: string | null = null;

  // Formulario de entrenamiento
  mostrarFormulario = false;
  editando = false;
  entrenamientoForm: Entrenamiento = {
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    ejerciciosIds: [],
  };
  ejerciciosSeleccionados: number[] = [];

  // Formulario de ejercicio
  mostrarFormularioEjercicio = false;
  editandoEjercicio = false;
  ejercicioForm: Ejercicio = {
    nombre: "",
    descripcion: "",
    tipo: "",
    repeticiones: undefined,
    peso: undefined,
    videoUrl: "",
  };

  // Ordenamiento de ejercicios
  campoOrden: string | null = null;
  ordenAscendente = true;
  get ejerciciosOrdenados(): Ejercicio[] {
    if (!this.campoOrden) {
      return this.ejercicios;
    }
    const ejercicios = [...this.ejercicios];
    ejercicios.sort((a, b) => {
      const valorA = (a as any)[this.campoOrden!] ?? "";
      const valorB = (b as any)[this.campoOrden!] ?? "";

      if (typeof valorA === "number" && typeof valorB === "number") {
        return this.ordenAscendente ? valorA - valorB : valorB - valorA;
      }

      const strA = String(valorA).toLowerCase();
      const strB = String(valorB).toLowerCase();

      if (strA < strB) return this.ordenAscendente ? -1 : 1;
      if (strA > strB) return this.ordenAscendente ? 1 : -1;
      return 0;
    });
    return ejercicios;
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    // Cargar entrenamientos y ejercicios en paralelo
    this.entrenamientoService.listar().subscribe({
      next: (entrenamientos) => {
        this.entrenamientos = entrenamientos;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error cargando entrenamientos:", err);
        this.error = "Error al cargar los entrenamientos";
        this.cargando = false;
      },
    });

    this.ejercicioService.listar().subscribe({
      next: (ejercicios) => {
        this.ejercicios = ejercicios;
      },
      error: (err) => {
        console.error("Error cargando ejercicios:", err);
      },
    });
  }

  abrirFormulario(entrenamiento?: Entrenamiento): void {
    if (entrenamiento) {
      this.editando = true;
      this.entrenamientoForm = { ...entrenamiento };
      this.ejerciciosSeleccionados = entrenamiento.ejerciciosIds
        ? [...entrenamiento.ejerciciosIds]
        : [];
    } else {
      this.editando = false;
      this.entrenamientoForm = {
        nombre: "",
        descripcion: "",
        fechaInicio: "",
        fechaFin: "",
        ejerciciosIds: [],
      };
      this.ejerciciosSeleccionados = [];
    }
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.entrenamientoForm = {
      nombre: "",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
      ejerciciosIds: [],
    };
    this.ejerciciosSeleccionados = [];
  }

  toggleEjercicio(ejercicioId: number): void {
    const index = this.ejerciciosSeleccionados.indexOf(ejercicioId);
    if (index > -1) {
      this.ejerciciosSeleccionados.splice(index, 1);
    } else {
      this.ejerciciosSeleccionados.push(ejercicioId);
    }
  }

  estaSeleccionado(ejercicioId: number): boolean {
    return this.ejerciciosSeleccionados.includes(ejercicioId);
  }

  guardar(): void {
    if (!this.entrenamientoForm.nombre) {
      alert("El nombre es obligatorio");
      return;
    }

    this.cargando = true;
    this.error = null;

    const entrenamientoParaGuardar: Entrenamiento = {
      ...this.entrenamientoForm,
      ejerciciosIds: this.ejerciciosSeleccionados,
    };

    if (this.editando && this.entrenamientoForm.id) {
      // Actualizar
      this.entrenamientoService
        .actualizar(this.entrenamientoForm.id, entrenamientoParaGuardar)
        .subscribe({
          next: () => {
            this.cargarDatos();
            this.cerrarFormulario();
            alert("Entrenamiento actualizado con éxito");
          },
          error: (err) => {
            console.error("Error actualizando:", err);
            this.error = "Error al actualizar el entrenamiento";
            this.cargando = false;
          },
        });
    } else {
      // Crear
      this.entrenamientoService.crear(entrenamientoParaGuardar).subscribe({
        next: () => {
          this.cargarDatos();
          this.cerrarFormulario();
          alert("Entrenamiento creado con éxito");
        },
        error: (err) => {
          console.error("Error creando:", err);
          this.error = "Error al crear el entrenamiento";
          this.cargando = false;
        },
      });
    }
  }

  eliminar(id: number): void {
    if (!confirm("¿Estás seguro de que quieres eliminar este entrenamiento?")) {
      return;
    }

    this.entrenamientoService.eliminar(id).subscribe({
      next: () => {
        this.cargarDatos();
        alert("Entrenamiento eliminado con éxito");
      },
      error: (err) => {
        console.error("Error eliminando:", err);
        alert("Error al eliminar el entrenamiento");
      },
    });
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return "No especificada";
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return fecha;
    }
  }

  // Métodos para gestión de ejercicios
  abrirFormularioEjercicio(ejercicio?: Ejercicio): void {
    if (ejercicio) {
      this.editandoEjercicio = true;
      // Copiar todos los campos explícitamente para asegurar el binding
      this.ejercicioForm = {
        id: ejercicio.id,
        nombre: ejercicio.nombre || "",
        descripcion: ejercicio.descripcion || "",
        tipo: ejercicio.tipo || "",
        repeticiones: ejercicio.repeticiones ?? undefined,
        peso: ejercicio.peso ?? undefined,
        videoUrl: ejercicio.videoUrl || "",
      };
    } else {
      this.editandoEjercicio = false;
      this.ejercicioForm = {
        nombre: "",
        descripcion: "",
        tipo: "",
        repeticiones: undefined,
        peso: undefined,
        videoUrl: "",
      };
    }
    this.mostrarFormularioEjercicio = true;
  }

  cerrarFormularioEjercicio(): void {
    this.mostrarFormularioEjercicio = false;
    this.editandoEjercicio = false;
    this.ejercicioForm = {
      nombre: "",
      descripcion: "",
      tipo: "",
      repeticiones: undefined,
      peso: undefined,
      videoUrl: "",
    };
  }

  guardarEjercicio(): void {
    if (!this.ejercicioForm.nombre) {
      alert("El nombre es obligatorio");
      return;
    }

    this.cargando = true;
    this.error = null;

    if (this.editandoEjercicio && this.ejercicioForm.id) {
      // Actualizar
      this.ejercicioService
        .actualizar(this.ejercicioForm.id, this.ejercicioForm)
        .subscribe({
          next: () => {
            this.cargarDatos();
            this.cerrarFormularioEjercicio();
            alert("Ejercicio actualizado con éxito");
          },
          error: (err) => {
            console.error("Error actualizando ejercicio:", err);
            this.error = "Error al actualizar el ejercicio";
            this.cargando = false;
          },
        });
    } else {
      // Crear
      this.ejercicioService.crear(this.ejercicioForm).subscribe({
        next: () => {
          this.cargarDatos();
          this.cerrarFormularioEjercicio();
          alert("Ejercicio creado con éxito");
        },
        error: (err) => {
          console.error("Error creando ejercicio:", err);
          this.error = "Error al crear el ejercicio";
          this.cargando = false;
        },
      });
    }
  }

  eliminarEjercicio(id: number): void {
    if (!confirm("¿Estás seguro de que quieres eliminar este ejercicio?")) {
      return;
    }

    this.ejercicioService.eliminar(id).subscribe({
      next: () => {
        this.cargarDatos();
        alert("Ejercicio eliminado con éxito");
      },
      error: (err) => {
        console.error("Error eliminando ejercicio:", err);
        alert("Error al eliminar el ejercicio");
      },
    });
  }

  ordenarPor(campo: string): void {
    if (this.campoOrden === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.campoOrden = campo;
      this.ordenAscendente = true;
    }
  }

  obtenerIconoOrden(campo: string): string {
    if (this.campoOrden !== campo) {
      return "⇅";
    }
    return this.ordenAscendente ? "↑" : "↓";
  }
}
