package com.entrenemos.repository;

import com.entrenemos.entity.PlanUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PlanUsuarioRepository extends JpaRepository<PlanUsuario, Long> {
    
    // Buscar plan activo de un usuario
    Optional<PlanUsuario> findByUsuarioIdAndActivoTrue(Long usuarioId);
    
    // Buscar todos los planes de un usuario
    List<PlanUsuario> findByUsuarioId(Long usuarioId);
    
    // Buscar planes activos
    List<PlanUsuario> findByActivoTrue();
}

