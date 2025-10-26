package com.entrenemos.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EjercicioDto {
    private Long id;
    private String nombre;
    private String descripcion;
    private String tipo;
    private String videoUrl;
}
