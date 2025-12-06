package com.entrenemos.restcontroller;

import com.entrenemos.dto.LoginDto;
import com.entrenemos.dto.UsuarioDto;
import com.entrenemos.entity.Usuario;
import com.entrenemos.repository.UsuarioRepository;
import com.entrenemos.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        // Buscar usuario por email
        Usuario usuario = usuarioRepository.findByEmail(loginDto.getEmail())
                .orElse(null);

        // Validar existencia y contraseña con BCrypt
        if (usuario == null || !usuario.getPassword().equals(loginDto.getPassword())) {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }

        // Generar token JWT
        String token = jwtUtil.generarToken(usuario.getEmail(), usuario.getRol().getNombre());



        Map<String, Object> response = new HashMap<>();
        response.put("jwt", token);
        response.put("rol", usuario.getRol().getNombre());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Collections.singletonMap("error", "Token faltante o inválido"));
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validarToken(token)) {
            return ResponseEntity.status(401).body(Collections.singletonMap("error", "Token inválido"));
        }

        String email = jwtUtil.getUsername(token);
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(404).body(Collections.singletonMap("error", "Usuario no encontrado"));
        }

        // Mapear a DTO para devolver solo datos necesarios
        UsuarioDto dto = new UsuarioDto();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setEmail(usuario.getEmail());
        dto.setTelefono(usuario.getTelefono());
        dto.setFechaRegistro(usuario.getFechaRegistro());
        dto.setRol(usuario.getRol().getNombre());
        dto.setFotoPerfil(usuario.getFotoPerfil());

        return ResponseEntity.ok(dto);
    }
}