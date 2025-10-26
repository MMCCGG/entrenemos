package com.entrenemos.repository;

import com.entrenemos.entity.Progreso;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgresoRepository extends JpaRepository<Progreso,Long> {
}
