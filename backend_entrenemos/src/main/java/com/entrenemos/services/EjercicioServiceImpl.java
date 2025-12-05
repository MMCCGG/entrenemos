package com.entrenemos.services;

import com.entrenemos.dto.EjercicioDto;
import com.entrenemos.entity.Ejercicio;
import com.entrenemos.repository.EjercicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EjercicioServiceImpl implements EjercicioService{

    private final EjercicioRepository ejercicioRepository;

    @Override
    public EjercicioDto crear(EjercicioDto dto){
        Ejercicio e = Ejercicio.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .tipo(dto.getTipo())
                .videoUrl(dto.getVideoUrl())
                .build();
        e = ejercicioRepository.save(e);
        return new EjercicioDto(e.getId(),e.getNombre(), e.getDescripcion(), e.getRepeticiones(), e.getPeso(), e.getTipo(), e.getVideoUrl());
    }

    @Override
    public List<EjercicioDto> listar(){
        return ejercicioRepository.findAll()
                .stream()
                .map(e -> new EjercicioDto(e.getId(),e.getNombre(), e.getDescripcion(), e.getRepeticiones(), e.getPeso(), e.getTipo(), e.getVideoUrl()))
                .collect(Collectors.toList());
    }

    @Override
    public EjercicioDto obtenerPorId(Long id){
        Ejercicio e = ejercicioRepository.findById(id).orElseThrow();
        return new EjercicioDto(e.getId(),e.getNombre(), e.getDescripcion(), e.getRepeticiones(), e.getPeso(), e.getTipo(), e.getVideoUrl());
    }

    @Override
    public  void eliminar(Long id){
        ejercicioRepository.deleteById(id);
    }
}
