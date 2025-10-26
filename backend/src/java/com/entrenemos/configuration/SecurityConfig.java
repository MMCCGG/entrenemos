package com.entrenemos.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // libre
                        .requestMatchers("/api/usuarios/crear").permitAll() //
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable()) // 🔴 desactiva el login por formulario
                .httpBasic(basic -> basic.disable()); // 🔴 desactiva login básico también

        return http.build();
    }
}
