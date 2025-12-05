package com.entrenemos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "entrenamientos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Entrenamiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    @ManyToMany
    @JoinTable(
            name = "entrenamiento_ejercicios",
            joinColumns = @JoinColumn(name = "entrenamiento_id"),
            inverseJoinColumns = @JoinColumn(name = "ejercicio_id")
    )
    private List<Ejercicio> ejercicios;
}
