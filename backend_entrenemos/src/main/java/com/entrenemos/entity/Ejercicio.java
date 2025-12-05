package com.entrenemos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ejercicios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ejercicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private Integer repeticiones;
    private Double peso;
    private String tipo;
    private String videoUrl;
}
