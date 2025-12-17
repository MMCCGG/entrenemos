package com.entrenemos.restcontroller;

import com.entrenemos.dto.MensajeDto;
import com.entrenemos.entity.Mensaje;
import com.entrenemos.entity.Usuario;
import com.entrenemos.repository.MensajeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

import com.entrenemos.repository.UsuarioRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/mensajes")
@CrossOrigin("*")
@RequiredArgsConstructor
public class MensajeController {

    private final MensajeRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Mensaje> obtenerMensajes() {
        return mensajeRepository.findAllByOrderByFechaAsc();
    }

    @PostMapping
    public Mensaje guardarMensaje(@RequestBody MensajeDto dto) {
        Usuario usuario = obtenerUsuarioDeLaSesion();

        Mensaje mensaje = new Mensaje();
        mensaje.setContenido(dto.getContenido());
        mensaje.setUsuario(usuario);
        mensaje.setTipo(Mensaje.TipoMensaje.USUARIO);
        mensaje.setFecha(LocalDateTime.now());

        return mensajeRepository.save(mensaje);
    }

    private Usuario obtenerUsuarioDeLaSesion() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("No hay usuario autenticado");
        }

        return usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}


