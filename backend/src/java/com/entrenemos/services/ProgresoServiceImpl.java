package com.entrenemos.services;

import com.entrenemos.dto.ProgresoDto;
import com.entrenemos.entity.Ejercicio;
import com.entrenemos.entity.Progreso;
import com.entrenemos.entity.Usuario;
import com.entrenemos.repository.EjercicioRepository;
import com.entrenemos.repository.ProgresoRepository;
import com.entrenemos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgresoServiceImpl implements ProgresoService{

    private final ProgresoRepository progresoRepository;
    private final EjercicioRepository ejercicioRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public ProgresoDto crear(ProgresoDto dto) {

        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Ejercicio ejercicio = ejercicioRepository.findById(dto.getEjercicioId()).orElseThrow();
        Progreso p = Progreso.builder()
                .fecha(dto.getFecha())
                .peso(dto.getPeso())
                .repeticiones(dto.getRepeticiones())
                .tiempo(dto.getTiempo())
                .usuario(usuario)
                .ejercicio(ejercicio)
                .build();
        p = progresoRepository.save(p);

        return new ProgresoDto(
                p.getId(),
                p.getFecha(),
                p.getPeso(),
                p.getRepeticiones(),
                p.getTiempo(),
                p.getUsuario().getId(),
                p.getEjercicio().getId()
        );
    }

    @Override
    public List<ProgresoDto> listar() {
        return progresoRepository.findAll()
                .stream()
                .map(p -> new ProgresoDto(
                        p.getId(),
                        p.getFecha(),
                        p.getPeso(),
                        p.getRepeticiones(),
                        p.getTiempo(),
                        p.getUsuario().getId(),
                        p.getEjercicio().getId()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public ProgresoDto obtenerPorId(Long id) {
        Progreso p = progresoRepository.findById(id).orElseThrow();
        return new ProgresoDto(p.getId(),
                p.getFecha(),
                p.getPeso(),
                p.getRepeticiones(),
                p.getTiempo(),
                p.getUsuario().getId(),
                p.getEjercicio().getId());
    }

    @Override
    public void eliminar(Long id) {
        progresoRepository.deleteById(id);
    }

}
