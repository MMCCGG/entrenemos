package com.entrenemos.services;

import com.entrenemos.dto.UsuarioDto;
import com.entrenemos.entity.Rol;
import com.entrenemos.entity.Usuario;
import com.entrenemos.repository.RolRepository;
import com.entrenemos.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

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
                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    public UsuarioDto guardarUsuario(UsuarioDto usuarioDTO) {
        Usuario usuario = new Usuario();
        usuario.setNombre(usuarioDTO.getNombre());
        usuario.setEmail(usuarioDTO.getEmail());
        usuario.setPassword(usuarioDTO.getPassword());

        var rol = rolRepository.findByNombre(usuarioDTO.getRol())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        usuario.setRol(rol);

        usuarioRepository.save(usuario);

        usuarioDTO.setId(usuario.getId());
        return usuarioDTO;
    }
}
