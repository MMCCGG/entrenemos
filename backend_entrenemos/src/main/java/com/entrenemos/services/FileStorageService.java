package com.entrenemos.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String storeFile(MultipartFile file, String subfolder) throws IOException {
        // Crear directorio si no existe
        Path uploadPath = Paths.get(uploadDir, subfolder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generar nombre único para el archivo
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;

        // Guardar el archivo
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Devolver la ruta relativa para almacenar en BD
        return "/uploads/" + subfolder + "/" + filename;
    }

    public void deleteFile(String filePath) throws IOException {
        if (filePath != null && filePath.startsWith("/uploads/")) {
            Path path = Paths.get(uploadDir, filePath.substring("/uploads/".length()));
            Files.deleteIfExists(path);
        }
    }
}


