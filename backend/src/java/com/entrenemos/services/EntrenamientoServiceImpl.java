package com.entrenemos.services;

import com.entrenemos.dto.EntrenamientoDto;
import com.entrenemos.entity.Ejercicio;
import com.entrenemos.entity.Entrenamiento;
import com.entrenemos.repository.EjercicioRepository;
import com.entrenemos.repository.EntrenamientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EntrenamientoServiceImpl implements EntrenamientoService{

    private final EntrenamientoRepository entrenamientoRepository;
    private final EjercicioRepository ejercicioRepository;

    @Override
    public EntrenamientoDto crear(EntrenamientoDto dto){
        List<Ejercicio> ejercicios = ejercicioRepository.findAllById(dto.getEjerciciosIds());

        Entrenamiento ent = Entrenamiento.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .ejercicios(ejercicios)
                .build();

        ent = entrenamientoRepository.save(ent);

        return new EntrenamientoDto(ent.getId(), ent.getNombre(), ent.getDescripcion(), ent.getFechaInicio(), ent.getFechaFin(), ent.getEjercicios().stream().map(Ejercicio::getId).collect(Collectors.toList()));
    }

    @Override
    public List<EntrenamientoDto> listar() {
        return entrenamientoRepository.findAll()
                .stream()
                .map(ent -> new EntrenamientoDto(
                        ent.getId(),
                        ent.getNombre(),
                        ent.getDescripcion(),
                        ent.getFechaInicio(),
                        ent.getFechaFin(),
                        ent.getEjercicios().stream().map(Ejercicio::getId).collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
    }

    @Override
    public EntrenamientoDto obtenerPorId(Long id) {
        Entrenamiento ent = entrenamientoRepository.findById(id).orElseThrow();
        return new EntrenamientoDto(
                ent.getId(),
                ent.getNombre(),
                ent.getDescripcion(),
                ent.getFechaInicio(),
                ent.getFechaFin(),
                ent.getEjercicios().stream().map(Ejercicio::getId).collect(Collectors.toList())
        );
    }

    @Override
    public void eliminar(Long id) {
        entrenamientoRepository.deleteById(id);
    }
}
