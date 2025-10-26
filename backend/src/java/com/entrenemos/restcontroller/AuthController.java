package com.entrenemos.restcontroller;

import com.entrenemos.dto.LoginDto;
import com.entrenemos.entity.Usuario;
import com.entrenemos.repository.UsuarioRepository;
import com.entrenemos.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto){
        Usuario usuario = usuarioRepository.findByEmail(loginDto.getEmail())
                .orElse(null);

        if (usuario == null || !usuario.getPassword().equals(loginDto.getPassword())){
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }

        String token = jwtUtil.generarToken(usuario.getEmail(), usuario.getRol().getNombre());

        return ResponseEntity.ok().body(
                new Object(){
                    public final String jwt = token;
                    public final String rol = usuario.getRol().getNombre();
                }
        );
    }
}
