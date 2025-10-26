package com.entrenemos.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgresoDto {
    private Long id;
    private LocalDate fecha;
    private Double peso;
    private Integer repeticiones;
    private Double tiempo;
    private Long usuarioId;
    private Long ejercicioId;
}
