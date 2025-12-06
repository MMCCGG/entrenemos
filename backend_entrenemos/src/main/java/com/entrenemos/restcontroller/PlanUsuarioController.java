package com.entrenemos.restcontroller;

import com.entrenemos.dto.PlanUsuarioDto;
import com.entrenemos.services.PlanUsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plan-usuario")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlanUsuarioController {

    private final PlanUsuarioService planUsuarioService;

    @PostMapping
    public ResponseEntity<PlanUsuarioDto> crear(@RequestBody PlanUsuarioDto dto) {
        PlanUsuarioDto creado = planUsuarioService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanUsuarioDto> obtenerPorId(@PathVariable Long id) {
        PlanUsuarioDto plan = planUsuarioService.obtenerPorId(id);
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/usuario/{usuarioId}/activo")
    public ResponseEntity<PlanUsuarioDto> obtenerPlanActivo(@PathVariable Long usuarioId) {
        PlanUsuarioDto plan = planUsuarioService.obtenerPlanActivo(usuarioId);
        if (plan == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<PlanUsuarioDto>> obtenerPlanesUsuario(@PathVariable Long usuarioId) {
        List<PlanUsuarioDto> planes = planUsuarioService.obtenerPlanesUsuario(usuarioId);
        return ResponseEntity.ok(planes);
    }

    @PostMapping("/{planUsuarioId}/ejercicio/{ejercicioId}/completar")
    public ResponseEntity<PlanUsuarioDto> marcarEjercicioCompletado(
            @PathVariable Long planUsuarioId,
            @PathVariable Long ejercicioId) {
        PlanUsuarioDto plan = planUsuarioService.marcarEjercicioCompletado(planUsuarioId, ejercicioId);
        return ResponseEntity.ok(plan);
    }

    @PutMapping("/{planUsuarioId}/finalizar")
    public ResponseEntity<PlanUsuarioDto> finalizarPlan(@PathVariable Long planUsuarioId) {
        PlanUsuarioDto plan = planUsuarioService.finalizarPlan(planUsuarioId);
        return ResponseEntity.ok(plan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanUsuarioDto> actualizar(
            @PathVariable Long id,
            @RequestBody PlanUsuarioDto dto) {
        PlanUsuarioDto actualizado = planUsuarioService.actualizar(id, dto);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        planUsuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

