package com.entrenemos.repository;

import com.entrenemos.entity.Ejercicio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EjercicioRepository extends JpaRepository<Ejercicio,Long> {
}
