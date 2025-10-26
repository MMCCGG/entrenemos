package com.entrenemos.restcontroller;

import com.entrenemos.dto.RolDto;
import com.entrenemos.services.RolService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RolController {

    private final RolService rolService;

    @PostMapping
    public RolDto crearRol(@RequestBody RolDto rolDto){
        return rolService.crearRol(rolDto);
    }

    @GetMapping
    public List<RolDto> listarRoles(){
        return rolService.listarRoles();
    }

    @GetMapping("/{id}")
    public RolDto obtenerRol(@PathVariable Long id){
        return rolService.obtenerRolPorId(id);
    }

    @DeleteMapping("/{id}")
    public void eliminarRol(@PathVariable Long id){
        rolService.eliminarRol(id);
    }
}
