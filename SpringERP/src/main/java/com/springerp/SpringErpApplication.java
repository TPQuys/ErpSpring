package com.springerp;

import com.springerp.models.Role;
import com.springerp.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SpringErpApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringErpApplication.class, args);
    }
    @Bean
    CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            if (!roleRepository.findByRoleName("USER").isPresent()) {
                Role userRole = new Role();
                userRole.setRoleName("USER");
                roleRepository.save(userRole);
            }
        };
    }
}
