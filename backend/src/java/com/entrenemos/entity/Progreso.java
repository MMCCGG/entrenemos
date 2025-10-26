package com.entrenemos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "progresos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Progreso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;
    private Double peso;
    private Integer repeticiones;
    private Double tiempo;

    @ManyToOne
    @JoinColumn(name = "ejercicio_id")
    private Ejercicio ejercicio;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
