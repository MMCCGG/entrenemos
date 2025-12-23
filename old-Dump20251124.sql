-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: entrenemos
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ejercicios`
--

DROP TABLE IF EXISTS `ejercicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ejercicios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `peso` double DEFAULT NULL,
  `repeticiones` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ejercicios`
--

LOCK TABLES `ejercicios` WRITE;
/*!40000 ALTER TABLE `ejercicios` DISABLE KEYS */;
INSERT INTO `ejercicios` VALUES (1,'Flexiones','Ejercicio de fuerza para pecho y brazos. Realiza flexiones con buena técnica, manteniendo el cuerpo recto.','Fuerza',NULL,NULL,15),(2,'Sentadillas','Ejercicio fundamental para piernas y glúteos. Mantén la espalda recta y baja hasta que los muslos estén paralelos al suelo.','Fuerza',NULL,NULL,20),(3,'Plancha','Ejercicio isométrico para core. Mantén la posición durante 30-60 segundos con el cuerpo recto.','Core',NULL,NULL,1),(4,'Burpees','Ejercicio completo de cuerpo. Combina sentadilla, flexión y salto. Excelente para cardio.','Cardio',NULL,NULL,10),(5,'Abdominales','Ejercicio para fortalecer el abdomen. Controla el movimiento y no uses el impulso.','Core',NULL,NULL,20),(6,'Zancadas','Ejercicio unilateral para piernas. Alterna ambas piernas manteniendo el equilibrio.','Fuerza',NULL,NULL,12),(7,'TRX Remo','Ejercicio con TRX para trabajar la espalda y bíceps mediante un remo inclinado.','Fuerza',NULL,NULL,12),(8,'TRX Press Pecho','Ejercicio de empuje en suspensión para fortalecer pecho, hombros y tríceps.','Fuerza',NULL,NULL,12),(9,'TRX Sentadilla en Suspensión','Sentadilla asistida con TRX que mejora la técnica y activa glúteos y piernas.','Fuerza',NULL,NULL,15),(10,'TRX Pike','Ejercicio avanzado de core usando TRX que eleva la cadera manteniendo piernas suspendidas.','Core',NULL,NULL,10);
/*!40000 ALTER TABLE `ejercicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entrenamiento_ejercicios`
--

DROP TABLE IF EXISTS `entrenamiento_ejercicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entrenamiento_ejercicios` (
  `entrenamiento_id` bigint NOT NULL,
  `ejercicio_id` bigint NOT NULL,
  PRIMARY KEY (`entrenamiento_id`,`ejercicio_id`),
  KEY `fk_ejercicio` (`ejercicio_id`),
  CONSTRAINT `fk_ejercicio` FOREIGN KEY (`ejercicio_id`) REFERENCES `ejercicios` (`id`),
  CONSTRAINT `fk_entrenamiento` FOREIGN KEY (`entrenamiento_id`) REFERENCES `entrenamientos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entrenamiento_ejercicios`
--

LOCK TABLES `entrenamiento_ejercicios` WRITE;
/*!40000 ALTER TABLE `entrenamiento_ejercicios` DISABLE KEYS */;
INSERT INTO `entrenamiento_ejercicios` VALUES (3,1),(3,2),(3,3),(3,4),(3,5),(3,6),(2,7),(2,8),(2,9),(2,10);
/*!40000 ALTER TABLE `entrenamiento_ejercicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entrenamientos`
--

DROP TABLE IF EXISTS `entrenamientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entrenamientos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entrenamientos`
--

LOCK TABLES `entrenamientos` WRITE;
/*!40000 ALTER TABLE `entrenamientos` DISABLE KEYS */;
INSERT INTO `entrenamientos` VALUES (2,'Plan TRX','Entrenamiento con TRX. Una semana al completo para dominarlos todos','2025-01-01','2025-01-31'),(3,'Plan de Fuerza para Principiantes','Programa de 7 días diseñado para personas que comienzan su viaje fitness. Incluye ejercicios básicos de fuerza y cardio para mejorar la condición física general.','2025-11-23','2025-11-30');
/*!40000 ALTER TABLE `entrenamientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `progresos`
--

DROP TABLE IF EXISTS `progresos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progresos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha` date DEFAULT NULL,
  `peso` double DEFAULT NULL,
  `repeticiones` int DEFAULT NULL,
  `tiempo` double DEFAULT NULL,
  `ejercicio_id` bigint DEFAULT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_progreso_ejercicio` (`ejercicio_id`),
  KEY `fk_progreso_usuario` (`usuario_id`),
  CONSTRAINT `fk_progreso_ejercicio` FOREIGN KEY (`ejercicio_id`) REFERENCES `ejercicios` (`id`),
  CONSTRAINT `fk_progreso_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progresos`
--

LOCK TABLES `progresos` WRITE;
/*!40000 ALTER TABLE `progresos` DISABLE KEYS */;
INSERT INTO `progresos` VALUES (1,'2025-11-24',1,NULL,NULL,5,1);
/*!40000 ALTER TABLE `progresos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN'),(3,'ATLETA'),(2,'ENTRENADOR');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol_id` bigint NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_usuario_rol` (`rol_id`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Admin','admin@gmail.com','1234',1,NULL,'2025-11-20 20:28:08'),(2,'Mariano','hola@mariano.com','1111',3,'612345678','2025-11-20 20:56:45'),(3,'Pablo','hola@pablo.com','0000',3,'600123456','2025-11-24 08:55:47');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 10:52:12
