package com.entrenemos.services;

import com.entrenemos.dto.EntrenamientoDto;

import java.util.List;

public interface EntrenamientoService {
    EntrenamientoDto crear(EntrenamientoDto entrenamientoDto);
    EntrenamientoDto actualizar(Long id, EntrenamientoDto entrenamientoDto);
    List<EntrenamientoDto> listar();
    EntrenamientoDto obtenerPorId(Long id);
    void eliminar(Long id);
}
