package com.entrenemos.services;

import com.entrenemos.dto.UsuarioDto;

import java.util.List;

public interface UsuarioService {
    List<UsuarioDto> listarUsuarios();
    UsuarioDto guardarUsuario(UsuarioDto usuarioDto);
}
