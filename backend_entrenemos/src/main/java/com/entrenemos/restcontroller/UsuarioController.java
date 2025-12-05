package com.entrenemos.restcontroller;

import com.entrenemos.dto.UsuarioDto;
import com.entrenemos.services.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
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

    @GetMapping("/{id}")
    public UsuarioDto obtenerPorId(@PathVariable Long id) {return usuarioService.obtenerUsuario(id);}

    @PutMapping("/{id}")
    public UsuarioDto actualizar(@PathVariable Long id, @RequestBody UsuarioDto usuarioDto) {return usuarioService.actualizarUsuario(id, usuarioDto);}

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id){usuarioService.eliminarUsuario(id);}

}
