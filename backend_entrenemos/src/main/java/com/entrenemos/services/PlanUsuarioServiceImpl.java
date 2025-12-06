package com.entrenemos.services;

import com.entrenemos.dto.EntrenamientoDto;
import com.entrenemos.dto.PlanUsuarioDto;
import com.entrenemos.dto.UsuarioDto;
import com.entrenemos.entity.Ejercicio;
import com.entrenemos.entity.Entrenamiento;
import com.entrenemos.entity.PlanUsuario;
import com.entrenemos.entity.Usuario;
import com.entrenemos.repository.EjercicioRepository;
import com.entrenemos.repository.EntrenamientoRepository;
import com.entrenemos.repository.PlanUsuarioRepository;
import com.entrenemos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanUsuarioServiceImpl implements PlanUsuarioService {

    private final PlanUsuarioRepository planUsuarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final EntrenamientoRepository entrenamientoRepository;
    private final EjercicioRepository ejercicioRepository;
    private final EntrenamientoService entrenamientoService;

    @Override
    @Transactional
    public PlanUsuarioDto crear(PlanUsuarioDto dto) {
        // Validar que el usuario existe
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // Validar que el entrenamiento existe
        Entrenamiento entrenamiento = entrenamientoRepository.findById(dto.getEntrenamientoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrenamiento no encontrado"));

        // Si el usuario ya tiene un plan activo, desactivarlo
        planUsuarioRepository.findByUsuarioIdAndActivoTrue(dto.getUsuarioId())
                .ifPresent(planExistente -> {
                    planExistente.setActivo(false);
                    planUsuarioRepository.save(planExistente);
                });

        // Calcular fecha fin si no se proporciona (7 días por defecto)
        LocalDate fechaInicio = dto.getFechaInicio() != null ? dto.getFechaInicio() : LocalDate.now();
        LocalDate fechaFin = dto.getFechaFin();
        if (fechaFin == null && entrenamiento.getFechaFin() != null) {
            fechaFin = entrenamiento.getFechaFin();
        } else if (fechaFin == null) {
            fechaFin = fechaInicio.plusDays(7); // Por defecto 7 días
        }

        // Crear el plan
        PlanUsuario planUsuario = PlanUsuario.builder()
                .usuario(usuario)
                .entrenamiento(entrenamiento)
                .fechaInicio(fechaInicio)
                .fechaFin(fechaFin)
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .ejerciciosCompletados(new ArrayList<>())
                .build();

        PlanUsuario saved = planUsuarioRepository.save(planUsuario);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PlanUsuarioDto obtenerPorId(Long id) {
        return planUsuarioRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan no encontrado"));
    }

    @Override
    @Transactional(readOnly = true)
    public PlanUsuarioDto obtenerPlanActivo(Long usuarioId) {
        return planUsuarioRepository.findByUsuarioIdAndActivoTrue(usuarioId)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlanUsuarioDto> obtenerPlanesUsuario(Long usuarioId) {
        return planUsuarioRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PlanUsuarioDto marcarEjercicioCompletado(Long planUsuarioId, Long ejercicioId) {
        PlanUsuario planUsuario = planUsuarioRepository.findById(planUsuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan no encontrado"));

        Ejercicio ejercicio = ejercicioRepository.findById(ejercicioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ejercicio no encontrado"));

        // Verificar que el ejercicio pertenece al entrenamiento del plan
        if (!planUsuario.getEntrenamiento().getEjercicios().contains(ejercicio)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El ejercicio no pertenece al plan de entrenamiento");
        }

        // Agregar el ejercicio a completados si no está ya
        if (!planUsuario.getEjerciciosCompletados().contains(ejercicio)) {
            planUsuario.getEjerciciosCompletados().add(ejercicio);
            planUsuario.setFechaUltimaSesion(LocalDate.now());
            planUsuario = planUsuarioRepository.save(planUsuario);
        }

        return mapToDto(planUsuario);
    }

    @Override
    @Transactional
    public PlanUsuarioDto finalizarPlan(Long planUsuarioId) {
        PlanUsuario planUsuario = planUsuarioRepository.findById(planUsuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan no encontrado"));

        planUsuario.setActivo(false);
        PlanUsuario updated = planUsuarioRepository.save(planUsuario);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public PlanUsuarioDto actualizar(Long id, PlanUsuarioDto dto) {
        PlanUsuario planUsuario = planUsuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan no encontrado"));

        if (dto.getFechaInicio() != null) {
            planUsuario.setFechaInicio(dto.getFechaInicio());
        }
        if (dto.getFechaFin() != null) {
            planUsuario.setFechaFin(dto.getFechaFin());
        }
        if (dto.getActivo() != null) {
            planUsuario.setActivo(dto.getActivo());
        }

        PlanUsuario updated = planUsuarioRepository.save(planUsuario);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!planUsuarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan no encontrado");
        }
        planUsuarioRepository.deleteById(id);
    }

    // ---------------- Helpers ---------------- 

    private PlanUsuarioDto mapToDto(PlanUsuario planUsuario) {
        // Mapear ejercicios completados a IDs
        List<Long> ejerciciosCompletadosIds = planUsuario.getEjerciciosCompletados() != null ?
                planUsuario.getEjerciciosCompletados().stream()
                        .map(Ejercicio::getId)
                        .collect(Collectors.toList()) : new ArrayList<>();

        // Obtener DTOs completos
        EntrenamientoDto entrenamientoDto = entrenamientoService.obtenerPorId(planUsuario.getEntrenamiento().getId());
        
        UsuarioDto usuarioDto = new UsuarioDto();
        usuarioDto.setId(planUsuario.getUsuario().getId());
        usuarioDto.setNombre(planUsuario.getUsuario().getNombre());
        usuarioDto.setEmail(planUsuario.getUsuario().getEmail());
        usuarioDto.setTelefono(planUsuario.getUsuario().getTelefono());

        return PlanUsuarioDto.builder()
                .id(planUsuario.getId())
                .usuarioId(planUsuario.getUsuario().getId())
                .entrenamientoId(planUsuario.getEntrenamiento().getId())
                .fechaInicio(planUsuario.getFechaInicio())
                .fechaFin(planUsuario.getFechaFin())
                .activo(planUsuario.getActivo())
                .fechaUltimaSesion(planUsuario.getFechaUltimaSesion())
                .ejerciciosCompletadosIds(ejerciciosCompletadosIds)
                .entrenamiento(entrenamientoDto)
                .usuario(usuarioDto)
                .build();
    }
}

