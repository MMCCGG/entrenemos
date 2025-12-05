package com.entrenemos.services;

import com.entrenemos.dto.UsuarioDto;
import com.entrenemos.entity.Rol;
import com.entrenemos.entity.Usuario;
import com.entrenemos.repository.RolRepository;
import com.entrenemos.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioServiceImpl implements UsuarioService{
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;


    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, RolRepository rolRepository){
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
    }

    @Override
    public List<UsuarioDto> listarUsuarios(){
        return usuarioRepository.findAll()
                .stream()
                .map(u -> {
                    UsuarioDto dto = new UsuarioDto();
                    dto.setId(u.getId());
                    dto.setNombre(u.getNombre());
                    dto.setEmail(u.getEmail());
                    dto.setRol(u.getRol().getNombre());
                    dto.setTelefono(u.getTelefono());
                    dto.setFechaRegistro(u.getFechaRegistro());
                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    public UsuarioDto guardarUsuario(UsuarioDto usuarioDTO) {
        Usuario usuario = new Usuario();
        usuario.setNombre(usuarioDTO.getNombre());
        usuario.setEmail(usuarioDTO.getEmail());
        usuario.setPassword(usuarioDTO.getPassword());
        usuario.setTelefono(usuarioDTO.getTelefono());
        usuario.setFechaRegistro(LocalDateTime.now());

        var rol = rolRepository.findByNombre(usuarioDTO.getRol())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        usuario.setRol(rol);

        usuarioRepository.save(usuario);

        usuarioDTO.setId(usuario.getId());
        usuarioDTO.setFechaRegistro(usuario.getFechaRegistro());
        return usuarioDTO;
    }

    @Override
    public UsuarioDto obtenerUsuario(Long id) {
        var usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UsuarioDto dto = new UsuarioDto();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setEmail(usuario.getEmail());
        dto.setTelefono(usuario.getTelefono());
        dto.setFechaRegistro(usuario.getFechaRegistro());
        dto.setRol(usuario.getRol().getNombre());

        return dto;
    }

    @Override
    public UsuarioDto actualizarUsuario(Long id, UsuarioDto usuarioDto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(usuarioDto.getNombre());
        usuario.setEmail(usuarioDto.getEmail());
        usuario.setTelefono(usuarioDto.getTelefono());

        if (usuarioDto.getPassword() != null && !usuarioDto.getPassword().isBlank()) {
            usuario.setPassword(usuarioDto.getPassword());
        }

        var rol = rolRepository.findByNombre(usuarioDto.getRol())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        usuario.setRol(rol);

        usuarioRepository.save(usuario);

        usuarioDto.setId(usuario.getId());
        usuarioDto.setFechaRegistro(usuario.getFechaRegistro());
        return usuarioDto;
    }

    @Override
    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }
}
