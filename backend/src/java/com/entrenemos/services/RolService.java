package com.entrenemos.services;

import com.entrenemos.dto.RolDto;

import java.util.List;

public interface RolService {
    RolDto crearRol(RolDto rolDto);
    List<RolDto> listarRoles();
    RolDto obtenerRolPorId(Long id);
    void eliminarRol(Long id);
}
