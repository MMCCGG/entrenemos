package com.entrenemos.restcontroller;

import com.entrenemos.dto.EntrenamientoDto;
import com.entrenemos.services.EntrenamientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entrenamientos")
@RequiredArgsConstructor
public class EntrenamientoController {

    private final EntrenamientoService entrenamientoService;

    @PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR')")
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

    @PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR')")
    @PutMapping("/{id}")
    public EntrenamientoDto actualizar(@PathVariable Long id, @RequestBody EntrenamientoDto dto) {
        return entrenamientoService.actualizar(id, dto);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        entrenamientoService.eliminar(id);
    }
}
