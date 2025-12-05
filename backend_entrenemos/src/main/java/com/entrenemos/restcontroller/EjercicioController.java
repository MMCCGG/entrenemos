package com.entrenemos.restcontroller;

import com.entrenemos.dto.EjercicioDto;
import com.entrenemos.services.EjercicioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ejercicios")
@RequiredArgsConstructor
public class EjercicioController {

    private final EjercicioService ejercicioService;

    @PostMapping
    public EjercicioDto crear(@RequestBody EjercicioDto dto) {
        return ejercicioService.crear(dto);
    }

    @GetMapping
    public List<EjercicioDto> listar() {
        return ejercicioService.listar();
    }

    @GetMapping("/{id}")
    public EjercicioDto obtener(@PathVariable Long id) {
        return ejercicioService.obtenerPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        ejercicioService.eliminar(id);
    }
}
