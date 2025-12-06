package com.entrenemos.services;

import com.entrenemos.dto.PlanUsuarioDto;

import java.util.List;

public interface PlanUsuarioService {
    PlanUsuarioDto crear(PlanUsuarioDto dto);
    PlanUsuarioDto obtenerPorId(Long id);
    PlanUsuarioDto obtenerPlanActivo(Long usuarioId);
    List<PlanUsuarioDto> obtenerPlanesUsuario(Long usuarioId);
    PlanUsuarioDto marcarEjercicioCompletado(Long planUsuarioId, Long ejercicioId);
    PlanUsuarioDto finalizarPlan(Long planUsuarioId);
    PlanUsuarioDto actualizar(Long id, PlanUsuarioDto dto);
    void eliminar(Long id);
}

