package com.entrenemos.services;

import com.entrenemos.dto.RolDto;
import com.entrenemos.entity.Rol;
import com.entrenemos.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolServiceImpl implements RolService{

    private final RolRepository rolRepository;

    @Override
    public RolDto crearRol(RolDto rolDto){
        Rol rol = Rol.builder().nombre(rolDto.getNombre()).build();
        rol = rolRepository.save(rol);
        return RolDto.builder().id(rol.getId()).nombre(rol.getNombre()).build();
    }

    @Override
    public List<RolDto> listarRoles(){
        return rolRepository.findAll().stream()
                .map(r -> RolDto.builder().id(r.getId()).nombre(r.getNombre()).build())
                .collect(Collectors.toList());
    }

    @Override
    public RolDto obtenerRolPorId(Long id){
        Rol rol = rolRepository.findById(id).orElseThrow();
        return RolDto.builder().id(rol.getId()).nombre(rol.getNombre()).build();
    }

    @Override
    public void eliminarRol(Long id){
        rolRepository.deleteById(id);
    }
}
