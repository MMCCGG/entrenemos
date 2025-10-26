package com.entrenemos.restcontroller;

import com.entrenemos.dto.ProgresoDto;
import com.entrenemos.services.ProgresoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progresos")
@RequiredArgsConstructor
public class ProgresoController {

    private final ProgresoService progresoService;

    @PostMapping
    public ProgresoDto crear(@RequestBody ProgresoDto dto) {
        return progresoService.crear(dto);
    }

    @GetMapping
    public List<ProgresoDto> listar() {
        return progresoService.listar();
    }

    @GetMapping("/{id}")
    public ProgresoDto obtener(@PathVariable Long id) {
        return progresoService.obtenerPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        progresoService.eliminar(id);
    }
}
