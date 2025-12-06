package com.entrenemos.services;

import com.entrenemos.dto.EjercicioDto;

import java.util.List;

public interface EjercicioService {
    EjercicioDto crear(EjercicioDto ejercicioDto);
    List<EjercicioDto> listar();
    EjercicioDto obtenerPorId(Long id);
    EjercicioDto actualizar(Long id, EjercicioDto ejercicioDto);
    void eliminar(Long id);
}
