-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: transparencia
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `transparencia`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `transparencia` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `transparencia`;

--
-- Table structure for table `ampliaciones`
--

DROP TABLE IF EXISTS `ampliaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ampliaciones` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `entidad_type` varchar(255) NOT NULL,
  `entidad_id` bigint unsigned NOT NULL,
  `dias` int NOT NULL,
  `justificacion` text NOT NULL,
  `numero` int DEFAULT NULL,
  `aprobado_por_id` bigint unsigned DEFAULT NULL,
  `solicitado_por` varchar(255) DEFAULT NULL,
  `archivo_respaldo` varchar(255) DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ampliaciones_entidad_type_entidad_id_index` (`entidad_type`,`entidad_id`),
  KEY `ampliaciones_aprobado_por_id_foreign` (`aprobado_por_id`),
  CONSTRAINT `ampliaciones_aprobado_por_id_foreign` FOREIGN KEY (`aprobado_por_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ampliaciones`
--

LOCK TABLES `ampliaciones` WRITE;
/*!40000 ALTER TABLE `ampliaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `ampliaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bitacora`
--

DROP TABLE IF EXISTS `bitacora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `denuncia_id` bigint unsigned DEFAULT NULL,
  `entidad_tipo` varchar(50) DEFAULT NULL,
  `entidad_id` bigint unsigned DEFAULT NULL,
  `accion` varchar(255) NOT NULL,
  `detalle` text NOT NULL,
  `usuario_id` bigint unsigned NOT NULL,
  `fecha` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bitacora_usuario_id_foreign` (`usuario_id`),
  KEY `bitacora_denuncia_id_index` (`denuncia_id`),
  KEY `bitacora_fecha_denuncia_id_index` (`fecha`,`denuncia_id`),
  KEY `bitacora_entidad_tipo_entidad_id_index` (`entidad_tipo`,`entidad_id`),
  CONSTRAINT `bitacora_denuncia_id_foreign` FOREIGN KEY (`denuncia_id`) REFERENCES `denuncias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bitacora_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bitacora`
--

LOCK TABLES `bitacora` WRITE;
/*!40000 ALTER TABLE `bitacora` DISABLE KEYS */;
INSERT INTO `bitacora` VALUES (1,1,NULL,NULL,'ingresada','DENUNCIA REGISTRADA CON TICKET DEN-2026-0001',2,'2026-02-16 08:30:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(2,2,NULL,NULL,'ingresada','DENUNCIA REGISTRADA CON TICKET DEN-2026-0002 EN MODO ANÓNIMO',2,'2026-03-15 10:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(3,3,NULL,NULL,'ingresada','DENUNCIA REGISTRADA CON TICKET DEN-2026-0003 EN MODO RESERVADA',2,'2026-04-05 09:15:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(4,4,NULL,NULL,'ingresada','DENUNCIA REGISTRADA CON TICKET DEN-2026-0004',2,'2026-04-22 11:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(5,4,NULL,NULL,'admitida','DENUNCIA ADMITIDA PARA INVESTIGACIÓN',1,'2026-04-25 14:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(6,5,NULL,NULL,'ingresada','DENUNCIA REGISTRADA CON TICKET DEN-2026-0005',2,'2026-05-07 08:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(7,5,NULL,NULL,'rechazada','DENUNCIA RECHAZADA POR NO CONSTITUIR ACTO DE CORRUPCIÓN',1,'2026-05-10 16:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(8,6,NULL,NULL,'ingresada','DENUNCIA REGISTRADA CON TICKET DEN-2026-0006',2,'2026-05-22 10:30:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(9,6,NULL,NULL,'admitida','DENUNCIA ADMITIDA PARA INVESTIGACIÓN',1,'2026-05-25 09:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(10,6,NULL,NULL,'asignada','DENUNCIA ASIGNADA A CARLOS QUISPE',1,'2026-05-26 10:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(11,7,NULL,NULL,'ingresada','DENUNCIA REGISTRADA CON TICKET DEN-2026-0007',2,'2026-06-03 08:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(12,7,NULL,NULL,'admitida','DENUNCIA ADMITIDA POR NEGACIÓN DE INFORMACIÓN',1,'2026-06-06 11:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(13,7,NULL,NULL,'asignada','DENUNCIA ASIGNADA A ANA TORRES',1,'2026-06-07 09:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(14,8,NULL,NULL,'ingresada','DENUNCIA REGISTRADA CON TICKET DEN-2026-0008',2,'2026-05-17 09:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(15,8,NULL,NULL,'admitida','DENUNCIA ADMITIDA PARA INVESTIGACIÓN',1,'2026-05-20 10:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(16,8,NULL,NULL,'asignada','DENUNCIA ASIGNADA A CARLOS QUISPE',1,'2026-05-21 11:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(17,8,NULL,NULL,'investigacion','INVESTIGACIÓN INICIADA',3,'2026-05-28 09:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(18,8,NULL,NULL,'solicitud_creada','SOLICITUD DE INFORMACIÓN A UNIDAD DE SISTEMAS',3,'2026-05-28 09:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(19,8,NULL,NULL,'solicitud_creada','SOLICITUD DE INFORMACIÓN A UNIDAD DE ADQUISICIONES',3,'2026-06-01 09:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(20,9,NULL,NULL,'ingresada','DENUNCIA REGISTRADA CON TICKET DEN-2026-0009',2,'2026-06-13 11:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(21,9,NULL,NULL,'admitida','DENUNCIA ADMITIDA PARA INVESTIGACIÓN',1,'2026-06-16 09:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(22,9,NULL,NULL,'asignada','DENUNCIA ASIGNADA A ANA TORRES',1,'2026-06-17 10:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(23,9,NULL,NULL,'investigacion','INVESTIGACIÓN INICIADA',4,'2026-06-20 10:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(24,9,NULL,NULL,'descargo_notificado','DESCARGO NOTIFICADO A MARCELO SOLIZ POR CÉDULA N° 234/2026',4,'2026-06-20 10:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(25,9,NULL,NULL,'descargo_respondido','DESCARGO RESPONDIDO POR MARCELO SOLIZ',4,'2026-06-30 16:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(26,10,NULL,NULL,'ingresada','DENUNCIA REGISTRADA CON TICKET DEN-2026-0010',2,'2026-06-03 08:30:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(27,10,NULL,NULL,'admitida','DENUNCIA ADMITIDA PARA INVESTIGACIÓN',1,'2026-06-06 10:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(28,10,NULL,NULL,'asignada','DENUNCIA ASIGNADA A LUIS MAMANI',1,'2026-06-07 11:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(29,10,NULL,NULL,'investigacion','INVESTIGACIÓN INICIADA',5,'2026-06-10 09:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(30,10,NULL,NULL,'informe_redactado','INFORME FINAL REDACTADO CON CLASIFICACIÓN ADMINISTRATIVO',5,'2026-07-01 14:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(31,11,NULL,NULL,'ingresada','DENUNCIA REGISTRADA CON TICKET DEN-2026-0011',2,'2026-03-08 09:00:00','2026-08-04 05:29:28','2026-08-04 05:29:28'),(32,11,NULL,NULL,'admitida','DENUNCIA ADMITIDA POR NEGACIÓN DE INFORMACIÓN',1,'2026-03-10 10:00:00','2026-08-04 05:29:28','2026-08-04 05:29:28'),(33,11,NULL,NULL,'asignada','DENUNCIA ASIGNADA A LUIS MAMANI',1,'2026-03-11 11:00:00','2026-08-04 05:29:28','2026-08-04 05:29:28'),(34,11,NULL,NULL,'investigacion','INVESTIGACIÓN INICIADA',5,'2026-03-15 09:00:00','2026-08-04 05:29:28','2026-08-04 05:29:28'),(35,11,NULL,NULL,'informe_redactado','INFORME FINAL REDACTADO',5,'2026-05-10 14:00:00','2026-08-04 05:29:28','2026-08-04 05:29:28'),(36,11,NULL,NULL,'cierre_registrado','CIERRE REGISTRADO CON CLASIFICACIÓN ADMINISTRATIVO',5,'2026-05-15 16:00:00','2026-08-04 05:29:28','2026-08-04 05:29:28'),(37,12,NULL,NULL,'ingresada','DENUNCIA REGISTRADA CON TICKET DEN-2026-0012',2,'2026-02-12 09:00:00','2026-08-04 05:29:28','2026-08-04 05:29:28'),(38,12,NULL,NULL,'admitida','DENUNCIA ADMITIDA PARA INVESTIGACIÓN',1,'2026-02-14 10:00:00','2026-08-04 05:29:28','2026-08-04 05:29:28'),(39,12,NULL,NULL,'asignada','DENUNCIA ASIGNADA A CARLOS QUISPE',1,'2026-02-15 11:00:00','2026-08-04 05:29:28','2026-08-04 05:29:28'),(40,12,NULL,NULL,'investigacion','INVESTIGACIÓN INICIADA',3,'2026-02-20 09:00:00','2026-08-04 05:29:28','2026-08-04 05:29:28'),(41,12,NULL,NULL,'informe_redactado','INFORME FINAL REDACTADO CON CLASIFICACIÓN SIN INDICIOS',3,'2026-04-05 14:00:00','2026-08-04 05:29:28','2026-08-04 05:29:28'),(42,12,NULL,NULL,'cierre_registrado','CASO CERRADO Y ARCHIVADO POR SIN INDICIOS',3,'2026-04-10 16:00:00','2026-08-04 05:29:28','2026-08-04 05:29:28');
/*!40000 ALTER TABLE `bitacora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_denuncia`
--

DROP TABLE IF EXISTS `categorias_denuncia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_denuncia` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `clave` varchar(50) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `tipo_denuncia` varchar(20) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_desactivacion` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `desactivado_por_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categorias_denuncia_clave_unique` (`clave`),
  KEY `categorias_denuncia_desactivado_por_id_foreign` (`desactivado_por_id`),
  CONSTRAINT `categorias_denuncia_desactivado_por_id_foreign` FOREIGN KEY (`desactivado_por_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_denuncia`
--

LOCK TABLES `categorias_denuncia` WRITE;
/*!40000 ALTER TABLE `categorias_denuncia` DISABLE KEYS */;
INSERT INTO `categorias_denuncia` VALUES (1,'cohecho','COHECHO (SOBORNO)',NULL,'corrupcion',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(2,'concusion','CONCUSIÓN',NULL,'corrupcion',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(3,'malversacion','MALVERSACIÓN',NULL,'corrupcion',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(4,'negociaciones','NEGOCIACIONES INCOMPATIBLES',NULL,'corrupcion',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(5,'enriquecimiento','ENRIQUECIMIENTO ILÍCITO',NULL,'corrupcion',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(6,'trafico','TRÁFICO DE INFLUENCIAS',NULL,'corrupcion',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(7,'peculado','PECULADO',NULL,'corrupcion',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(8,'omision','OMISIÓN DE DENUNCIA',NULL,'corrupcion',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(9,'incumplimiento','INCUMPLIMIENTO DE DEBERES',NULL,'corrupcion',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(10,'otra_corrupcion','OTRA (CORRUPCIÓN)',NULL,'corrupcion',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(11,'negacion_info','NEGACIÓN DE INFORMACIÓN',NULL,'negacion',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(12,'otra_negacion','OTRA (NEGACIÓN)',NULL,'negacion',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL);
/*!40000 ALTER TABLE `categorias_denuncia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cierres`
--

DROP TABLE IF EXISTS `cierres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cierres` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `denuncia_id` bigint unsigned NOT NULL,
  `notificado_denunciante` tinyint(1) NOT NULL,
  `notificacion_medio` varchar(255) DEFAULT NULL,
  `notificacion_fecha` datetime DEFAULT NULL,
  `notificacion_descripcion` text,
  `no_notificado_motivo` text,
  `concluido_por` varchar(255) NOT NULL,
  `descripcion` text,
  `cerrado_at` datetime NOT NULL,
  `eliminado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_eliminacion` datetime DEFAULT NULL,
  `historial_ediciones` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cierres_denuncia_id_unique` (`denuncia_id`),
  CONSTRAINT `cierres_denuncia_id_foreign` FOREIGN KEY (`denuncia_id`) REFERENCES `denuncias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cierres`
--

LOCK TABLES `cierres` WRITE;
/*!40000 ALTER TABLE `cierres` DISABLE KEYS */;
INSERT INTO `cierres` VALUES (1,11,1,'NOTIFICACIÓN PERSONAL EN OFICINAS','2026-05-15 10:00:00','SE NOTIFICÓ A LA DENUNCIANTE SOBRE EL CIERRE DEL CASO',NULL,'LUIS MAMANI','SE CERRÓ EL CASO CON CLASIFICACIÓN ADMINISTRATIVO. SE REMITIRÁ A LA MAE PARA LAS ACCIONES CORRESPONDIENTES.','2026-05-15 16:00:00',0,NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(2,12,1,'EMAIL','2026-04-10 10:00:00','SE NOTIFICÓ AL DENUNCIANTE SOBRE EL ARCHIVO DEL CASO',NULL,'CARLOS QUISPE','CASO ARCHIVADO POR NO ENCONTRARSE INDICIOS SUFICIENTES DE ACTOS DE CORRUPCIÓN','2026-04-10 16:00:00',0,NULL,NULL,'2026-08-04 05:29:28','2026-08-04 05:29:28');
/*!40000 ALTER TABLE `cierres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_sistema`
--

DROP TABLE IF EXISTS `configuracion_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_sistema` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `valor` text NOT NULL,
  `descripcion` text,
  `actualizado_por_id` bigint unsigned DEFAULT NULL,
  `actualizado_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `configuracion_sistema_clave_unique` (`clave`),
  KEY `configuracion_sistema_actualizado_por_id_foreign` (`actualizado_por_id`),
  CONSTRAINT `configuracion_sistema_actualizado_por_id_foreign` FOREIGN KEY (`actualizado_por_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_sistema`
--

LOCK TABLES `configuracion_sistema` WRITE;
/*!40000 ALTER TABLE `configuracion_sistema` DISABLE KEYS */;
INSERT INTO `configuracion_sistema` VALUES (1,'siguiente_numero_ticket','13','SIGUIENTE NÚMERO DE TICKET',NULL,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24'),(3,'catalogo_clasificaciones','[{\"id\":1,\"clave\":\"penal\",\"nombre\":\"PENAL\",\"activo\":true},{\"id\":2,\"clave\":\"civil\",\"nombre\":\"CIVIL\",\"activo\":true},{\"id\":3,\"clave\":\"administrativo\",\"nombre\":\"ADMINISTRATIVO\",\"activo\":true},{\"id\":4,\"clave\":\"sin_indicios\",\"nombre\":\"SIN INDICIOS\",\"activo\":true},{\"id\":5,\"clave\":\"medida_correctiva\",\"nombre\":\"MEDIDA CORRECTIVA\",\"activo\":true},{\"id\":6,\"clave\":\"archivado\",\"nombre\":\"ARCHIVADO\",\"activo\":true}]','CLASIFICACIONES FINALES PARA INFORME',NULL,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24'),(4,'catalogo_tipos_denuncia','[{\"id\":1,\"clave\":\"corrupcion\",\"nombre\":\"CORRUPCI\\u00d3N\",\"activo\":true},{\"id\":2,\"clave\":\"negacion\",\"nombre\":\"NEGACI\\u00d3N DE INFORMACI\\u00d3N\",\"activo\":true}]','TIPOS DE DENUNCIA',NULL,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24'),(5,'catalogo_estados','[{\"id\":1,\"clave\":\"ingresada\",\"nombre\":\"INGRESADA\",\"activo\":true},{\"id\":2,\"clave\":\"evaluacion_tecnica\",\"nombre\":\"EVALUACI\\u00d3N T\\u00c9CNICA\",\"activo\":true},{\"id\":3,\"clave\":\"admitida\",\"nombre\":\"ADMITIDA\",\"activo\":true},{\"id\":4,\"clave\":\"rechazada\",\"nombre\":\"RECHAZADA\",\"activo\":true},{\"id\":5,\"clave\":\"asignada\",\"nombre\":\"ASIGNADA\",\"activo\":true},{\"id\":6,\"clave\":\"investigacion\",\"nombre\":\"INVESTIGACI\\u00d3N\",\"activo\":true},{\"id\":7,\"clave\":\"informe\",\"nombre\":\"INFORME\",\"activo\":true},{\"id\":8,\"clave\":\"cerrada\",\"nombre\":\"CERRADA\",\"activo\":true}]','ESTADOS DEL PROCESO DE DENUNCIA',NULL,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24'),(6,'catalogo_medios_notificacion','[{\"id\":1,\"clave\":\"whatsapp\",\"nombre\":\"WHATSAPP\",\"activo\":true},{\"id\":2,\"clave\":\"email\",\"nombre\":\"EMAIL\",\"activo\":true},{\"id\":3,\"clave\":\"presencial\",\"nombre\":\"PRESENCIAL\",\"activo\":true},{\"id\":4,\"clave\":\"otro\",\"nombre\":\"OTRO\",\"activo\":true}]','MEDIOS DE NOTIFICACIÓN DE DESCARGOS',NULL,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24'),(7,'catalogo_tipos_prueba','[{\"id\":1,\"nombre\":\"ARCHIVO\",\"activo\":true},{\"id\":2,\"nombre\":\"PRUEBA F\\u00cdSICA\",\"activo\":true},{\"id\":3,\"nombre\":\"TESTIGO\",\"activo\":true}]','TIPOS DE PRUEBA EN DENUNCIAS',NULL,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24');
/*!40000 ALTER TABLE `configuracion_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `denunciados`
--

DROP TABLE IF EXISTS `denunciados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `denunciados` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `denuncia_id` bigint unsigned NOT NULL,
  `orden` int NOT NULL DEFAULT '0',
  `conoce_identidad` tinyint(1) NOT NULL,
  `nombres` varchar(255) DEFAULT NULL,
  `dependencia` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `denunciados_denuncia_id_foreign` (`denuncia_id`),
  CONSTRAINT `denunciados_denuncia_id_foreign` FOREIGN KEY (`denuncia_id`) REFERENCES `denuncias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `denunciados`
--

LOCK TABLES `denunciados` WRITE;
/*!40000 ALTER TABLE `denunciados` DISABLE KEYS */;
INSERT INTO `denunciados` VALUES (1,1,0,1,'JUAN PEREZ','ALCALDÍA DE EL ALTO - CONTRATACIONES',NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(2,2,0,0,NULL,NULL,'FUNCIONARIO DE RECURSOS HUMANOS DE LA ALCALDÍA, VARÓN DE APROXIMADAMENTE 40 AÑOS, COMPLEXIÓN MEDIANA, USABA TRAJE AZUL DURANTE LA ATENCIÓN','2026-08-04 05:29:27','2026-08-04 05:29:27'),(3,3,0,1,'ROBERTO FLORES','MERCADO CENTRAL - ADMINISTRACIÓN',NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(4,3,1,1,'MARTHA MENDOZA','MERCADO CENTRAL - RECAUDACIONES',NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(5,4,0,1,'ELENA VARGAS','HOSPITAL MUNICIPAL EL ALTO - ADMINISTRACIÓN',NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(6,5,0,1,'FERNANDO GUTIÉRREZ','OFICINA DE ATENCIÓN AL CIUDADANO',NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(7,6,0,1,'ALBERTO MORALES','DIRECCIÓN DE OBRAS PÚBLICAS',NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(8,7,0,1,'SILVIA ANDRADE','UNIDAD DE SISTEMAS GAMEA',NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(9,8,0,1,'HÉCTOR MAMANI','DIRECCIÓN DE INGRESOS MUNICIPALES',NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(10,9,0,1,'MARCELO SOLIZ','SECRETARÍA GENERAL GAMEA',NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(11,10,0,1,'PATRICIA FLORES','UNIDAD DE ADQUISICIONES GAMEA',NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(12,11,0,1,'VÍCTOR HUGO SÁNCHEZ','UNIDAD DE CATASTRO',NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(13,12,0,1,'JOSÉ LUIS QUISBERT','MERCADO CENTRAL - ADMINISTRACIÓN',NULL,'2026-08-04 05:29:28','2026-08-04 05:29:28');
/*!40000 ALTER TABLE `denunciados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `denunciantes`
--

DROP TABLE IF EXISTS `denunciantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `denunciantes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `denuncia_id` bigint unsigned NOT NULL,
  `nombres` varchar(255) DEFAULT NULL,
  `ci` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `denunciantes_denuncia_id_unique` (`denuncia_id`),
  CONSTRAINT `denunciantes_denuncia_id_foreign` FOREIGN KEY (`denuncia_id`) REFERENCES `denuncias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `denunciantes`
--

LOCK TABLES `denunciantes` WRITE;
/*!40000 ALTER TABLE `denunciantes` DISABLE KEYS */;
INSERT INTO `denunciantes` VALUES (1,1,'MARÍA RODRÍGUEZ','1234567','maria@email.com','71234567','2026-08-04 05:29:27','2026-08-04 05:29:27'),(2,2,NULL,NULL,NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(3,3,'CARLOS LÓPEZ','7654321','carlos@email.com','71234569','2026-08-04 05:29:27','2026-08-04 05:29:27'),(4,4,'SOFÍA RAMÍREZ','9876543','sofia@email.com','71234570','2026-08-04 05:29:27','2026-08-04 05:29:27'),(5,5,'LUIS TORRES','4567890','luis@email.com','71234572','2026-08-04 05:29:27','2026-08-04 05:29:27'),(6,6,'ANA BELÉN CASTRO','1122334','ana@email.com','71234573','2026-08-04 05:29:27','2026-08-04 05:29:27'),(7,7,'RAÚL MONTAÑO','9988776','raul@email.com','71234575','2026-08-04 05:29:27','2026-08-04 05:29:27'),(8,8,'GABRIELA ROJAS','5544332','gabriela@email.com','71234576','2026-08-04 05:29:27','2026-08-04 05:29:27'),(9,9,'DIEGO VELASCO','3322110','diego@email.com','71234578','2026-08-04 05:29:27','2026-08-04 05:29:27'),(10,10,'PAOLA ZENTENO','6677889','paola@email.com','71234579','2026-08-04 05:29:27','2026-08-04 05:29:27'),(11,11,'ROSA MARÍA FLORES','4455667','rosa@email.com','71234581','2026-08-04 05:29:27','2026-08-04 05:29:27'),(12,12,'HUGO MAMANI','2233445','hugo@email.com','71234582','2026-08-04 05:29:28','2026-08-04 05:29:28');
/*!40000 ALTER TABLE `denunciantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `denuncias`
--

DROP TABLE IF EXISTS `denuncias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `denuncias` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ticket` varchar(20) NOT NULL,
  `token_consulta` varchar(4) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `escenario` varchar(20) NOT NULL DEFAULT 'revelada',
  `estado` varchar(30) NOT NULL DEFAULT 'ingresada',
  `subestado` varchar(30) DEFAULT NULL,
  `categoria_id` bigint unsigned DEFAULT NULL,
  `fecha_hechos` date DEFAULT NULL,
  `hora_hechos` varchar(10) DEFAULT NULL,
  `lugar_hechos` text,
  `hechos` text NOT NULL,
  `declaracion_jurada` tinyint(1) NOT NULL DEFAULT '1',
  `tecnico_id` bigint unsigned DEFAULT NULL,
  `tecnico_anterior_id` bigint unsigned DEFAULT NULL,
  `fecha_admitida` datetime DEFAULT NULL,
  `justificacion_admision` text,
  `fecha_rechazada` datetime DEFAULT NULL,
  `justificacion_rechazo` text,
  `resumen_rechazo` varchar(200) DEFAULT NULL,
  `fecha_asignada` datetime DEFAULT NULL,
  `registrado_por_id` bigint unsigned DEFAULT NULL,
  `sitpreco_rechazo` varchar(50) DEFAULT NULL,
  `es_legacy` tinyint(1) NOT NULL DEFAULT '0',
  `traspaso_json` json DEFAULT NULL,
  `reapertura_json` json DEFAULT NULL,
  `conciliacion_json` json DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `denuncias_ticket_unique` (`ticket`),
  KEY `denuncias_categoria_id_foreign` (`categoria_id`),
  KEY `denuncias_tecnico_anterior_id_foreign` (`tecnico_anterior_id`),
  KEY `denuncias_registrado_por_id_foreign` (`registrado_por_id`),
  KEY `denuncias_estado_index` (`estado`),
  KEY `denuncias_tecnico_id_index` (`tecnico_id`),
  CONSTRAINT `denuncias_categoria_id_foreign` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_denuncia` (`id`),
  CONSTRAINT `denuncias_registrado_por_id_foreign` FOREIGN KEY (`registrado_por_id`) REFERENCES `users` (`id`),
  CONSTRAINT `denuncias_tecnico_anterior_id_foreign` FOREIGN KEY (`tecnico_anterior_id`) REFERENCES `users` (`id`),
  CONSTRAINT `denuncias_tecnico_id_foreign` FOREIGN KEY (`tecnico_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `denuncias`
--

LOCK TABLES `denuncias` WRITE;
/*!40000 ALTER TABLE `denuncias` DISABLE KEYS */;
INSERT INTO `denuncias` VALUES (1,'DEN-2026-0001','1001','corrupcion','revelada','ingresada',NULL,1,'2026-02-15',NULL,'ALCALDÍA MUNICIPAL DE EL ALTO','EL SEÑOR JUAN PEREZ, FUNCIONARIO MUNICIPAL, HABRÍA SOLICITADO UNA RETRIBUCIÓN ECONÓMICA A CAMBIO DE ACELERAR UN PROCESO DE CONTRATACIÓN. EL DENUNCIANTE FUE CITADO EN LAS OFICINAS DE LA ALCALDÍA DONDE SE LE HIZO LA SOLICITUD.',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,NULL,0,NULL,NULL,NULL,NULL,'2026-02-16 12:30:00','2026-02-16 12:30:00'),(2,'DEN-2026-0002','1002','negacion','anonimo','ingresada',NULL,11,'2026-03-10',NULL,'OFICINAS DE RECURSOS HUMANOS','MEDIANTE CARTA DE FECHA 10 DE MARZO, EL CIUDADANO SOLICITÓ INFORMACIÓN SOBRE EL PROCESO DE CONVOCATORIA DE PERSONAL. A LA FECHA NO HA RECIBIDO RESPUESTA. HAN TRANSCURRIDO MÁS DE 30 DÍAS SIN PRONUNCIAMIENTO.',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,NULL,0,NULL,NULL,NULL,NULL,'2026-03-15 14:00:00','2026-03-15 14:00:00'),(3,'DEN-2026-0003','1003','corrupcion','reservada','ingresada',NULL,7,'2026-04-01',NULL,'MERCADO CENTRAL DE EL ALTO','SE DENUNCIA QUE RECAUDADORES DEL MERCADO CENTRAL ESTARÍAN COBRANDO MONTOS SUPERIORES A LOS AUTORIZADOS POR LA LEY MUNICIPAL, RETENIENDO LA DIFERENCIA PARA BENEFICIO PERSONAL.',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,NULL,0,NULL,NULL,NULL,NULL,'2026-04-05 13:15:00','2026-04-05 13:15:00'),(4,'DEN-2026-0004','1004','corrupcion','revelada','admitida',NULL,3,'2026-04-20',NULL,'HOSPITAL MUNICIPAL EL ALTO','LA DENUNCIANTE FUE ATENDIDA EN EL HOSPITAL MUNICIPAL DONDE LE EXIGIERON UN PAGO EXTRAOFICIAL POR DEBAJO DE MESA PARA ACCEDER A UNA CIRUGÍA CON URGENCIA. EL PAGO FUE SOLICITADO POR LA ADMINISTRADORA DEL HOSPITAL.',1,NULL,NULL,'2026-04-25 14:00:00','LOS HECHOS DESCRITOS CONSTITUYEN PRESUNTOS ACTOS DE CORRUPCIÓN EN EL SECTOR SALUD',NULL,NULL,NULL,NULL,2,NULL,0,NULL,NULL,NULL,NULL,'2026-04-22 15:00:00','2026-04-25 18:00:00'),(5,'DEN-2026-0005','1005','corrupcion','revelada','rechazada',NULL,10,'2026-05-05',NULL,'OFICINA DE ATENCIÓN AL CIUDADANO','EL DENUNCIANTE REPORTA QUE UN FUNCIONARIO LE NEGÓ LA ATENCIÓN POR NO CONTRATAR UN SERVICIO DE ASESORAMIENTO OFRECIDO POR UN TERCERO EN LAS INSTALACIONES.',1,NULL,NULL,NULL,NULL,'2026-05-10 16:00:00','LOS HECHOS NO CONSTITUYEN ACTOS DE CORRUPCIÓN EN LOS TÉRMINOS DE LA LEY N° 974','LOS HECHOS DESCRITOS NO CORRESPONDEN A ACTOS DE CORRUPCIÓN SEGÚN LA LEY 974',NULL,2,NULL,0,NULL,NULL,NULL,NULL,'2026-05-07 12:00:00','2026-05-10 20:00:00'),(6,'DEN-2026-0006','1006','corrupcion','revelada','asignada',NULL,6,'2026-05-20',NULL,'DIRECCIÓN DE OBRAS PÚBLICAS','SE DENUNCIA QUE EL DIRECTOR DE OBRAS PÚBLICAS HABRÍA FAVORECIDO A UNA EMPRESA CONSTRUCTORA CON LA ADJUDICACIÓN DIRECTA DE UNA OBRA A CAMBIO DE BENEFICIOS PERSONALES.',1,3,NULL,'2026-05-25 09:00:00','EXISTEN INDICIOS SUFICIENTES DE ACTOS DE CORRUPCIÓN EN CONTRATACIÓN',NULL,NULL,NULL,'2026-05-26 10:00:00',2,NULL,0,NULL,NULL,NULL,NULL,'2026-05-22 14:30:00','2026-05-26 14:00:00'),(7,'DEN-2026-0007','1007','negacion','revelada','asignada',NULL,11,'2026-06-01',NULL,'UNIDAD DE SISTEMAS GAMEA','EL DENUNCIANTE SOLICITÓ INFORMACIÓN SOBRE EL PRESUPUESTO DE SISTEMAS CORRESPONDIENTE A LA GESTIÓN 2025. LA UNIDAD DE SISTEMAS SE NEGÓ A PROPORCIONARLA ALEGANDO CONFIDENCIALIDAD.',1,4,NULL,'2026-06-06 11:00:00','LA NEGACIÓN DE INFORMACIÓN CONSTITUYE PRESUNTA INFRACCIÓN A LA LEY 974',NULL,NULL,NULL,'2026-06-07 09:00:00',2,NULL,0,NULL,NULL,NULL,NULL,'2026-06-03 12:00:00','2026-06-07 13:00:00'),(8,'DEN-2026-0008','1008','corrupcion','revelada','investigacion',NULL,2,'2026-05-15',NULL,'DIRECCIÓN DE INGRESOS MUNICIPALES','SE DENUNCIA LA EXIGENCIA DE PAGOS EXTRAOFICIALES POR PARTE DE FUNCIONARIOS DE LA DIRECCIÓN DE INGRESOS MUNICIPALES PARA LA EMISIÓN DE LICENCIAS DE FUNCIONAMIENTO.',1,3,NULL,'2026-05-20 10:00:00','HAY ELEMENTOS DE JUICIO SUFICIENTES PARA INVESTIGAR',NULL,NULL,NULL,'2026-05-21 11:00:00',2,NULL,0,NULL,NULL,NULL,NULL,'2026-05-17 13:00:00','2026-05-21 15:00:00'),(9,'DEN-2026-0009','1009','corrupcion','revelada','investigacion',NULL,4,'2026-06-10',NULL,'SECRETARÍA GENERAL GAMEA','SE DENUNCIA QUE UN FUNCIONARIO DE LA SECRETARÍA GENERAL HABRÍA REALIZADO NEGOCIACIONES INCOMPATIBLES CON SU CARGO, FAVORECIENDO A UNA EMPRESA DE SU CÓNYUGE EN PROCESOS DE CONTRATACIÓN.',1,4,NULL,'2026-06-16 09:00:00','LOS HECHOS PRESENTAN INDICIOS DE NEGOCIACIONES INCOMPATIBLES',NULL,NULL,NULL,'2026-06-17 10:00:00',2,NULL,0,NULL,NULL,NULL,NULL,'2026-06-13 15:00:00','2026-06-17 14:00:00'),(10,'DEN-2026-0010','1010','corrupcion','revelada','informe',NULL,5,'2026-06-01',NULL,'UNIDAD DE ADQUISICIONES GAMEA','SE DENUNCIA QUE LA JEFA DE ADQUISICIONES HABRÍA ADQUIRIDO EQUIPAMIENTO A SOBREPRECIO, GENERANDO UN BENEFICIO ECONÓMICO A LA PROVEEDORA.',1,5,NULL,'2026-06-06 10:00:00','HAY ELEMENTOS SUFICIENTES PARA INICIAR INVESTIGACIÓN',NULL,NULL,NULL,'2026-06-07 11:00:00',2,NULL,0,NULL,NULL,NULL,NULL,'2026-06-03 12:30:00','2026-07-01 18:00:00'),(11,'DEN-2026-0011','1011','negacion','revelada','cerrada',NULL,11,'2026-03-05',NULL,'UNIDAD DE CATASTRO','EL DENUNCIANTE SOLICITÓ INFORMACIÓN OFICIAL SOBRE PLANOS CATASTRALES DE SU PROPIEDAD. LA UNIDAD DE CATASTRO SE NEGÓ SISTEMÁTICAMENTE A PROPORCIONAR LA INFORMACIÓN ALEGANDO QUE LOS PLANOS ESTABAN EN DIGITALIZACIÓN.',1,5,NULL,'2026-03-10 10:00:00','LA NEGACIÓN DE INFORMACIÓN ES PRESUNTA INFRACCIÓN A LA LEY 974',NULL,NULL,NULL,'2026-03-11 11:00:00',2,NULL,0,NULL,NULL,NULL,NULL,'2026-03-08 13:00:00','2026-05-15 20:00:00'),(12,'DEN-2026-0012','1012','corrupcion','revelada','cerrada','archivada',8,'2026-02-10',NULL,'MERCADO CENTRAL','SE DENUNCIÓ QUE FUNCIONARIOS MUNICIPALES COBRABAN CUOTAS EXTRAOFICIALES A COMERCIANTES DEL MERCADO CENTRAL POR ASIGNACIÓN DE PUESTOS.',1,3,NULL,'2026-02-14 10:00:00','EXISTEN INDICIOS DE ACTOS DE CORRUPCIÓN',NULL,NULL,NULL,'2026-02-15 11:00:00',2,NULL,0,NULL,NULL,NULL,NULL,'2026-02-12 13:00:00','2026-04-10 20:00:00');
/*!40000 ALTER TABLE `denuncias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `denuncias_archivos`
--

DROP TABLE IF EXISTS `denuncias_archivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `denuncias_archivos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `denuncia_id` bigint unsigned NOT NULL,
  `usuario_id` bigint unsigned NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `tamano` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `contexto` varchar(20) NOT NULL DEFAULT 'general',
  `contexto_entidad_type` varchar(255) DEFAULT NULL,
  `contexto_entidad_id` bigint unsigned DEFAULT NULL,
  `fecha_eliminacion` datetime DEFAULT NULL,
  `fecha_subida` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `denuncias_archivos_denuncia_id_foreign` (`denuncia_id`),
  KEY `denuncias_archivos_usuario_id_foreign` (`usuario_id`),
  KEY `da_ctx_entidad_idx` (`contexto_entidad_type`,`contexto_entidad_id`),
  KEY `denuncias_archivos_contexto_index` (`contexto`),
  CONSTRAINT `denuncias_archivos_denuncia_id_foreign` FOREIGN KEY (`denuncia_id`) REFERENCES `denuncias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `denuncias_archivos_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `denuncias_archivos`
--

LOCK TABLES `denuncias_archivos` WRITE;
/*!40000 ALTER TABLE `denuncias_archivos` DISABLE KEYS */;
INSERT INTO `denuncias_archivos` VALUES (1,6,3,'resolucion_adjudicacion.pdf','archivos/demo/DEN-2026-0006/resolucion_adjudicacion.pdf','1.2 MB','application/pdf',NULL,'registro',NULL,NULL,NULL,'2026-05-27 09:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27'),(2,10,5,'EXPEDIENTE_COMPLETO.PDF','archivos/demo/DEN-2026-0010/expediente.pdf','5.8 MB','application/pdf',NULL,'informe',NULL,NULL,NULL,'2026-07-01 15:00:00','2026-08-04 05:29:27','2026-08-04 05:29:27');
/*!40000 ALTER TABLE `denuncias_archivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dependencias_externas`
--

DROP TABLE IF EXISTS `dependencias_externas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dependencias_externas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_desactivacion` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `desactivado_por_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dependencias_externas_desactivado_por_id_foreign` (`desactivado_por_id`),
  CONSTRAINT `dependencias_externas_desactivado_por_id_foreign` FOREIGN KEY (`desactivado_por_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=178 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dependencias_externas`
--

LOCK TABLES `dependencias_externas` WRITE;
/*!40000 ALTER TABLE `dependencias_externas` DISABLE KEYS */;
INSERT INTO `dependencias_externas` VALUES (1,'DESPACHO ALCALDESA — UNIDAD DE TRANSPARENCIA Y LUCHA CONTRA LA CORRUPCIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(2,'DESPACHO ALCALDESA — UNIDAD SUMARIANTE',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(3,'DESPACHO ALCALDESA — UNIDAD DE AUDITORIA INTERNA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(4,'DESPACHO ALCALDESA — UNIDAD DE RELACIONES PÚBLICAS Y PROTOCOLO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(5,'DESPACHO ALCALDESA — UNIDAD DE GESTIÓN SOCIAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(6,'DESPACHO ALCALDESA — DIRECCIÓN GENERAL DE ASESORIA LEGAL — UNIDAD DE ASUNTOS JURISDICCIONALES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(7,'DESPACHO ALCALDESA — DIRECCIÓN GENERAL DE ASESORIA LEGAL — UNIDAD DE NORMAS MUNICIPALES Y ASUNTOS ADMINISTRATIVOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(8,'DESPACHO ALCALDESA — DIRECCIÓN GENERAL DE ASESORIA LEGAL — UNIDAD DE DEFENSA Y REGULARIZACIÓN DE BIENES DE DOMINIO MUNICIPAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(9,'DESPACHO ALCALDESA — DIRECCIÓN GENERAL DE ASESORIA LEGAL — UNIDAD DE LIMITES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(10,'DESPACHO ALCALDESA — DIRECCIÓN DE PLANIFICACIÓN — UNIDAD DE PROGRAMACIÓN DE OPERACIONES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(11,'DESPACHO ALCALDESA — DIRECCIÓN DE PLANIFICACIÓN — UNIDAD DE INVERSIÓN PÚBLICA Y SEGUIMIENTO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(12,'DESPACHO ALCALDESA — DIRECCIÓN DE PLANIFICACIÓN — UNIDAD DE DESARROLLO ORGANIZACIONAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(13,'DESPACHO ALCALDESA — DIRECCIÓN DE PLANIFICACIÓN — UNIDAD DE PLANIFICACIÓN ESTRATÉGICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(14,'DESPACHO ALCALDESA — DIRECCIÓN DE PLANIFICACIÓN — UNIDAD DE ORDENAMIENTO TERRITORIAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(15,'DESPACHO ALCALDESA — DIRECCIÓN DE COMUNICACIÓN — UNIDAD DE IMAGEN CORPORATIVA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(16,'DESPACHO ALCALDESA — DIRECCIÓN DE COMUNICACIÓN — UNIDAD DE PRENSA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(17,'DESPACHO ALCALDESA — DIRECCIÓN DE COMUNICACIÓN — UNIDAD DE COMUNICACIÓN DIGITAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(18,'DESPACHO ALCALDESA — DIRECCIÓN DE RELACIONES INTERNACIONALES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(19,'SECRETARÍA MUNICIPAL DE GESTIÓN INSTITUCIONAL — DIRECCIÓN DE ATENCIÓN CIUDADANA — UNIDAD DE ARCHIVO CENTRAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(20,'SECRETARÍA MUNICIPAL DE GESTIÓN INSTITUCIONAL — DIRECCIÓN DE ATENCIÓN CIUDADANA — UNIDAD DE COORDINACIÓN CON SUB ALCALDIAS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(21,'SECRETARÍA MUNICIPAL DE GESTIÓN INSTITUCIONAL — DIRECCIÓN DE ATENCIÓN CIUDADANA — UNIDAD DE PREVENCIÓN DE CONFLICTOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(22,'SECRETARÍA MUNICIPAL DE GESTIÓN INSTITUCIONAL — DIRECCIÓN DE ATENCIÓN CIUDADANA — UNIDAD DE SISTEMA ÚNICO DE TRÁMITES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(23,'SECRETARÍA MUNICIPAL DE GESTIÓN INSTITUCIONAL — DIRECCIÓN DE ALUMBRADO PÚBLICO — UNIDAD OPERATIVA DE ALUMBRADO PÚBLICO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(24,'SECRETARÍA MUNICIPAL DE GESTIÓN INSTITUCIONAL — DIRECCIÓN DE ALUMBRADO PÚBLICO — UNIDAD DE PROGRAMAS Y PROYECTOS DE ALUMBRADO PÚBLICO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(25,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DEL TESORO MUNICIPAL — UNIDAD DE TESORERIA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(26,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DEL TESORO MUNICIPAL — UNIDAD DE PRESUPUESTO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(27,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DEL TESORO MUNICIPAL — UNIDAD DE CONTABILIDAD',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(28,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DEL TESORO MUNICIPAL — UNIDAD DE CRÉDITO PÚBLICO Y GESTIÓN DE FINANCIAMIENTO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(29,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DE TALENTO HUMANO — UNIDAD DE REGISTRO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(30,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DE TALENTO HUMANO — UNIDAD DE ASESORÍA LEGAL DTH',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(31,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DE TALENTO HUMANO — UNIDAD DE PLANILLAS Y CONTROL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(32,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DE TALENTO HUMANO — UNIDAD DE SELECCIÓN Y CONTRATACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(33,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DE TALENTO HUMANO — UNIDAD DE CAPACITACIÓN Y EVALUACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(34,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DE ADMINISTRACIÓN TRIBUTARIA MUNICIPAL — UNIDAD DE INGRESOS Y CONTROL TRIBUTARIO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(35,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DE ADMINISTRACIÓN TRIBUTARIA MUNICIPAL — UNIDAD DE ASESORÍA JURÍDICA Y COBRANZA COACTIVA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(36,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DE ADMINISTRACIÓN TRIBUTARIA MUNICIPAL — UNIDAD DE FISCALIZACIÓN Y RECAUDACIONES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(37,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DE CONTRATACIONES — UNIDAD DE ADQUISICIONES Y CONTRATACIONES MENORES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(38,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DE CONTRATACIONES — UNIDAD DE LICITACIONES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(39,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN DE CONTRATACIONES — UNIDAD JURÍDICA DE CONTRATACIONES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(40,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN ADMINISTRATIVA — UNIDAD DE ACTIVOS FIJOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(41,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN ADMINISTRATIVA — UNIDAD DE SERVICIOS GENERALES Y MANTENIMIENTO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(42,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN ADMINISTRATIVA — UNIDAD DE ALMACENES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(43,'SECRETARÍA MUNICIPAL DE ADMINISTRACIÓN Y FINANZAS — DIRECCIÓN ADMINISTRATIVA — UNIDAD DE ADMINISTRACIÓN DE SISTEMAS DE INFORMACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(44,'SECRETARÍA MUNICIPAL DE MOVILIDAD URBANA — UNIDAD DE PLANIFICACIÓN DE LA MOVILIDAD URBANA SOSTENIBLE',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(45,'SECRETARÍA MUNICIPAL DE MOVILIDAD URBANA — DIRECCIÓN DE REGULACIÓN DE LA MOVILIDAD URBANA — UNIDAD DE SEÑALIZACIÓN Y SEMAFORIZACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(46,'SECRETARÍA MUNICIPAL DE MOVILIDAD URBANA — DIRECCIÓN DE REGULACIÓN DE LA MOVILIDAD URBANA — UNIDAD DE REGULACIÓN DEL TRANSPORTE',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(47,'SECRETARÍA MUNICIPAL DE MOVILIDAD URBANA — DIRECCIÓN DE REGULACIÓN DE LA MOVILIDAD URBANA — UNIDAD GUARDIA MUNICIPAL DE TRANSPORTE',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(48,'SECRETARÍA MUNICIPAL DE EDUCACIÓN Y CULTURA — DIRECCIÓN DE CULTURA — UNIDAD DE FOMENTO A INICIATIVAS ARTÍSTICAS Y CULTURALES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(49,'SECRETARÍA MUNICIPAL DE EDUCACIÓN Y CULTURA — DIRECCIÓN DE CULTURA — ESCUELA MUNICIPAL DE ARTES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(50,'SECRETARÍA MUNICIPAL DE EDUCACIÓN Y CULTURA — DIRECCIÓN DE CULTURA — UNIDAD DE ADMINISTRACIÓN DE ESPACIOS CULTURALES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(51,'SECRETARÍA MUNICIPAL DE EDUCACIÓN Y CULTURA — DIRECCIÓN DE ATENCIÓN SERVICIOS DE EDUCACIÓN — UNIDAD DE PROGRAMAS EDUCATIVOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(52,'SECRETARÍA MUNICIPAL DE EDUCACIÓN Y CULTURA — DIRECCIÓN DE ATENCIÓN SERVICIOS DE EDUCACIÓN — UNIDAD DE LA JUVENTUD',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(53,'SECRETARÍA MUNICIPAL DE EDUCACIÓN Y CULTURA — DIREC. DE ADM. Y MEJORA DE LA INFRAESTRUCTURA Y EQUIPAMIENTO EDUCATIVO — UNIDAD DE MEJORA DE LA INFRAESTRUCTURA Y EQUIPAMIENTO EDUCATIVO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(54,'SECRETARÍA MUNICIPAL DE EDUCACIÓN Y CULTURA — DIREC. DE ADM. Y MEJORA DE LA INFRAESTRUCTURA Y EQUIPAMIENTO EDUCATIVO — UNIDAD DE REGULARIZACIÓN BIENES INMUEBLES SECTOR DE EDUCACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(55,'SECRETARÍA MUNICIPAL DE DESARROLLO HUMANO Y SOCIAL INTEGRAL — DIRECCIÓN DE NIÑEZ GENERO Y ATENCIÓN SOCIAL — UNIDAD DE LA INFANCIA NIÑEZ Y ADOLESCENCIA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(56,'SECRETARÍA MUNICIPAL DE DESARROLLO HUMANO Y SOCIAL INTEGRAL — DIRECCIÓN DE NIÑEZ GENERO Y ATENCIÓN SOCIAL — UNIDAD DE LA MUJER',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(57,'SECRETARÍA MUNICIPAL DE DESARROLLO HUMANO Y SOCIAL INTEGRAL — DIRECCIÓN DE NIÑEZ GENERO Y ATENCIÓN SOCIAL — UNIDAD DE ATENCIÓN INTEGRAL A LA FAMILIA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(58,'SECRETARÍA MUNICIPAL DE DESARROLLO HUMANO Y SOCIAL INTEGRAL — DIRECCIÓN DE NIÑEZ GENERO Y ATENCIÓN SOCIAL — UNIDAD DE POBLACIONES DIVERSAS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(59,'SECRETARÍA MUNICIPAL DE DESARROLLO HUMANO Y SOCIAL INTEGRAL — DIRECCIÓN DE DESARROLLO INTEGRAL — UNIDAD DE ADULTOS MAYORES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(60,'SECRETARÍA MUNICIPAL DE DESARROLLO HUMANO Y SOCIAL INTEGRAL — DIRECCIÓN DE DESARROLLO INTEGRAL — UNIDAD DE ATENCIÓN A PERSONAS CON DISCAPACIDAD',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(61,'SECRETARÍA MUNICIPAL DE DESARROLLO HUMANO Y SOCIAL INTEGRAL — DIRECCIÓN DE DEPORTES — UNIDAD DE INFRAESTRUCTURA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(62,'SECRETARÍA MUNICIPAL DE DESARROLLO HUMANO Y SOCIAL INTEGRAL — DIRECCIÓN DE DEPORTES — UNIDAD DE FORTALECIMIENTO DEPORTIVO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(63,'SECRETARÍA MUNICIPAL DE SEGURIDAD CIUDADANA — DIRECCIÓN DE SEGURIDAD PÚBLICA, PROGRAMAS DE SEGURIDAD CIUDADANA Y SOLUCIONES TECNOLÓGICAS — INTENDENCIA, GUARDIA Y BANDA MUNICIPAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(64,'SECRETARÍA MUNICIPAL DE SEGURIDAD CIUDADANA — DIRECCIÓN DE SEGURIDAD PÚBLICA, PROGRAMAS DE SEGURIDAD CIUDADANA Y SOLUCIONES TECNOLÓGICAS — UNIDAD DEL OBSERVATORIO MUNICIPAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(65,'SECRETARÍA MUNICIPAL DE SEGURIDAD CIUDADANA — DIRECCIÓN DE SEGURIDAD PÚBLICA, PROGRAMAS DE SEGURIDAD CIUDADANA Y SOLUCIONES TECNOLÓGICAS — UNIDAD DE PROGRAMAS DE SEGURIDAD CIUDADANA Y SOLUCIONES TECNOLÓGICAS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(66,'SECRETARÍA MUNICIPAL DE SEGURIDAD CIUDADANA — DIRECCIÓN DE FERIAS Y MERCADOS — UNIDAD DE FERIAS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(67,'SECRETARÍA MUNICIPAL DE SEGURIDAD CIUDADANA — DIRECCIÓN DE FERIAS Y MERCADOS — UNIDAD DE MERCADOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(68,'SECRETARÍA MUNICIPAL DE SALUD — UNIDAD DE PLANIFICACIÓN MUNICIPAL EN SALUD',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(69,'SECRETARÍA MUNICIPAL DE SALUD — UNIDAD TÉCNICA DE ADMINISTRACIÓN DEL S.U.S.',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(70,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE GESTIÓN EN SALUD — UNIDAD DE PROGRAMAS Y PROYECTOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(71,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE GESTIÓN EN SALUD — UNIDAD DE PROMOCIÓN Y PREVENCIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(72,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE GESTIÓN EN SALUD — UNIDAD DE EPIDEMIOLOGÍA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(73,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE ESTABLECIMIENTOS DE SALUD DE PRIMER NIVEL — RED DE SALUD MUNICIPAL COREA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(74,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE ESTABLECIMIENTOS DE SALUD DE PRIMER NIVEL — RED DE SALUD MUNICIPAL LOS ANDES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(75,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE ESTABLECIMIENTOS DE SALUD DE PRIMER NIVEL — RED DE SALUD MUNICIPAL HOLANDES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(76,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE ESTABLECIMIENTOS DE SALUD DE PRIMER NIVEL — RED DE SALUD MUNICIPAL LOTES Y SERVICIOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(77,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE ESTABLECIMIENTOS DE SALUD DE PRIMER NIVEL — RED DE SALUD MUNICIPAL SENKATA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(78,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE GESTIÓN SERVICIOS DE SALUD NIVEL DESCONCENTRADO — HOSPITAL MUNICIPAL MODELO COREA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(79,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE GESTIÓN SERVICIOS DE SALUD NIVEL DESCONCENTRADO — HOSPITAL MUNICIPAL BOLIVIANO HOLANDÉS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(80,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE GESTIÓN SERVICIOS DE SALUD NIVEL DESCONCENTRADO — HOSPITAL MUNICIPAL LOS ANDES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(81,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE GESTIÓN SERVICIOS DE SALUD NIVEL DESCONCENTRADO — HOSPITAL MUNICIPAL MODELO BOLIVIANO JAPONÉS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(82,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE GESTIÓN SERVICIOS DE SALUD NIVEL DESCONCENTRADO — HOSPITAL MUNICIPAL QULLAÑ UTA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(83,'SECRETARÍA MUNICIPAL DE SALUD — DIRECCIÓN DE GESTIÓN SERVICIOS DE SALUD NIVEL DESCONCENTRADO — LABORATORIO INDUSTRIAL DE OXIGENO MEDICINAL - G.A.M.E.A.',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(84,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE PROYECTOS MUNICIPALES — UNIDAD DE PROYECTOS MUNICIPALES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(85,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE PROYECTOS MUNICIPALES — UNIDAD DE PROYECTOS ESTRATÉGICOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(86,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE FISCALIZACIÓN DE OBRAS — UNIDAD DE FISCALIZACIÓN DE PROYECTOS ESTRATÉGICOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(87,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE FISCALIZACIÓN DE OBRAS — UNIDAD DE FISCALIZACIÓN DE PROYECTOS MUNICIPALES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(88,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE SUPERVISIÓN DE OBRAS — UNIDAD DE SUPERVISIÓN DE OBRAS ESTRATÉGICAS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(89,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE SUPERVISIÓN DE OBRAS — UNIDAD DE SUPERVISIÓN DE OBRAS MUNICIPALES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(90,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE SUPERVISIÓN DE OBRAS — UNIDAD DE CIERRE DE PROYECTOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(91,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE OBRAS MUNICIPALES — UNIDAD DE INFRAESTRUCTURA MUNICIPAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(92,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE OBRAS MUNICIPALES — UNIDAD DE INFRAESTRUCTURA VIAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(93,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE OBRAS MUNICIPALES — UNIDAD DE PAVIMENTOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(94,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE OBRAS MUNICIPALES — UNIDAD DE MANTENIMIENTO Y BACHEO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(95,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE OBRAS MUNICIPALES — UNIDAD DE ADMINISTRACIÓN DE MAQUINARIAS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(96,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE ADMINISTRACIÓN TERRITORIAL Y CATASTRO — UNIDAD DE CATASTRO MUNICIPAL Y CARTOGRAFÍA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(97,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE ADMINISTRACIÓN TERRITORIAL Y CATASTRO — UNIDAD DE ADMINISTRACIÓN TERRITORIAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(98,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE ADMINISTRACIÓN TERRITORIAL Y CATASTRO — UNIDAD DE VIALIDAD',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(99,'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA — DIRECCIÓN DE ADMINISTRACIÓN TERRITORIAL Y CATASTRO — UNIDAD JURÍDICA DE ADMINISTRACIÓN TERRITORIAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(100,'SECRETARÍA MUNICIPAL DE AGUA SANEAMIENTO, GESTIÓN AMBIENTAL Y RIESGOS — DIRECCIÓN DE SANEAMIENTO BÁSICO, RECURSOS HÍDRICOS Y CONTROL AMBIENTAL — UNIDAD DE RECURSOS HÍDRICOS Y DRENAJE PLUVIAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(101,'SECRETARÍA MUNICIPAL DE AGUA SANEAMIENTO, GESTIÓN AMBIENTAL Y RIESGOS — DIRECCIÓN DE SANEAMIENTO BÁSICO, RECURSOS HÍDRICOS Y CONTROL AMBIENTAL — UNIDAD DE SANEAMIENTO BÁSICO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(102,'SECRETARÍA MUNICIPAL DE AGUA SANEAMIENTO, GESTIÓN AMBIENTAL Y RIESGOS — DIRECCIÓN DE SANEAMIENTO BÁSICO, RECURSOS HÍDRICOS Y CONTROL AMBIENTAL — UNIDAD DE CONTROL Y MONITOREO AMBIENTAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(103,'SECRETARÍA MUNICIPAL DE AGUA SANEAMIENTO, GESTIÓN AMBIENTAL Y RIESGOS — DIRECCIÓN DE SANEAMIENTO BÁSICO, RECURSOS HÍDRICOS Y CONTROL AMBIENTAL — UNIDAD DE PREVENCIÓN Y CALIDAD AMBIENTAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(104,'SECRETARÍA MUNICIPAL DE AGUA SANEAMIENTO, GESTIÓN AMBIENTAL Y RIESGOS — DIRECCIÓN DE GESTIÓN INTEGRAL DE RESIDUOS — UNIDAD DE GESTIÓN DE RESIDUOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(105,'SECRETARÍA MUNICIPAL DE AGUA SANEAMIENTO, GESTIÓN AMBIENTAL Y RIESGOS — DIRECCIÓN DE GESTIÓN INTEGRAL DE RESIDUOS — UNIDAD DE SEGUIMIENTO Y CONTROL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(106,'SECRETARÍA MUNICIPAL DE AGUA SANEAMIENTO, GESTIÓN AMBIENTAL Y RIESGOS — DIRECCIÓN DE GESTIÓN DE RIESGOS — UNIDAD DE PREVENCIÓN DE RIESGOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(107,'SECRETARÍA MUNICIPAL DE AGUA SANEAMIENTO, GESTIÓN AMBIENTAL Y RIESGOS — DIRECCIÓN DE GESTIÓN DE RIESGOS — CENTRO DE OPERACIONES DE EMERGENCIA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(108,'SECRETARÍA MUNICIPAL DE AGUA SANEAMIENTO, GESTIÓN AMBIENTAL Y RIESGOS — DIRECCIÓN DE FORESTACIÓN Y ÁREAS PROTEGIDAS — UNIDAD DE ÁREAS VERDES, PROTEGIDAS Y BOFEDALES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(109,'SECRETARÍA MUNICIPAL DE AGUA SANEAMIENTO, GESTIÓN AMBIENTAL Y RIESGOS — DIRECCIÓN DE FORESTACIÓN Y ÁREAS PROTEGIDAS — UNIDAD DE FORESTACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(110,'SECRETARÍA MUNICIPAL DE DESARROLLO ECONÓMICO — DIRECCIÓN DE DESARROLLO PRODUCTIVO DE PEQUEÑAS Y MEDIANAS EMPRESAS — UNIDAD DE COMPETITIVIDAD Y PRODUCTIVIDAD',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(111,'SECRETARÍA MUNICIPAL DE DESARROLLO ECONÓMICO — DIRECCIÓN DE DESARROLLO PRODUCTIVO DE PEQUEÑAS Y MEDIANAS EMPRESAS — UNIDAD DE INNOVACIÓN Y EMPRENDIMIENTO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(112,'SECRETARÍA MUNICIPAL DE DESARROLLO ECONÓMICO — DIRECCIÓN DE DESARROLLO PRODUCTIVO DE PEQUEÑAS Y MEDIANAS EMPRESAS — UNIDAD DE TURISMO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(113,'SECRETARÍA MUNICIPAL DE DESARROLLO ECONÓMICO — DIRECCIÓN DE DESARROLLO PRODUCTIVO ARTESANAL — UNIDAD DE PROMOCIÓN ARTESANAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(114,'SECRETARÍA MUNICIPAL DE DESARROLLO ECONÓMICO — DIRECCIÓN DE DESARROLLO PRODUCTIVO ARTESANAL — UNIDAD DE DESARROLLO PRODUCTIVO ARTESANAL',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(115,'SECRETARÍA MUNICIPAL DE DESARROLLO ECONÓMICO — DIRECCIÓN DE AGROPECUARIA Y SEGURIDAD ALIMENTARIA — UNIDAD DE FORTALECIMIENTO AGROPECUARIO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(116,'SECRETARÍA MUNICIPAL DE DESARROLLO ECONÓMICO — DIRECCIÓN DE AGROPECUARIA Y SEGURIDAD ALIMENTARIA — UNIDAD DE GESTIÓN DE PROYECTOS AGROPECUARIOS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(117,'SECRETARÍA MUNICIPAL DE DESARROLLO ECONÓMICO — DIRECCIÓN DE SERVICIOS MUNICIPALES E INICIATIVAS ECONOMICAS — UNIDAD DE ADMINISTRACIÓN DE SERVICIOS MUNICIPALES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(118,'SECRETARÍA MUNICIPAL DE DESARROLLO ECONÓMICO — DIRECCIÓN DE SERVICIOS MUNICIPALES E INICIATIVAS ECONOMICAS — UNIDAD DE INICIATIVAS ECONÓMICAS',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(119,'SECRETARÍA MUNICIPAL DE DESARROLLO ECONÓMICO — DIRECCIÓN MUNICIPAL DE TRANSPORTE PÚBLICO – BUS MUNICIPAL — UNIDAD DE OPERACIONES',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(120,'SECRETARÍA MUNICIPAL DE DESARROLLO ECONÓMICO — DIRECCIÓN MUNICIPAL DE TRANSPORTE PÚBLICO – BUS MUNICIPAL — UNIDAD DE MANTENIMIENTO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(121,'SECRETARÍA MUNICIPAL DE DESARROLLO ECONÓMICO — DIRECCIÓN MUNICIPAL DE TRANSPORTE PÚBLICO – BUS MUNICIPAL — UNIDAD DE ADMINISTRACIÓN Y RECAUDO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(122,'SUBALCALDÍA MUNICIPAL DISTRITO 1 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(123,'SUBALCALDÍA MUNICIPAL DISTRITO 1 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(124,'SUBALCALDÍA MUNICIPAL DISTRITO 1 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(125,'SUBALCALDÍA MUNICIPAL DISTRITO 1 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(126,'SUBALCALDÍA MUNICIPAL DISTRITO 2 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(127,'SUBALCALDÍA MUNICIPAL DISTRITO 2 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(128,'SUBALCALDÍA MUNICIPAL DISTRITO 2 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(129,'SUBALCALDÍA MUNICIPAL DISTRITO 2 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(130,'SUBALCALDÍA MUNICIPAL DISTRITO 3 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(131,'SUBALCALDÍA MUNICIPAL DISTRITO 3 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(132,'SUBALCALDÍA MUNICIPAL DISTRITO 3 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(133,'SUBALCALDÍA MUNICIPAL DISTRITO 3 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(134,'SUBALCALDÍA MUNICIPAL DISTRITO 4 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(135,'SUBALCALDÍA MUNICIPAL DISTRITO 4 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(136,'SUBALCALDÍA MUNICIPAL DISTRITO 4 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(137,'SUBALCALDÍA MUNICIPAL DISTRITO 4 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(138,'SUBALCALDÍA MUNICIPAL DISTRITO 5 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(139,'SUBALCALDÍA MUNICIPAL DISTRITO 5 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(140,'SUBALCALDÍA MUNICIPAL DISTRITO 5 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(141,'SUBALCALDÍA MUNICIPAL DISTRITO 5 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(142,'SUBALCALDÍA MUNICIPAL DISTRITO 6 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(143,'SUBALCALDÍA MUNICIPAL DISTRITO 6 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(144,'SUBALCALDÍA MUNICIPAL DISTRITO 6 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(145,'SUBALCALDÍA MUNICIPAL DISTRITO 6 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(146,'SUBALCALDÍA MUNICIPAL DISTRITO 7 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(147,'SUBALCALDÍA MUNICIPAL DISTRITO 7 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(148,'SUBALCALDÍA MUNICIPAL DISTRITO 7 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(149,'SUBALCALDÍA MUNICIPAL DISTRITO 7 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(150,'SUBALCALDÍA MUNICIPAL DISTRITO 8 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(151,'SUBALCALDÍA MUNICIPAL DISTRITO 8 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(152,'SUBALCALDÍA MUNICIPAL DISTRITO 8 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(153,'SUBALCALDÍA MUNICIPAL DISTRITO 8 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(154,'SUBALCALDÍA MUNICIPAL DISTRITO 9 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(155,'SUBALCALDÍA MUNICIPAL DISTRITO 9 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(156,'SUBALCALDÍA MUNICIPAL DISTRITO 9 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(157,'SUBALCALDÍA MUNICIPAL DISTRITO 9 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(158,'SUBALCALDÍA MUNICIPAL DISTRITO 10 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(159,'SUBALCALDÍA MUNICIPAL DISTRITO 10 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(160,'SUBALCALDÍA MUNICIPAL DISTRITO 10 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(161,'SUBALCALDÍA MUNICIPAL DISTRITO 10 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(162,'SUBALCALDÍA MUNICIPAL DISTRITO 11 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(163,'SUBALCALDÍA MUNICIPAL DISTRITO 11 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(164,'SUBALCALDÍA MUNICIPAL DISTRITO 11 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(165,'SUBALCALDÍA MUNICIPAL DISTRITO 11 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(166,'SUBALCALDÍA MUNICIPAL DISTRITO 12 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(167,'SUBALCALDÍA MUNICIPAL DISTRITO 12 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(168,'SUBALCALDÍA MUNICIPAL DISTRITO 12 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(169,'SUBALCALDÍA MUNICIPAL DISTRITO 12 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(170,'SUBALCALDÍA MUNICIPAL DISTRITO 13 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(171,'SUBALCALDÍA MUNICIPAL DISTRITO 13 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(172,'SUBALCALDÍA MUNICIPAL DISTRITO 13 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(173,'SUBALCALDÍA MUNICIPAL DISTRITO 13 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(174,'SUBALCALDÍA MUNICIPAL DISTRITO 14 — ASESORÍA JURÍDICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(175,'SUBALCALDÍA MUNICIPAL DISTRITO 14 — UNIDAD DE INFRAESTRUCTURA PÚBLICA',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(176,'SUBALCALDÍA MUNICIPAL DISTRITO 14 — UNIDAD DE FINANZAS Y ADMINISTRACIÓN',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(177,'SUBALCALDÍA MUNICIPAL DISTRITO 14 — UNIDAD DE DESARROLLO HUMANO',1,NULL,'2026-08-04 05:29:24','2026-08-04 05:29:24',NULL);
/*!40000 ALTER TABLE `dependencias_externas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `descargos`
--

DROP TABLE IF EXISTS `descargos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `descargos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `denuncia_id` bigint unsigned NOT NULL,
  `denunciado_id` bigint unsigned NOT NULL,
  `fecha_notificacion` datetime DEFAULT NULL,
  `medio` varchar(200) DEFAULT NULL,
  `respaldo_archivo_nombre` varchar(255) DEFAULT NULL,
  `respaldo_archivo_path` varchar(255) DEFAULT NULL,
  `respaldo_archivo_tamano` varchar(255) DEFAULT NULL,
  `fecha_vencimiento` datetime DEFAULT NULL,
  `fecha_respuesta` datetime DEFAULT NULL,
  `resumen_descargo` text,
  `estado` varchar(20) NOT NULL DEFAULT 'pendiente_notif',
  `motivo_cancelacion` text,
  `fecha_cancelacion` datetime DEFAULT NULL,
  `eliminado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_eliminacion` datetime DEFAULT NULL,
  `historial_ediciones` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `descargos_denunciado_id_foreign` (`denunciado_id`),
  KEY `descargos_denuncia_id_index` (`denuncia_id`),
  KEY `descargos_estado_index` (`estado`),
  CONSTRAINT `descargos_denuncia_id_foreign` FOREIGN KEY (`denuncia_id`) REFERENCES `denuncias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `descargos_denunciado_id_foreign` FOREIGN KEY (`denunciado_id`) REFERENCES `denunciados` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `descargos`
--

LOCK TABLES `descargos` WRITE;
/*!40000 ALTER TABLE `descargos` DISABLE KEYS */;
INSERT INTO `descargos` VALUES (1,9,10,'2026-06-20 10:00:00','CÉDULA DE NOTIFICACIÓN N° 234/2026',NULL,NULL,NULL,'2026-07-04 10:00:00','2026-06-30 16:00:00','EL DENUNCIADO PRESENTÓ DOCUMENTACIÓN QUE DEMUESTRA QUE LA CONTRATACIÓN SIGUIÓ LOS PROCEDIMIENTOS ESTABLECIDOS','respondido',NULL,NULL,0,NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(2,10,11,'2026-06-12 10:00:00','NOTIFICACIÓN PERSONAL',NULL,NULL,NULL,'2026-06-26 10:00:00',NULL,NULL,'pendiente_notif',NULL,NULL,0,NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27');
/*!40000 ALTER TABLE `descargos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluaciones_tecnicas`
--

DROP TABLE IF EXISTS `evaluaciones_tecnicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluaciones_tecnicas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `denuncia_id` bigint unsigned NOT NULL,
  `tecnico_id` bigint unsigned NOT NULL,
  `delegada_por_id` bigint unsigned NOT NULL,
  `delegada_at` datetime NOT NULL,
  `justificacion_delegacion` text,
  `texto_evaluacion` text,
  `recomendacion` varchar(20) DEFAULT NULL,
  `devuelta_at` datetime DEFAULT NULL,
  `devuelta_por_id` bigint unsigned DEFAULT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'pendiente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `evaluaciones_tecnicas_tecnico_id_foreign` (`tecnico_id`),
  KEY `evaluaciones_tecnicas_delegada_por_id_foreign` (`delegada_por_id`),
  KEY `evaluaciones_tecnicas_devuelta_por_id_foreign` (`devuelta_por_id`),
  KEY `evaluaciones_tecnicas_denuncia_id_estado_index` (`denuncia_id`,`estado`),
  CONSTRAINT `evaluaciones_tecnicas_delegada_por_id_foreign` FOREIGN KEY (`delegada_por_id`) REFERENCES `users` (`id`),
  CONSTRAINT `evaluaciones_tecnicas_denuncia_id_foreign` FOREIGN KEY (`denuncia_id`) REFERENCES `denuncias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluaciones_tecnicas_devuelta_por_id_foreign` FOREIGN KEY (`devuelta_por_id`) REFERENCES `users` (`id`),
  CONSTRAINT `evaluaciones_tecnicas_tecnico_id_foreign` FOREIGN KEY (`tecnico_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluaciones_tecnicas`
--

LOCK TABLES `evaluaciones_tecnicas` WRITE;
/*!40000 ALTER TABLE `evaluaciones_tecnicas` DISABLE KEYS */;
/*!40000 ALTER TABLE `evaluaciones_tecnicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feriados`
--

DROP TABLE IF EXISTS `feriados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feriados` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `feriados_fecha_unique` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feriados`
--

LOCK TABLES `feriados` WRITE;
/*!40000 ALTER TABLE `feriados` DISABLE KEYS */;
INSERT INTO `feriados` VALUES (1,'2026-01-01','AÑO NUEVO','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(2,'2026-01-22','DÍA DEL ESTADO PLURINACIONAL','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(3,'2026-02-02','DÍA DE LA VIRGEN DE COPACABANA','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(4,'2026-03-03','CARNAVAL','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(5,'2026-04-04','CARNAVAL','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(6,'2026-05-01','DÍA DEL TRABAJO','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(7,'2026-06-21','AÑO NUEVO AYMARA','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(8,'2026-08-06','DÍA DE LA PATRIA','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(9,'2026-11-02','DÍA DE LOS DIFUNTOS','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(10,'2026-12-25','NAVIDAD','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(11,'2026-07-16','DÍA DEL DEPARTAMENTO DE LA PAZ','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(12,'2026-07-24','DÍA DE LA VIRGEN DEL CARMEN','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(13,'2026-01-23','PUENTE ESTADO PLURINACIONAL','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(14,'2026-11-03','PUENTE DIFUNTOS','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL),(15,'2026-12-24','PUENTE NAVIDAD','2026-08-04 05:29:24','2026-08-04 05:29:24',NULL);
/*!40000 ALTER TABLE `feriados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `informes_finales`
--

DROP TABLE IF EXISTS `informes_finales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `informes_finales` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `denuncia_id` bigint unsigned NOT NULL,
  `clasificacion` varchar(30) NOT NULL,
  `sitpreco` varchar(50) DEFAULT NULL,
  `fojas` int DEFAULT NULL,
  `justificacion` text,
  `concluido_por` varchar(255) NOT NULL,
  `redactado_at` datetime NOT NULL,
  `eliminado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_eliminacion` datetime DEFAULT NULL,
  `historial_ediciones` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `informes_finales_denuncia_id_unique` (`denuncia_id`),
  CONSTRAINT `informes_finales_denuncia_id_foreign` FOREIGN KEY (`denuncia_id`) REFERENCES `denuncias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `informes_finales`
--

LOCK TABLES `informes_finales` WRITE;
/*!40000 ALTER TABLE `informes_finales` DISABLE KEYS */;
INSERT INTO `informes_finales` VALUES (1,10,'administrativo',NULL,45,'SE HA VERIFICADO QUE EXISTE UN SOBREPRECIO EN LA ADQUISICIÓN DE EQUIPAMIENTO DE CÓMPUTO POR UN MONTO ESTIMADO DE BS 45,000. SE RECOMIENDA REMITIR A LA MAE PARA ACCIONES ADMINISTRATIVAS.','LUIS MAMANI','2026-07-01 14:00:00',0,NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(2,11,'administrativo','SIT-2026-011',30,'SE VERIFICÓ QUE LA UNIDAD DE CATASTRO NEGÓ INFORMACIÓN PÚBLICA SIN CAUSA LEGAL. SE RECOMIENDA REMITIR A LA MAE.','LUIS MAMANI','2026-05-10 14:00:00',0,NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(3,12,'sin_indicios',NULL,25,'NO SE PUDIERON VERIFICAR LOS HECHOS DENUNCIADOS. LOS TESTIGOS NO RATIFICARON LA DENUNCIA Y NO SE ENCONTRARON REGISTROS CONTABLES QUE ACREDITEN LOS PAGOS.','CARLOS QUISPE','2026-04-05 14:00:00',0,NULL,NULL,'2026-08-04 05:29:28','2026-08-04 05:29:28');
/*!40000 ALTER TABLE `informes_finales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_07_26_153056_create_personal_access_tokens_table',1),(5,'2026_07_26_160000_extend_users_table',1),(6,'2026_07_26_161000_create_categorias_denuncia_table',1),(7,'2026_07_26_162000_create_unidades_externas_table',1),(8,'2026_07_26_163000_create_feriados_table',1),(9,'2026_07_26_164000_create_configuracion_sistema_table',1),(10,'2026_07_26_165000_create_denuncias_table',1),(11,'2026_07_26_170000_create_denunciantes_table',1),(12,'2026_07_26_171000_create_denunciados_table',1),(13,'2026_07_26_172000_create_pruebas_table',1),(14,'2026_07_26_173000_create_evaluaciones_tecnicas_table',1),(15,'2026_07_26_174000_create_solicitudes_informacion_table',1),(16,'2026_07_26_175000_create_descargos_table',1),(17,'2026_07_26_180000_create_ampliaciones_table',1),(18,'2026_07_26_181000_create_informes_finales_table',1),(19,'2026_07_26_182000_create_cierres_table',1),(20,'2026_07_26_183000_create_denuncias_archivos_table',1),(21,'2026_07_26_184000_create_bitacora_table',1),(22,'2026_07_26_185000_create_notificaciones_table',1),(23,'2026_07_29_233050_add_desactivacion_columns_to_categorias_denuncia_table',1),(24,'2026_07_29_233051_add_desactivacion_columns_to_unidades_externas_table',1),(25,'2026_07_29_233052_add_entidad_tipo_to_bitacora_table',1),(26,'2026_07_29_233255_add_soft_deletes_to_feriados_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint unsigned NOT NULL,
  `tipo` varchar(255) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `ticket` varchar(255) DEFAULT NULL,
  `destino_url` varchar(255) NOT NULL,
  `icono` varchar(50) NOT NULL DEFAULT 'Bell',
  `color` varchar(20) NOT NULL DEFAULT 'primary',
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_leida` datetime DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notificaciones_usuario_id_leida_fecha_index` (`usuario_id`,`leida`,`fecha`),
  CONSTRAINT `notificaciones_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (1,3,'traspaso','CASO TRASPASADO','DEN-2026-0006 FUE ASIGNADO A CARLOS QUISPE','DEN-2026-0006','/denuncias/mis-casos','Bell','primary',0,NULL,'2026-07-30 01:29:28','2026-08-04 05:29:28','2026-08-04 05:29:28'),(2,4,'traspaso','CASO TRASPASADO','DEN-2026-0007 FUE ASIGNADO A ANA TORRES','DEN-2026-0007','/denuncias/mis-casos','Bell','primary',0,NULL,'2026-07-31 01:29:28','2026-08-04 05:29:28','2026-08-04 05:29:28'),(3,1,'plazo_por_vencer','PLAZO POR VENCER','EL PLAZO DE ADMISIÓN DE DEN-2026-0003 VENCE EN 2 DÍAS','DEN-2026-0003','/denuncias','Timer','warning',1,'2026-08-03 13:29:28','2026-08-03 01:29:28','2026-08-04 05:29:28','2026-08-04 05:29:28'),(4,5,'plazo_informe','PLAZO DE INFORME POR VENCER','EL PLAZO PARA PRESENTAR INFORME DE DEN-2026-0010 VENCE EN 3 DÍAS','DEN-2026-0010','/denuncias/mis-casos','FileText','warning',0,NULL,'2026-08-03 01:29:28','2026-08-04 05:29:28','2026-08-04 05:29:28'),(5,3,'sistema','NUEVO COMENTARIO','EL JEFE DE UNIDAD AGREGÓ UN COMENTARIO EN DEN-2026-0001','DEN-2026-0001','/denuncias/mis-casos','MessageCircle','info',1,'2026-08-03 01:29:28','2026-08-02 01:29:28','2026-08-04 05:29:28','2026-08-04 05:29:28');
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pruebas`
--

DROP TABLE IF EXISTS `pruebas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pruebas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `denuncia_id` bigint unsigned NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `descripcion` text NOT NULL,
  `testigo_nombre` varchar(255) DEFAULT NULL,
  `testigo_telefono` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pruebas_denuncia_id_foreign` (`denuncia_id`),
  CONSTRAINT `pruebas_denuncia_id_foreign` FOREIGN KEY (`denuncia_id`) REFERENCES `denuncias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pruebas`
--

LOCK TABLES `pruebas` WRITE;
/*!40000 ALTER TABLE `pruebas` DISABLE KEYS */;
INSERT INTO `pruebas` VALUES (1,1,'fisica','COPIA DEL MEMORÁNDUM DE SOLICITUD DE PAGO',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(2,1,'testigo','TESTIGO PRESENCIAL DE LA REUNIÓN','PEDRO GARCÍA','71234568','2026-08-04 05:29:27','2026-08-04 05:29:27'),(3,2,'fisica','COPIA DE LA CARTA DE SOLICITUD DE INFORMACIÓN CON SELLO DE RECEPCIÓN',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(4,3,'fisica','RECIBOS DE PAGO ORIGINALES DE LOS ÚLTIMOS 3 MESES',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(5,4,'fisica','FOTO DEL MONTO EXIGIDO ESCRITO EN UN PAPEL',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(6,4,'testigo','OTRO PACIENTE QUE PRESENCIÓ LA SOLICITUD','MARTA SUÁREZ','71234571','2026-08-04 05:29:27','2026-08-04 05:29:27'),(7,6,'fisica','COPIA DE LA RESOLUCIÓN DE ADJUDICACIÓN DIRECTA',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(8,6,'testigo','FUNCIONARIO QUE CONOCE DEL FAVORECIMIENTO','JOSÉ LUIS PAREDES','71234574','2026-08-04 05:29:27','2026-08-04 05:29:27'),(9,7,'fisica','CARTA DE SOLICITUD DE INFORMACIÓN CON NEGATIVA ESCRITA',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(10,8,'fisica','COMPROBANTE DE PAGO EXTRAOFICIAL BS 500',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(11,8,'testigo','OTRO COMERCIANTE AFECTADO','JUAN CARLOS MAMANI','71234577','2026-08-04 05:29:27','2026-08-04 05:29:27'),(12,9,'fisica','CONTRATOS FIRMADOS CON LA EMPRESA RELACIONADA',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(13,10,'fisica','COTIZACIONES COMPARATIVAS QUE DEMUESTRAN EL SOBREPRECIO',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(14,10,'testigo','EX FUNCIONARIO DE ADQUISICIONES','ALVARO RIVERA','71234580','2026-08-04 05:29:27','2026-08-04 05:29:27'),(15,11,'fisica','SOLICITUD FORMAL CON SELLO DE RECEPCIÓN Y NEGATIVA',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(16,12,'fisica','REGISTRO DE PAGOS MENSUALES REALIZADOS DURANTE 6 MESES',NULL,NULL,'2026-08-04 05:29:28','2026-08-04 05:29:28');
/*!40000 ALTER TABLE `pruebas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `payload` longtext NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes_informacion`
--

DROP TABLE IF EXISTS `solicitudes_informacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_informacion` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `denuncia_id` bigint unsigned NOT NULL,
  `dependencia_destino_id` bigint unsigned NOT NULL,
  `detalle` text NOT NULL,
  `plazo_dias` int NOT NULL DEFAULT '10',
  `fecha_envio` datetime NOT NULL,
  `fecha_vencimiento` datetime NOT NULL,
  `fecha_respuesta` datetime DEFAULT NULL,
  `respuesta` text,
  `estado` varchar(20) NOT NULL DEFAULT 'pendiente',
  `motivo_cancelacion` text,
  `fecha_cancelacion` datetime DEFAULT NULL,
  `eliminado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_eliminacion` datetime DEFAULT NULL,
  `historial_ediciones` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `solicitudes_informacion_dependencia_destino_id_foreign` (`dependencia_destino_id`),
  KEY `solicitudes_informacion_denuncia_id_index` (`denuncia_id`),
  KEY `solicitudes_informacion_estado_index` (`estado`),
  CONSTRAINT `solicitudes_informacion_denuncia_id_foreign` FOREIGN KEY (`denuncia_id`) REFERENCES `denuncias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `solicitudes_informacion_dependencia_destino_id_foreign` FOREIGN KEY (`dependencia_destino_id`) REFERENCES `dependencias_externas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_informacion`
--

LOCK TABLES `solicitudes_informacion` WRITE;
/*!40000 ALTER TABLE `solicitudes_informacion` DISABLE KEYS */;
INSERT INTO `solicitudes_informacion` VALUES (1,8,1,'SOLICITUD DE INFORMACIÓN SOBRE EL LISTADO DE LICENCIAS DE FUNCIONAMIENTO EMITIDAS EN LA GESTIÓN 2026',10,'2026-05-28 09:00:00','2026-06-11 09:00:00','2026-06-08 15:00:00','SE ADJUNTA LISTADO COMPLETO DE LICENCIAS DE FUNCIONAMIENTO EMITIDAS EN LA GESTIÓN 2026','respondida',NULL,NULL,0,NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(2,8,2,'SOLICITUD DE INFORMACIÓN SOBRE CONTRATACIONES DE LA DIRECCIÓN DE INGRESOS',10,'2026-06-01 09:00:00','2026-06-15 09:00:00',NULL,NULL,'pendiente',NULL,NULL,0,NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(3,10,2,'SOLICITUD DE INFORMACIÓN SOBRE PROCESO DE ADQUISICIÓN',10,'2026-06-10 09:00:00','2026-06-24 09:00:00','2026-06-20 15:00:00','SE ADJUNTA EXPEDIENTE COMPLETO DE LA ADQUISICIÓN','respondida',NULL,NULL,0,NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(4,10,10,'SOLICITUD DE INFORMACIÓN SOBRE FLUJO DE PAGO',10,'2026-06-15 09:00:00','2026-06-29 09:00:00','2026-06-25 12:00:00','SE ADJUNTA REGISTRO DE PAGOS','respondida',NULL,NULL,0,NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27');
/*!40000 ALTER TABLE `solicitudes_informacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `rol` varchar(20) NOT NULL,
  `iniciales` varchar(2) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `telefono` varchar(20) DEFAULT NULL,
  `preferencias` json DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'jefe','PEDRO MAMANI',NULL,NULL,'$2y$12$yv4CnWBP754PBOPnXgTvzOvIVs9seFS9iPgeIhwBKd1N0Ds7f9LrW','jefe','PM','bg-purple-500',1,'71234567',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(2,'registrador','MARÍA GARCÍA',NULL,NULL,'$2y$12$iHrBvAZR2Cb7pTuS2GuBwO03CdeLD6Gpoc.STRLG26roah24DW42i','registrador','MG','bg-blue-500',1,'71234568',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(3,'tecnico1','CARLOS QUISPE',NULL,NULL,'$2y$12$1BvAKFOJwEyz86zCtoWZ5.aMJLvuM0eEzbSi19fdcE3aV9UXRuUG.','tecnico','CQ','bg-amber-500',1,'71234569',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(4,'tecnico2','ANA TORRES',NULL,NULL,'$2y$12$KP5JEf3F7UrWF109iJ7QM.1aDmNfAuMcdHTOBIAsYc.7Jdq/NjYOm','tecnico','AT','bg-green-500',1,'71234570',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27'),(5,'tecnico3','LUIS MAMANI',NULL,NULL,'$2y$12$gdJGPqP6lvZ4fVjOublhwuH1tTXTPn0XgmkzmHgXq3iyiJ4yTGN.O','tecnico','LM','bg-rose-500',1,'71234571',NULL,NULL,'2026-08-04 05:29:27','2026-08-04 05:29:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-04  0:16:27
