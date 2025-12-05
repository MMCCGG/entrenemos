package com.entrenemos.services;

import com.entrenemos.dto.EjercicioDto;
import com.entrenemos.dto.EntrenamientoDto;
import com.entrenemos.entity.Ejercicio;
import com.entrenemos.entity.Entrenamiento;
import com.entrenemos.repository.EjercicioRepository;
import com.entrenemos.repository.EntrenamientoRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EntrenamientoServiceImpl implements EntrenamientoService{

    private final EntrenamientoRepository entrenamientoRepository;
    private final EjercicioRepository ejercicioRepository;

    @Override
    @Transactional
    public EntrenamientoDto crear(EntrenamientoDto dto) {
        validarFechas(dto);

        Entrenamiento e = Entrenamiento.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .build();

        vincularEjercicios(e, dto.getEjerciciosIds());

        Entrenamiento saved = entrenamientoRepository.save(e);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public EntrenamientoDto actualizar(Long id, EntrenamientoDto dto) {
        validarFechas(dto);

        Entrenamiento e = entrenamientoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrenamiento no encontrado"));

        e.setNombre(dto.getNombre());
        e.setDescripcion(dto.getDescripcion());
        e.setFechaInicio(dto.getFechaInicio());
        e.setFechaFin(dto.getFechaFin());

        vincularEjercicios(e, dto.getEjerciciosIds());

        Entrenamiento updated = entrenamientoRepository.save(e);
        return mapToDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EntrenamientoDto> listar() {
        return entrenamientoRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EntrenamientoDto obtenerPorId(Long id) {
        return entrenamientoRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrenamiento no encontrado"));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!entrenamientoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrenamiento no encontrado");
        }
        entrenamientoRepository.deleteById(id);
    }

    // ---------------- Helpers ----------------

    private void validarFechas(EntrenamientoDto dto) {
        if (dto.getFechaFin() != null && dto.getFechaInicio() != null &&
                dto.getFechaFin().isBefore(dto.getFechaInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fecha fin no puede ser anterior a fecha inicio");
        }
    }

    private void vincularEjercicios(Entrenamiento e, List<Long> ejerciciosIds) {
        if (ejerciciosIds != null && !ejerciciosIds.isEmpty()) {
            List<Ejercicio> ejercicios = ejercicioRepository.findAllById(ejerciciosIds);
            if (ejercicios.size() != ejerciciosIds.size()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Algunos ejercicios no existen");
            }
            e.setEjercicios(ejercicios);
        } else {
            e.setEjercicios(Collections.emptyList());
        }
    }

    private EntrenamientoDto mapToDto(Entrenamiento e) {
        List<EjercicioDto> ejercicios = e.getEjercicios() != null ? e.getEjercicios().stream()
                .map(ex -> EjercicioDto.builder()
                        .id(ex.getId())
                        .nombre(ex.getNombre())
                        .repeticiones(ex.getRepeticiones())
                        .peso(ex.getPeso())
                        .build())
                .collect(Collectors.toList()) : Collections.emptyList();

        return EntrenamientoDto.builder()
                .id(e.getId())
                .nombre(e.getNombre())
                .descripcion(e.getDescripcion())
                .fechaInicio(e.getFechaInicio())
                .fechaFin(e.getFechaFin())
                .ejercicios(ejercicios)
                .ejerciciosIds(e.getEjercicios() != null ?
                        e.getEjercicios().stream().map(Ejercicio::getId).toList() :
                        Collections.emptyList())
                .build();
    }
}
