package com.entrenemos.dto;

import lombok.Data;

@Data
public class UsuarioDto {
    private Long id;
    private String nombre;
    private String email;
    private String password;
    private String rol; // "ADMIN", "ENTRENADOR", "ATLETA"
}
