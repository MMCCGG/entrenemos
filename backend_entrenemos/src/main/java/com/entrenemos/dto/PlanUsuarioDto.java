package com.entrenemos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanUsuarioDto {
    private Long id;
    private Long usuarioId;
    private Long entrenamientoId;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Boolean activo;
    private LocalDate fechaUltimaSesion;
    private List<Long> ejerciciosCompletadosIds;
    
    // Datos completos (opcionales, para respuestas)
    private UsuarioDto usuario;
    private EntrenamientoDto entrenamiento;
}

