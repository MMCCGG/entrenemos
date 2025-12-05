package com.entrenemos.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntrenamientoDto {
    private Long id;
    private String nombre;
    private String descripcion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    // ids de ejercicios para crear/editar
    private List<Long> ejerciciosIds;

    // info de ejercicios para mostrar en el front
    private List<EjercicioDto> ejercicios;
}
