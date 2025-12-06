package com.entrenemos.restcontroller;

import com.entrenemos.dto.UsuarioDto;
import com.entrenemos.entity.Usuario;
import com.entrenemos.repository.UsuarioRepository;
import com.entrenemos.security.JwtUtil;
import com.entrenemos.services.FileStorageService;
import com.entrenemos.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UsuarioPerfilController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    private final FileStorageService fileStorageService;
    private final JwtUtil jwtUtil;

    @PostMapping("/{id}/foto-perfil")
    public ResponseEntity<?> subirFotoPerfil(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            // Validar autenticación
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "No autorizado"));
            }

            // Validar que el usuario solo puede actualizar su propio perfil
            String token = authHeader.substring(7);
            String email = jwtUtil.getUsername(token);
            Usuario usuarioAutenticado = usuarioRepository.findByEmail(email)
                    .orElse(null);
            
            if (usuarioAutenticado == null || !usuarioAutenticado.getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No tienes permiso para actualizar este perfil"));
            }

            // Validar que es una imagen
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El archivo está vacío"));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El archivo debe ser una imagen"));
            }

            // Obtener usuario
            Usuario usuario = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Eliminar foto anterior si existe
            if (usuario.getFotoPerfil() != null && !usuario.getFotoPerfil().isEmpty()) {
                try {
                    fileStorageService.deleteFile(usuario.getFotoPerfil());
                } catch (IOException e) {
                    // Log error pero continuar
                    System.err.println("Error eliminando foto anterior: " + e.getMessage());
                }
            }

            // Guardar nueva foto
            String fotoPath = fileStorageService.storeFile(file, "perfiles");

            // Actualizar usuario
            usuario.setFotoPerfil(fotoPath);
            usuarioRepository.save(usuario);

            // Devolver DTO actualizado
            UsuarioDto dto = usuarioService.obtenerUsuario(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Foto de perfil actualizada correctamente");
            response.put("usuario", dto);
            response.put("fotoPerfil", fotoPath);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al guardar la imagen: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error: " + e.getMessage()));
        }
    }
}


