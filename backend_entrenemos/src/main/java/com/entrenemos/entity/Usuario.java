package com.entrenemos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    private String telefono;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @Column(name = "foto_perfil", length = 500)
    private String fotoPerfil; // URL o ruta de la foto de perfil

    @ManyToOne
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;
}
