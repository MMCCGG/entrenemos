package com.entrenemos.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plan_usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanUsuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "entrenamiento_id", nullable = false)
    private Entrenamiento entrenamiento;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(nullable = false)
    private Boolean activo;

    @Column(name = "fecha_ultima_sesion")
    private LocalDate fechaUltimaSesion;

    // Tabla intermedia para ejercicios completados
    @ManyToMany
    @JoinTable(
            name = "plan_usuario_ejercicios_completados",
            joinColumns = @JoinColumn(name = "plan_usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "ejercicio_id")
    )
    @Builder.Default
    private List<Ejercicio> ejerciciosCompletados = new ArrayList<>();
}

