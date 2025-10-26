package com.entrenemos.restcontroller;

import com.entrenemos.dto.EntrenamientoDto;
import com.entrenemos.services.EntrenamientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entrenamientos")
@RequiredArgsConstructor
public class EntrenamientoController {

    private final EntrenamientoService entrenamientoService;

    @PostMapping
    public EntrenamientoDto crear(@RequestBody EntrenamientoDto dto) {
        return entrenamientoService.crear(dto);
    }

    @GetMapping
    public List<EntrenamientoDto> listar() {
        return entrenamientoService.listar();
    }

    @GetMapping("/{id}")
    public EntrenamientoDto obtener(@PathVariable Long id) {
        return entrenamientoService.obtenerPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        entrenamientoService.eliminar(id);
    }
}
