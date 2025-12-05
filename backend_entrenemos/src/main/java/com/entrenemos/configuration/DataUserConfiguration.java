package com.entrenemos.configuration;

import com.entrenemos.entity.Rol;
import com.entrenemos.repository.RolRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataUserConfiguration {

    @Bean
    CommandLineRunner initRoles(RolRepository rolRepository) {
        return args -> {
            if (rolRepository.findAll().isEmpty()) {
                rolRepository.save(new Rol(null, "ADMIN"));
                rolRepository.save(new Rol(null, "ENTRENADOR"));
                rolRepository.save(new Rol(null, "ATLETA"));
            }
        };
    }
}
