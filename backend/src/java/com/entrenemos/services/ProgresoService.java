package com.entrenemos.services;

import com.entrenemos.dto.ProgresoDto;

import java.util.List;

public interface ProgresoService {
    ProgresoDto crear(ProgresoDto progresoDto);
    List<ProgresoDto> listar();
    ProgresoDto obtenerPorId(Long id);
    void eliminar(Long id);
}
