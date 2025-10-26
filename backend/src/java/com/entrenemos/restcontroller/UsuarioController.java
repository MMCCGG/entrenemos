package com.entrenemos.restcontroller;

import com.entrenemos.dto.UsuarioDto;
import com.entrenemos.services.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<UsuarioDto> listar() {
        return usuarioService.listarUsuarios();
    }

    @PostMapping
    public UsuarioDto guardar(@RequestBody UsuarioDto usuarioDto) {
        return usuarioService.guardarUsuario(usuarioDto);
    }
}
