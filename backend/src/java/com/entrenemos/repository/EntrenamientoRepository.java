package com.entrenemos.repository;

import com.entrenemos.entity.Entrenamiento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntrenamientoRepository extends JpaRepository<Entrenamiento, Long> {
}
