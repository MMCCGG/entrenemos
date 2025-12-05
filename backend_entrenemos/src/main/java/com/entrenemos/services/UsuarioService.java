package com.entrenemos.services;

import com.entrenemos.dto.UsuarioDto;

import java.util.List;

public interface UsuarioService {
    List<UsuarioDto> listarUsuarios();
    UsuarioDto guardarUsuario(UsuarioDto usuarioDto);
    UsuarioDto obtenerUsuario(Long id);
    UsuarioDto actualizarUsuario(Long id, UsuarioDto usuarioDto);
    void eliminarUsuario(Long id);
}
