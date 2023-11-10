-- MySQL dump 10.13  Distrib 8.1.0, for macos14.0 (arm64)
--
-- Host: localhost    Database: PerfyMatrix
-- ------------------------------------------------------
-- Server version	8.1.0

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
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(5,'contenttypes','contenttype'),(6,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2023-06-05 16:44:00.225025'),(2,'auth','0001_initial','2023-06-05 16:44:00.352991'),(3,'admin','0001_initial','2023-06-05 16:44:00.391045'),(4,'admin','0002_logentry_remove_auto_add','2023-06-05 16:44:00.396792'),(5,'admin','0003_logentry_add_action_flag_choices','2023-06-05 16:44:00.402707'),(6,'contenttypes','0002_remove_content_type_name','2023-06-05 16:44:00.431377'),(7,'auth','0002_alter_permission_name_max_length','2023-06-05 16:44:00.448264'),(8,'auth','0003_alter_user_email_max_length','2023-06-05 16:44:00.461453'),(9,'auth','0004_alter_user_username_opts','2023-06-05 16:44:00.466854'),(10,'auth','0005_alter_user_last_login_null','2023-06-05 16:44:00.483014'),(11,'auth','0006_require_contenttypes_0002','2023-06-05 16:44:00.484479'),(12,'auth','0007_alter_validators_add_error_messages','2023-06-05 16:44:00.489898'),(13,'auth','0008_alter_user_username_max_length','2023-06-05 16:44:00.508593'),(14,'auth','0009_alter_user_last_name_max_length','2023-06-05 16:44:00.526341'),(15,'auth','0010_alter_group_name_max_length','2023-06-05 16:44:00.538145'),(16,'auth','0011_update_proxy_permissions','2023-06-05 16:44:00.543986'),(17,'auth','0012_alter_user_first_name_max_length','2023-06-05 16:44:00.563544'),(18,'sessions','0001_initial','2023-06-05 16:44:00.574891');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ib_write_ens800f0np0_ens840f1np1`
--

DROP TABLE IF EXISTS `ib_write_ens800f0np0_ens840f1np1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ib_write_ens800f0np0_ens840f1np1` (
  `TYPE` varchar(255) DEFAULT NULL,
  `SERVERS` varchar(255) DEFAULT NULL,
  `CLIENTS` varchar(255) DEFAULT NULL,
  `PORT` varchar(255) DEFAULT NULL,
  `SIZE` varchar(255) DEFAULT NULL,
  `CLASS` varchar(255) DEFAULT NULL,
  `QP` varchar(255) DEFAULT NULL,
  `BIDIRECTION` varchar(255) DEFAULT NULL,
  `BW(Gpbs)` float DEFAULT NULL,
  `Latency(usec)` float DEFAULT NULL,
  `avg_switch_in(Gbps)` float DEFAULT NULL,
  `avg_switch_out(Gbps)` float DEFAULT NULL,
  `log_id` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ib_write_ens800f0np0_ens840f1np1`
--

LOCK TABLES `ib_write_ens800f0np0_ens840f1np1` WRITE;
/*!40000 ALTER TABLE `ib_write_ens800f0np0_ens840f1np1` DISABLE KEYS */;
INSERT INTO `ib_write_ens800f0np0_ens840f1np1` VALUES ('ib_write','1','1','1','8KB','64','1','False',52.16,4.14,0.58,53.21,712),('ib_write','1','1','1','8KB','64','2','False',97.66,NULL,1.2,99.15,713),('ib_write','1','1','1','8KB','64','4','False',97.66,NULL,1.18,99.5,714),('ib_write','1','1','1','8KB','64','1','True',96.14,NULL,49.56,49.66,715),('ib_write','1','1','1','8KB','64','2','True',172.19,NULL,88.71,89.28,716),('ib_write','1','1','1','8KB','64','4','True',192.35,NULL,99.27,99.27,717),('ib_write','1','1','2','8KB','64','1','False',97.43,8.54,1.14,99.55,718),('ib_write','1','1','2','8KB','64','2','False',190.85,NULL,2.3,194.52,719),('ib_write','1','1','2','8KB','64','4','False',195.32,NULL,2.36,199.54,720),('ib_write','1','1','2','8KB','64','1','True',182.43,NULL,93.3,95.54,721),('ib_write','1','1','2','8KB','64','2','True',339.3,NULL,174.48,175.99,722),('ib_write','1','1','2','8KB','64','4','True',384.21,NULL,198.73,198.73,723),('ib_write','1','1','1','16KB','64','1','False',50.29,5.47,0.61,51.3,724),('ib_write','1','1','1','16KB','64','2','False',97.54,NULL,1.03,100.08,725),('ib_write','1','1','1','16KB','64','4','False',97.66,NULL,1.18,99.69,726),('ib_write','1','1','1','16KB','64','1','True',96.22,NULL,49.41,49.6,727),('ib_write','1','1','1','16KB','64','2','True',172.77,NULL,87.45,91.16,728),('ib_write','1','1','1','16KB','64','4','True',192.51,NULL,99.4,99.4,729),('ib_write','1','1','2','16KB','64','1','False',98.16,11.24,0.93,100.37,730),('ib_write','1','1','2','16KB','64','2','False',193.64,NULL,2.1,197.46,731),('ib_write','1','1','2','16KB','64','4','False',195.32,NULL,2.29,200.46,732),('ib_write','1','1','2','16KB','64','1','True',185.25,NULL,95.54,95.08,733),('ib_write','1','1','2','16KB','64','2','True',348.46,NULL,173.99,184.55,734),('ib_write','1','1','2','16KB','64','4','True',384.8,NULL,198.77,198.76,735),('ib_write','1','1','1','32KB','64','1','False',50.29,7.82,0.51,51.41,736),('ib_write','1','1','1','32KB','64','2','False',97.66,NULL,0.81,100.09,737),('ib_write','1','1','1','32KB','64','4','False',97.66,NULL,0.99,99.96,738),('ib_write','1','1','1','32KB','64','1','True',94.61,NULL,49.09,49.1,739),('ib_write','1','1','1','32KB','64','2','True',175.89,NULL,90.8,90.17,740),('ib_write','1','1','1','32KB','64','4','True',192.91,NULL,99.29,99.29,741),('ib_write','1','1','2','32KB','64','1','False',100.53,16.54,0.87,103.15,742),('ib_write','1','1','2','32KB','64','2','False',190.69,NULL,1.7,195.05,743),('ib_write','1','1','2','32KB','64','4','False',195.32,NULL,1.92,200.18,744),('ib_write','1','1','2','32KB','64','1','True',183.24,NULL,95.04,94.35,745),('ib_write','1','1','2','32KB','64','2','True',342.51,NULL,179.17,174.16,746),('ib_write','1','1','2','32KB','64','4','True',385.72,NULL,199.45,199.45,747),('ib_write','1','1','1','64KB','64','1','False',50.22,13.15,0.46,51.35,748),('ib_write','1','1','1','64KB','64','2','False',97.66,NULL,0.89,99.77,749),('ib_write','1','1','1','64KB','64','4','False',97.66,NULL,0.89,99.79,750),('ib_write','1','1','1','64KB','64','1','True',98.02,NULL,51.78,48.86,751),('ib_write','1','1','1','64KB','64','2','True',176.56,NULL,91.93,89.64,752),('ib_write','1','1','1','64KB','64','4','True',193.11,NULL,99.53,99.53,753),('ib_write','1','1','2','64KB','64','1','False',95.57,27.5,0.81,97.45,754),('ib_write','1','1','2','64KB','64','2','False',191.31,NULL,1.61,195.15,755),('ib_write','1','1','2','64KB','64','4','False',195.32,NULL,1.77,200.8,756),('ib_write','1','1','2','64KB','64','1','True',184.37,NULL,95.89,94.37,757),('ib_write','1','1','2','64KB','64','2','True',338.37,NULL,175.61,172.41,758),('ib_write','1','1','2','64KB','64','4','True',386.2,NULL,199.64,199.64,759),('ib_write','1','1','1','1MB','64','1','False',54.97,161.6,0.45,56.38,760),('ib_write','1','1','1','1MB','64','2','False',97.66,NULL,0.79,99.95,761),('ib_write','1','1','1','1MB','64','4','False',98.04,NULL,0.8,100.01,762),('ib_write','1','1','1','1MB','64','1','True',101.24,NULL,51.69,52.55,763),('ib_write','1','1','1','1MB','64','2','True',181.1,NULL,93.06,93,764),('ib_write','1','1','1','1MB','64','4','True',193.33,NULL,99.38,99.38,765),('ib_write','1','1','2','1MB','64','1','False',101.86,337.71,0.83,104.09,766),('ib_write','1','1','2','1MB','64','2','False',192.4,NULL,1.57,197.11,767),('ib_write','1','1','2','1MB','64','4','False',195.32,NULL,1.59,199.94,768),('ib_write','1','1','2','1MB','64','1','True',192.19,NULL,100.16,98.11,769),('ib_write','1','1','2','1MB','64','2','True',351.1,NULL,181.69,179.05,770),('ib_write','1','1','2','1MB','64','4','True',386.66,NULL,199.33,199.34,771);
/*!40000 ALTER TABLE `ib_write_ens800f0np0_ens840f1np1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iperf_ic4CfIzt9q`
--

DROP TABLE IF EXISTS `iperf_ic4CfIzt9q`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iperf_ic4CfIzt9q` (
  `PARALLEL` varchar(255) DEFAULT NULL,
  `LENGTH` varchar(255) DEFAULT NULL,
  `WINDOW` varchar(255) DEFAULT NULL,
  `BIDIRECTION` varchar(255) DEFAULT NULL,
  `Bandwidth(Gbps)` float DEFAULT NULL,
  `log_id` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iperf_ic4CfIzt9q`
--

LOCK TABLES `iperf_ic4CfIzt9q` WRITE;
/*!40000 ALTER TABLE `iperf_ic4CfIzt9q` DISABLE KEYS */;
INSERT INTO `iperf_ic4CfIzt9q` VALUES ('true','1','1','True',121.406,356),('true','1','1','False',144.279,357),('true','2','1','True',138.857,358),('true','2','1','False',134.404,359),('true','4','1','True',133.646,360),('true','4','1','False',116.056,361),('true','8','1','True',131.245,362),('true','8','1','False',140.653,363),('true','16','1','True',128.263,364),('true','16','1','False',107.202,365),('false','1','1','True',123.279,366),('false','1','1','False',130.367,367),('false','2','1','True',114.642,368),('false','2','1','False',111.557,369),('false','4','1','True',110.645,370),('false','4','1','False',129.216,371),('false','8','1','True',138.019,372),('false','8','1','False',137.609,373),('false','16','1','True',135.751,374),('false','16','1','False',103.018,375);
/*!40000 ALTER TABLE `iperf_ic4CfIzt9q` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iperf_KsUoVwhmjZ`
--

DROP TABLE IF EXISTS `iperf_KsUoVwhmjZ`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iperf_KsUoVwhmjZ` (
  `PARALLEL` varchar(255) DEFAULT NULL,
  `LENGTH` varchar(255) DEFAULT NULL,
  `WINDOW` varchar(255) DEFAULT NULL,
  `BIDIRECTION` varchar(255) DEFAULT NULL,
  `Bandwidth(Gbps)` float DEFAULT NULL,
  `log_id` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iperf_KsUoVwhmjZ`
--

LOCK TABLES `iperf_KsUoVwhmjZ` WRITE;
/*!40000 ALTER TABLE `iperf_KsUoVwhmjZ` DISABLE KEYS */;
INSERT INTO `iperf_KsUoVwhmjZ` VALUES ('true','1','1','True',123.835,693),('true','1','1','False',105.908,694),('true','2','1','True',145.857,695),('true','2','1','False',134.809,696),('true','4','1','True',132.271,697),('true','4','1','False',104.144,698),('true','8','1','True',113.05,699),('true','8','1','False',138.033,700),('true','16','1','True',116.291,701),('true','16','1','False',139.944,702),('false','1','1','True',118.945,703),('false','1','1','False',124.378,704),('false','2','1','True',133.152,705),('false','2','1','False',131.368,706),('false','4','1','True',126.187,707),('false','4','1','False',143.303,708),('false','8','1','True',132.522,709),('false','8','1','False',131.916,710);
/*!40000 ALTER TABLE `iperf_KsUoVwhmjZ` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iperf_NphsihlRHC`
--

DROP TABLE IF EXISTS `iperf_NphsihlRHC`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iperf_NphsihlRHC` (
  `PARALLEL` varchar(255) DEFAULT NULL,
  `LENGTH` varchar(255) DEFAULT NULL,
  `WINDOW` varchar(255) DEFAULT NULL,
  `BIDIRECTION` varchar(255) DEFAULT NULL,
  `Bandwidth(Gbps)` float DEFAULT NULL,
  `log_id` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iperf_NphsihlRHC`
--

LOCK TABLES `iperf_NphsihlRHC` WRITE;
/*!40000 ALTER TABLE `iperf_NphsihlRHC` DISABLE KEYS */;
INSERT INTO `iperf_NphsihlRHC` VALUES ('true','1','1','True',139.772,376),('true','1','1','False',111.422,377),('true','2','1','True',109.838,378),('true','2','1','False',118.468,379),('true','4','1','True',106.198,380),('true','4','1','False',119.367,381),('true','8','1','True',105.131,382),('true','8','1','False',131.674,383),('true','16','1','True',121.248,384),('true','16','1','False',132.17,385),('false','1','1','True',125.61,386),('false','1','1','False',144.963,387),('false','2','1','True',132.095,388),('false','2','1','False',136.985,389),('false','4','1','True',141.319,390),('false','4','1','False',131.442,391),('false','8','1','True',100.547,392),('false','8','1','False',141.974,393),('false','16','1','True',107.363,394),('false','16','1','False',112.74,395);
/*!40000 ALTER TABLE `iperf_NphsihlRHC` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iperf_qPNyueoYB1`
--

DROP TABLE IF EXISTS `iperf_qPNyueoYB1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iperf_qPNyueoYB1` (
  `PARALLEL` varchar(255) DEFAULT NULL,
  `LENGTH` varchar(255) DEFAULT NULL,
  `WINDOW` varchar(255) DEFAULT NULL,
  `BIDIRECTION` varchar(255) DEFAULT NULL,
  `Bandwidth(Gbps)` float DEFAULT NULL,
  `log_id` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iperf_qPNyueoYB1`
--

LOCK TABLES `iperf_qPNyueoYB1` WRITE;
/*!40000 ALTER TABLE `iperf_qPNyueoYB1` DISABLE KEYS */;
INSERT INTO `iperf_qPNyueoYB1` VALUES ('true','1','1','true',139.052,3),('true','1','1','false',133.489,4),('true','2','1','true',112.757,5),('true','2','1','false',104.325,6),('true','4','1','true',141.167,7),('true','4','1','false',146.814,8),('true','8','1','true',113.388,9),('true','8','1','false',127.151,10),('true','16','1','true',105.752,11),('true','16','1','false',112.822,12),('false','1','1','true',102.339,13),('false','1','1','false',116.904,14),('false','2','1','true',137.314,15),('false','2','1','false',142.439,16),('false','4','1','true',118.727,17),('false','4','1','false',100.102,18),('false','8','1','true',109.054,19),('false','8','1','false',133.194,20),('false','16','1','true',138.716,21),('false','16','1','false',144.539,22);
/*!40000 ALTER TABLE `iperf_qPNyueoYB1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iperf_test`
--

DROP TABLE IF EXISTS `iperf_test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iperf_test` (
  `PARALLEL` varchar(255) DEFAULT NULL,
  `LENGTH` varchar(255) DEFAULT NULL,
  `WINDOW` varchar(255) DEFAULT NULL,
  `BIDIRECTION` varchar(255) DEFAULT NULL,
  `Bandwidth(Gbps)` float DEFAULT NULL,
  `log_id` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iperf_test`
--

LOCK TABLES `iperf_test` WRITE;
/*!40000 ALTER TABLE `iperf_test` DISABLE KEYS */;
INSERT INTO `iperf_test` VALUES ('true','1','1','false',103,2);
/*!40000 ALTER TABLE `iperf_test` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NCCL_4PORT`
--

DROP TABLE IF EXISTS `NCCL_4PORT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NCCL_4PORT` (
  `TYPE` varchar(255) DEFAULT NULL,
  `GPU_Num` varchar(255) DEFAULT NULL,
  `Port_Num` varchar(255) DEFAULT NULL,
  `QP` varchar(255) DEFAULT NULL,
  `SIZE` varchar(255) DEFAULT NULL,
  `Aggregation_Count` varchar(255) DEFAULT NULL,
  `out_algbw(Gbps)` float DEFAULT NULL,
  `out_busbw(Gbps)` float DEFAULT NULL,
  `in_algbw(Gbps)` float DEFAULT NULL,
  `in_busbw(Gbps)` float DEFAULT NULL,
  `avg_switch_in(Gbps)` float DEFAULT NULL,
  `avg_switch_out(Gbps)` float DEFAULT NULL,
  `log_id` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NCCL_4PORT`
--

LOCK TABLES `NCCL_4PORT` WRITE;
/*!40000 ALTER TABLE `NCCL_4PORT` DISABLE KEYS */;
INSERT INTO `NCCL_4PORT` VALUES ('all_reduce_perf','1','1','1','32KB','1',10.88,10.88,10.88,10.88,22.53,22.53,906),('all_reduce_perf','1','1','1','32KB','5',16.48,16.48,16.48,16.48,34.07,34.07,907),('all_reduce_perf','1','1','1','32KB','10',21.44,21.44,21.52,21.52,22.21,22.21,908),('all_reduce_perf','1','1','4','32KB','1',10.8,10.8,10.8,10.8,22.95,22.95,909),('all_reduce_perf','1','1','4','32KB','5',15.92,15.92,15.92,15.92,33.06,33.06,910),('all_reduce_perf','1','1','4','32KB','10',20.96,20.96,20.96,20.96,21.82,21.82,911),('all_reduce_perf','2','1','1','32KB','1',8.64,13.04,8.64,8.64,27.23,27.23,912),('all_reduce_perf','2','1','1','32KB','5',12.72,19.04,12.72,12.72,39.5,39.5,913),('all_reduce_perf','2','1','1','32KB','10',17.52,26.24,17.52,17.52,18.04,18.04,914),('all_reduce_perf','2','1','4','32KB','1',9.12,13.68,9.12,9.12,29.99,29.99,915),('all_reduce_perf','2','1','4','32KB','5',13.12,19.6,13.12,13.12,41.14,41.14,916),('all_reduce_perf','2','1','4','32KB','10',17.04,25.52,17.04,17.04,17.76,17.76,917),('all_reduce_perf','4','1','1','32KB','1',5.92,10.4,5.92,5.92,21.98,21.98,918),('all_reduce_perf','4','2','1','32KB','5',9.6,16.8,9.6,9.6,34.26,39.06,919),('all_reduce_perf','4','2','1','32KB','10',17.04,29.84,17.04,17.04,62.96,62.96,920),('all_reduce_perf','4','1','4','32KB','1',6.32,11.12,6.32,6.32,24.6,24.6,921),('all_reduce_perf','4','2','4','32KB','5',9.6,16.8,9.6,9.6,38.21,42.95,922),('all_reduce_perf','4','2','4','32KB','10',16.16,28.24,16.16,16.16,62.63,62.63,923),('all_reduce_perf','1','1','1','512KB','1',48.96,48.96,48.96,48.96,50.64,50.65,924),('all_reduce_perf','1','1','1','512KB','5',56.4,56.4,56.24,56.24,58.14,58.14,925),('all_reduce_perf','1','1','1','512KB','10',63.84,63.84,64,64,66.35,66.35,926),('all_reduce_perf','1','1','4','512KB','1',50.08,50.08,50.08,50.08,51.95,51.95,927),('all_reduce_perf','1','1','4','512KB','5',60.56,60.56,60.64,60.64,62.59,62.59,928),('all_reduce_perf','1','1','4','512KB','10',68.72,68.72,68.88,68.88,71.16,71.16,929),('all_reduce_perf','2','1','1','512KB','1',38.72,58.08,38.72,38.72,60.16,60.16,930),('all_reduce_perf','2','1','1','512KB','5',42.16,63.2,42.16,42.16,65.37,65.37,931),('all_reduce_perf','2','1','1','512KB','10',51.92,77.92,51.92,51.92,53.8,53.8,932),('all_reduce_perf','2','1','4','512KB','1',40.64,60.96,40.64,40.64,63.8,63.8,933),('all_reduce_perf','2','1','4','512KB','5',49.2,73.76,49.2,49.2,76.41,76.41,934),('all_reduce_perf','2','1','4','512KB','10',53.04,79.52,53.04,53.04,55.03,55.04,935),('all_reduce_perf','4','2','1','512KB','1',39.44,69.12,39.44,39.44,143.77,143.77,936),('all_reduce_perf','4','2','1','512KB','5',42.72,74.72,42.72,42.72,78.59,78.59,937),('all_reduce_perf','4','2','1','512KB','10',61.68,108,61.76,61.76,112.3,112.3,938),('all_reduce_perf','4','2','4','512KB','1',36.64,64.08,36.64,36.64,133.84,133.86,939),('all_reduce_perf','4','2','4','512KB','5',41.76,73.04,41.76,41.76,77.96,77.97,940),('all_reduce_perf','4','2','4','512KB','10',64.32,112.64,64.4,64.4,117.61,117.62,941),('all_reduce_perf','1','1','1','8MB','1',71.44,71.44,71.28,71.28,73.44,73.44,942),('all_reduce_perf','1','1','1','8MB','5',65.6,65.6,65.6,65.6,67.51,67.51,943),('all_reduce_perf','1','1','1','8MB','10',75.76,75.76,75.6,75.6,78.02,78.02,944),('all_reduce_perf','1','1','4','8MB','1',76.16,76.16,76.08,76.08,78.41,78.4,945),('all_reduce_perf','1','1','4','8MB','5',78.32,78.32,78.08,78.08,80.75,80.75,946),('all_reduce_perf','1','1','4','8MB','10',85.44,85.44,86,86,87.95,87.95,947),('all_reduce_perf','2','1','1','8MB','1',53.92,80.88,54,54,83.47,83.47,948),('all_reduce_perf','2','1','1','8MB','5',45.52,68.24,45.52,45.52,70.18,70.18,949),('all_reduce_perf','2','1','1','8MB','10',52.4,78.56,52.4,52.4,80.84,80.84,950),('all_reduce_perf','2','1','4','8MB','1',62.56,93.84,62.48,62.48,96.87,96.87,951),('all_reduce_perf','2','1','4','8MB','5',61.76,92.64,61.76,61.76,95.31,95.32,952),('all_reduce_perf','2','1','4','8MB','10',64,95.92,64,64,98.91,98.92,953),('all_reduce_perf','4','2','1','8MB','1',80.4,140.72,80.48,80.48,145.03,145.03,954),('all_reduce_perf','4','2','1','8MB','5',76.16,133.28,76.16,76.16,137.19,137.19,955),('all_reduce_perf','4','2','1','8MB','10',74.32,130.08,74.4,74.4,134.45,134.45,956),('all_reduce_perf','4','2','4','8MB','1',80.96,141.68,80.96,80.96,146.29,146.29,957),('all_reduce_perf','4','2','4','8MB','5',88.24,154.4,88.24,88.24,159.83,159.84,958),('all_reduce_perf','4','2','4','8MB','10',91.04,159.28,91.04,91.04,164.19,164.19,959),('all_reduce_perf','1','1','1','64MB','1',75.84,75.84,76.08,76.08,78.04,78.04,960),('all_reduce_perf','1','1','1','64MB','5',68.8,68.8,68.96,68.96,71.03,71.03,961),('all_reduce_perf','1','1','1','64MB','10',79.36,79.36,79.44,79.44,81.97,81.97,962),('all_reduce_perf','1','1','4','64MB','1',86.56,86.56,86.64,86.64,89.57,89.57,963),('all_reduce_perf','1','1','4','64MB','5',86.8,86.8,87.04,87.04,89.76,89.76,964),('all_reduce_perf','1','1','4','64MB','10',93.28,93.28,93.36,93.36,96.49,96.49,965),('all_reduce_perf','2','1','1','64MB','1',52.8,79.12,52.88,52.88,81.6,81.6,966),('all_reduce_perf','2','1','1','64MB','5',46.48,69.68,46.48,46.48,71.93,71.93,967),('all_reduce_perf','2','1','1','64MB','10',78.64,117.92,78.64,78.64,81.04,81.04,968),('all_reduce_perf','2','1','4','64MB','1',64,96,64,64,98.82,98.81,969),('all_reduce_perf','2','1','4','64MB','5',63.28,94.88,63.28,63.28,97.73,97.73,970),('all_reduce_perf','2','1','4','64MB','10',78.48,117.76,78.48,78.48,80.87,80.87,971),('all_reduce_perf','4','2','1','64MB','1',83.2,145.6,83.2,83.2,149.77,149.77,972),('all_reduce_perf','4','2','1','64MB','5',73.84,129.28,73.84,73.84,133.2,133.21,973),('all_reduce_perf','4','2','1','64MB','10',74.32,130.08,74.32,74.32,133.78,133.78,974),('all_reduce_perf','4','2','4','64MB','1',91.44,160,91.44,91.44,164.7,164.7,975),('all_reduce_perf','4','2','4','64MB','5',92.48,161.84,92.48,92.48,166.56,166.56,976),('all_reduce_perf','4','2','4','64MB','10',92.96,162.64,92.96,92.96,167.36,167.36,977);
/*!40000 ALTER TABLE `NCCL_4PORT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nccl_C5GjXEnwCT`
--

DROP TABLE IF EXISTS `nccl_C5GjXEnwCT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nccl_C5GjXEnwCT` (
  `TYPE` varchar(255) DEFAULT NULL,
  `SIZE` varchar(255) DEFAULT NULL,
  `GPU_Num` varchar(255) DEFAULT NULL,
  `Port_Num` varchar(255) DEFAULT NULL,
  `QP` varchar(255) DEFAULT NULL,
  `Aggregation_Count` varchar(255) DEFAULT NULL,
  `out_algbw(Gbps)` float DEFAULT NULL,
  `out_busbw(Gbps)` float DEFAULT NULL,
  `in_algbw(Gbps)` float DEFAULT NULL,
  `in_busbw(Gbps)` float DEFAULT NULL,
  `avg_switch_in(Gbps)` float DEFAULT NULL,
  `avg_switch_out(Gbps)` float DEFAULT NULL,
  `log_id` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nccl_C5GjXEnwCT`
--

LOCK TABLES `nccl_C5GjXEnwCT` WRITE;
/*!40000 ALTER TABLE `nccl_C5GjXEnwCT` DISABLE KEYS */;
INSERT INTO `nccl_C5GjXEnwCT` VALUES ('all_reduce_perf','32KB','1','5','1','1',131.44,121.333,124.774,149.904,123.825,113.386,23),('all_reduce_perf','32KB','1','3','1','5',126.715,123.666,145.159,106.518,128.362,111.807,24),('all_reduce_perf','32KB','1','5','1','10',112.519,109.115,131.324,119.279,124.864,113.591,25),('all_reduce_perf','32KB','1','2','4','1',121.915,141.922,124.95,104.312,115.522,131.098,26),('all_reduce_perf','32KB','1','2','4','5',102.345,139.041,144.488,110.877,108.912,143.778,27),('all_reduce_perf','32KB','1','5','4','10',107.123,130.886,141.075,121.866,141.423,108.8,28),('all_reduce_perf','32KB','2','3','1','1',144.935,112.373,141.73,142.91,107.475,110.005,29),('all_reduce_perf','32KB','2','4','1','5',123.513,136.189,137.265,107.529,145.043,134.145,30),('all_reduce_perf','32KB','2','5','1','10',112.446,132.125,131.735,128.545,125.119,141.594,31),('all_reduce_perf','32KB','2','6','4','1',125.749,121.253,125.137,143.023,149.557,134.948,32),('all_reduce_perf','32KB','2','3','4','5',123.027,112.319,129.583,146.918,113.901,138.736,33),('all_reduce_perf','32KB','2','4','4','10',127.187,130.044,144.321,111.371,120.492,132.733,34),('all_reduce_perf','32KB','4','5','1','1',110.937,120.591,117.898,146.372,138.813,112.549,35),('all_reduce_perf','32KB','4','6','1','5',122.777,147.778,127.463,104.63,111.545,112.025,36),('all_reduce_perf','32KB','4','5','1','10',147.146,133.949,126.839,148.107,125.53,144.268,37),('all_reduce_perf','32KB','4','7','4','1',101.077,149.721,128.406,108.233,113.612,104.714,38),('all_reduce_perf','32KB','4','7','4','5',114.51,124.653,148.415,143.077,145.214,140.319,39),('all_reduce_perf','32KB','4','7','4','10',132.629,123.146,112.807,144.768,100.005,117.123,40),('all_reduce_perf','512KB','1','5','1','1',147.965,100.476,133.412,116.648,135.996,111.92,41),('all_reduce_perf','512KB','1','4','1','5',146.023,116.752,133.246,114.012,147.731,135.785,42),('all_reduce_perf','512KB','1','4','1','10',102.984,102.229,112.496,109.337,109.467,106.631,43),('all_reduce_perf','512KB','1','5','4','1',132.798,141.105,123.461,149.515,145.133,122.621,44),('all_reduce_perf','512KB','1','2','4','5',133.149,123.511,140.977,147.421,104.778,115.234,45),('all_reduce_perf','512KB','1','4','4','10',148.605,117.349,119.282,141.275,122.59,127.011,46),('all_reduce_perf','512KB','2','4','1','1',111.043,132.095,140.973,111.678,149.139,149.863,47),('all_reduce_perf','512KB','2','6','1','5',123.503,135.283,113.198,120.453,128.388,143.657,48),('all_reduce_perf','512KB','2','6','1','10',133.581,102.898,120.736,101.678,127.018,103.492,49),('all_reduce_perf','512KB','2','3','4','1',120.779,103.814,124.904,133.854,116.034,131.884,50),('all_reduce_perf','512KB','2','3','4','5',113.703,135.308,124.561,133.407,126.064,129.098,51),('all_reduce_perf','512KB','2','4','4','10',140.085,147.82,109.106,114.616,121.037,111.578,52),('all_reduce_perf','512KB','4','8','1','1',128.373,105.691,129.408,119.325,148.585,138.349,53),('all_reduce_perf','512KB','4','6','1','5',148.622,108.565,126.736,135.808,119.711,132.156,54),('all_reduce_perf','512KB','4','6','1','10',126.894,135.87,132.618,105.311,127.123,130.667,55),('all_reduce_perf','512KB','4','5','4','1',146.327,135.811,102.713,111.101,120.526,100.639,56),('all_reduce_perf','512KB','4','5','4','5',109.774,149.073,110.898,105.752,128.679,117.802,57),('all_reduce_perf','512KB','4','6','4','10',131.481,118.012,132.362,101.678,115.693,136.775,58),('all_reduce_perf','8MB','1','3','1','1',120.726,132.443,115.674,114.877,117.565,109.185,59),('all_reduce_perf','8MB','1','3','1','5',144.88,141.213,102.384,145.987,112.833,147.352,60),('all_reduce_perf','8MB','1','5','1','10',135.264,142.361,140.98,128.63,106.604,144.29,61),('all_reduce_perf','8MB','1','5','4','1',121.776,126.689,138.184,100.057,121.671,106.647,62),('all_reduce_perf','8MB','1','4','4','5',112.884,108.327,118.992,113.337,111.355,124.966,63),('all_reduce_perf','8MB','1','2','4','10',102.408,118.297,143.872,133.884,133.715,137.021,64),('all_reduce_perf','8MB','2','3','1','1',113.289,140.952,110.053,118.631,139.314,135.414,65),('all_reduce_perf','8MB','2','6','1','5',122.754,133.778,110.63,127.589,125.312,129.389,66),('all_reduce_perf','8MB','2','5','1','10',133.626,117.41,110.618,133.836,139.793,131.532,67),('all_reduce_perf','8MB','2','4','4','1',125.96,129.839,103.084,138.226,112.656,145.854,68),('all_reduce_perf','8MB','2','3','4','5',123.172,112.241,142.989,114.181,140.179,102.288,69),('all_reduce_perf','8MB','2','5','4','10',146.783,106.723,110.022,135.768,135.829,147.429,70),('all_reduce_perf','8MB','4','5','1','1',148.493,122.302,131.214,125.034,115.216,147.225,71),('all_reduce_perf','8MB','4','6','1','5',129.1,101.391,147.754,120.23,106.825,122.75,72),('all_reduce_perf','8MB','4','7','1','10',125.163,146.365,140.471,111.668,138.278,110.047,73),('all_reduce_perf','8MB','4','5','4','1',135.414,124.238,140.354,133.549,106.361,134.125,74),('all_reduce_perf','8MB','4','6','4','5',137.275,142.23,136.205,102.445,121.647,135.26,75),('all_reduce_perf','8MB','4','7','4','10',121.159,104.965,108.627,104.792,110.817,110.322,76),('all_reduce_perf','64MB','1','2','1','1',139.019,127.365,139.43,140.54,120.492,132.409,77),('all_reduce_perf','64MB','1','2','1','5',136.705,142.831,138.936,119.86,107.691,133.645,78),('all_reduce_perf','64MB','1','3','1','10',113.598,109.418,108.014,131.021,141.837,105.81,79),('all_reduce_perf','64MB','1','2','4','1',128.818,101.807,137.513,144.758,114.516,142.429,80),('all_reduce_perf','64MB','1','3','4','5',138.799,135.617,102.33,118.502,123.044,144.48,81),('all_reduce_perf','64MB','1','4','4','10',136.233,124.8,117.011,135.404,114.468,106.815,82),('all_reduce_perf','64MB','2','3','1','1',145.467,104.885,124.639,143.321,141.867,128.191,83),('all_reduce_perf','64MB','2','3','1','5',137.215,117.204,131.788,109.237,102.728,141.878,84),('all_reduce_perf','64MB','2','5','1','10',104.119,145.609,124.682,124.733,135.855,103.999,85),('all_reduce_perf','64MB','2','5','4','1',101.391,122.096,142.875,120.345,122.795,104.612,86),('all_reduce_perf','64MB','2','4','4','5',138.129,136.943,123.207,133.326,144.503,118.969,87),('all_reduce_perf','64MB','2','3','4','10',143.849,105.775,101.124,113.322,148.777,116.018,88),('all_reduce_perf','64MB','4','8','1','1',125.062,128.489,130.008,134.459,140.879,115.131,89),('all_reduce_perf','64MB','4','5','1','5',131.494,108.953,121.769,140.975,116.525,142.107,90),('all_reduce_perf','64MB','4','5','1','10',107.894,112.592,134.616,146.467,144.084,147.949,91),('all_reduce_perf','64MB','4','8','4','1',106.811,118.856,117.277,109.568,112.156,138.398,92),('all_reduce_perf','64MB','4','8','4','5',100.327,104.918,145.434,114.307,128.146,110.731,93),('all_reduce_perf','64MB','4','8','4','10',127.077,112.225,130.35,129.158,129.696,121.679,94),('all_reduce_merge','32KB','1','4','1','1',106.442,127.729,132.249,104.012,149.323,136.076,95),('all_reduce_merge','32KB','1','5','1','5',138.554,135.249,133.502,108.044,110.14,124.825,96),('all_reduce_merge','32KB','1','2','1','10',104.208,102.607,122.54,105.867,148.262,104.876,97),('all_reduce_merge','32KB','1','5','4','1',122.934,122.98,124.859,127.804,106.708,125.489,98),('all_reduce_merge','32KB','1','3','4','5',128.162,142.767,101.791,123.601,143.768,147.548,99),('all_reduce_merge','32KB','1','5','4','10',110.905,140.135,142.12,107.659,124.907,142.548,100),('all_reduce_merge','32KB','2','5','1','1',142.394,116.408,124.959,101.888,141.354,149.21,101),('all_reduce_merge','32KB','2','3','1','5',103.832,128.766,138.095,135.161,147.302,112.975,102),('all_reduce_merge','32KB','2','4','1','10',132.581,120.097,145.381,138.196,149.067,130.605,103),('all_reduce_merge','32KB','2','4','4','1',117.963,121.454,147.173,118.045,141.984,144.755,104),('all_reduce_merge','32KB','2','3','4','5',130.974,116.165,141.874,121.057,119.376,101.985,105),('all_reduce_merge','32KB','2','6','4','10',146.768,124.998,143.034,108.065,116.982,128.529,106),('all_reduce_merge','32KB','4','5','1','1',114.675,103.146,141.712,142.711,124.74,112.133,107),('all_reduce_merge','32KB','4','6','1','5',117.611,146.345,109.319,147.761,149.173,125.568,108),('all_reduce_merge','32KB','4','6','1','10',100.156,135.735,135.998,149.831,118.04,125.432,109),('all_reduce_merge','32KB','4','6','4','1',125.564,113.018,113.482,118.052,137.909,109.185,110),('all_reduce_merge','32KB','4','6','4','5',131.68,141.643,106.488,141.06,142.241,122.928,111),('all_reduce_merge','32KB','4','6','4','10',143.811,110.367,141.789,133.936,134.491,119.015,112),('all_reduce_merge','512KB','1','4','1','1',137.534,138.111,144.227,114.556,125.559,140.252,113),('all_reduce_merge','512KB','1','5','1','5',130.947,110.519,125.939,115.815,149.712,110.068,114),('all_reduce_merge','512KB','1','2','1','10',128.549,119.33,123.168,133.381,117.655,107.605,115),('all_reduce_merge','512KB','1','2','4','1',118.462,149.622,140.21,106.285,138.415,146.64,116),('all_reduce_merge','512KB','1','4','4','5',128.25,117.444,105.966,137.99,142.979,140.592,117),('all_reduce_merge','512KB','1','3','4','10',109.184,149.136,102.094,102.516,135.258,102.928,118),('all_reduce_merge','512KB','2','4','1','1',139.089,111.013,141.211,128.545,139.174,107.947,119),('all_reduce_merge','512KB','2','5','1','5',136.988,121.784,132.578,104.58,114.124,115.332,120),('all_reduce_merge','512KB','2','4','1','10',128.795,125.547,104.803,123.246,135.146,126.503,121),('all_reduce_merge','512KB','2','3','4','1',105.611,105.258,135.131,145.611,127.544,102.826,122),('all_reduce_merge','512KB','2','6','4','5',145.709,136.895,128.3,106.609,144.518,146.268,123),('all_reduce_merge','512KB','2','4','4','10',103.522,147.287,116.275,132.213,141.536,147.31,124),('all_reduce_merge','512KB','4','8','1','1',118.934,126.528,132.808,147.323,133.05,138.475,125),('all_reduce_merge','512KB','4','7','1','5',140.028,134.085,138.969,138.978,131.222,136.665,126),('all_reduce_merge','512KB','4','8','1','10',123.632,108.832,115.28,129.836,144.394,115.584,127),('all_reduce_merge','512KB','4','6','4','1',122.001,143.456,145.148,125.561,127.503,105.761,128),('all_reduce_merge','512KB','4','5','4','5',128.037,117.151,147.129,117.751,142.062,119.189,129),('all_reduce_merge','512KB','4','6','4','10',101.715,105.207,142.18,109.717,125.108,136.421,130),('all_reduce_merge','8MB','1','2','1','1',114.835,110.106,140.559,110.114,123.203,126.891,131),('all_reduce_merge','8MB','1','5','1','5',130.67,106.273,128.104,134.21,124.782,108.877,132),('all_reduce_merge','8MB','1','4','1','10',127.693,100.301,117.138,122.135,143.553,127.866,133),('all_reduce_merge','8MB','1','2','4','1',138.528,100.652,135.145,109.117,144.137,138.506,134),('all_reduce_merge','8MB','1','3','4','5',128.877,127.347,116.79,121.586,127.331,112.447,135),('all_reduce_merge','8MB','1','3','4','10',149.49,142.241,135.293,123.278,137.755,149.689,136),('all_reduce_merge','8MB','2','5','1','1',113.738,138.749,118.34,104.237,127.61,110.608,137),('all_reduce_merge','8MB','2','4','1','5',130.894,121.526,127.814,123.942,146.678,112.374,138),('all_reduce_merge','8MB','2','3','1','10',141.159,142.208,137.91,129.994,133.349,100.977,139),('all_reduce_merge','8MB','2','6','4','1',105.184,141.752,105.638,129.397,112.774,110.269,140),('all_reduce_merge','8MB','2','4','4','5',127.049,118.855,147.413,120.745,135.615,117.153,141),('all_reduce_merge','8MB','2','5','4','10',110.693,141.869,108.262,112.383,114.584,104.652,142),('all_reduce_merge','8MB','4','8','1','1',118.401,108.028,134.71,112.117,144.862,131.975,143),('all_reduce_merge','8MB','4','8','1','5',107.916,146.898,149.996,111.28,110.515,115.581,144),('all_reduce_merge','8MB','4','5','1','10',128.404,130.133,124.697,125.162,142.788,126.249,145),('all_reduce_merge','8MB','4','8','4','1',133.571,107.559,121.549,143.653,104.536,149.47,146),('all_reduce_merge','8MB','4','6','4','5',122.502,114.884,132.167,125.886,125.517,137.131,147),('all_reduce_merge','8MB','4','7','4','10',110.165,123.932,117.385,139.714,138.193,119.624,148),('all_reduce_merge','64MB','1','3','1','1',144.374,121.054,124.674,124.199,129.211,109.968,149),('all_reduce_merge','64MB','1','3','1','5',128.959,115.632,126.298,145.267,136.34,133.348,150),('all_reduce_merge','64MB','1','4','1','10',134.452,119.216,130.457,147.554,103.449,144.694,151),('all_reduce_merge','64MB','1','3','4','1',114.675,115.97,101.607,132.833,116.259,137.262,152),('all_reduce_merge','64MB','1','5','4','5',116.577,103.817,133.356,133.947,112.366,109.127,153),('all_reduce_merge','64MB','1','5','4','10',115.071,128.921,109.33,136.188,147.682,107.739,154),('all_reduce_merge','64MB','2','6','1','1',126.174,146.636,145.806,100.382,117.212,143.716,155),('all_reduce_merge','64MB','2','6','1','5',122.717,101.768,106.653,119.157,138.695,118.928,156),('all_reduce_merge','64MB','2','4','1','10',107.545,141.31,130.34,145.82,121.202,109.989,157),('all_reduce_merge','64MB','2','5','4','1',141.147,115.91,136.841,149.051,107.87,116.253,158),('all_reduce_merge','64MB','2','4','4','5',108.104,121.513,102.333,135.868,102.174,120.404,159),('all_reduce_merge','64MB','2','6','4','10',133.545,149.409,105.725,109.752,108.563,140.35,160),('all_reduce_merge','64MB','4','8','1','1',119.36,128.365,130.72,129.855,121.931,124.331,161),('all_reduce_merge','64MB','4','7','1','5',111.631,126.061,143.983,132.681,106.325,141.777,162),('all_reduce_merge','64MB','4','5','1','10',132.748,146.249,133.238,147.355,116.854,139.314,163),('all_reduce_merge','64MB','4','6','4','1',135.079,138.42,102.762,141.641,146.503,109.815,164),('all_reduce_merge','64MB','4','7','4','5',138.614,122.274,104.881,143.028,122.2,146.684,165),('all_reduce_merge','64MB','4','8','4','10',111.949,118.305,108.55,108.42,123.499,137.142,166),('avg_reduce_perf','32KB','1','2','1','1',147.466,115.708,147.402,119.159,121.607,130.527,167),('avg_reduce_perf','32KB','1','4','1','5',108.525,145.748,112.704,140.289,141.351,142.846,168),('avg_reduce_perf','32KB','1','4','1','10',129.198,123.772,123.594,104.957,104.06,131.755,169),('avg_reduce_perf','32KB','1','4','4','1',103.502,147.701,137.803,115.709,104.856,104.865,170),('avg_reduce_perf','32KB','1','3','4','5',138.085,139.007,107.496,117.905,111.589,129.855,171),('avg_reduce_perf','32KB','1','2','4','10',144.134,120.065,120.058,106.164,142.903,123.98,172),('avg_reduce_perf','32KB','2','6','1','1',118.541,129.376,131.645,103.97,117.91,136.275,173),('avg_reduce_perf','32KB','2','5','1','5',131.207,110.906,132.245,117.037,133.08,117.87,174),('avg_reduce_perf','32KB','2','5','1','10',141.807,116.678,106.731,131.75,135.484,105.723,175),('avg_reduce_perf','32KB','2','6','4','1',123.323,113.1,127.842,146.204,114.558,142.725,176),('avg_reduce_perf','32KB','2','3','4','5',102.639,132.685,105.699,140.54,108.703,127.884,177),('avg_reduce_perf','32KB','2','3','4','10',110.558,109.339,115.056,146.212,125.014,124.487,178),('avg_reduce_perf','32KB','4','8','1','1',103.285,118.147,101.47,119.508,106.879,142.282,179),('avg_reduce_perf','32KB','4','7','1','5',136.489,101.616,107.021,136.633,118.624,146.644,180),('avg_reduce_perf','32KB','4','6','1','10',128.231,104.299,124.16,104.218,101.753,114.037,181),('avg_reduce_perf','32KB','4','6','4','1',133.794,139.045,146.075,118.261,121.148,127.145,182),('avg_reduce_perf','32KB','4','7','4','5',136.009,102.487,130.892,129.927,115.94,144.156,183),('avg_reduce_perf','32KB','4','6','4','10',114.559,143.861,133.869,103.2,122.863,109.634,184),('avg_reduce_perf','512KB','1','5','1','1',129.736,127.796,100.77,136.059,138.88,127.354,185),('avg_reduce_perf','512KB','1','4','1','5',121.133,134.49,122.516,126.501,129.114,105.495,186),('avg_reduce_perf','512KB','1','5','1','10',143.769,140.77,100.062,112.047,128.763,116.304,187);
/*!40000 ALTER TABLE `nccl_C5GjXEnwCT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verb_36nGCqgYE8`
--

DROP TABLE IF EXISTS `verb_36nGCqgYE8`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verb_36nGCqgYE8` (
  `TYPE` varchar(255) DEFAULT NULL,
  `PORT` varchar(255) DEFAULT NULL,
  `SIZE` varchar(255) DEFAULT NULL,
  `CLASS` varchar(255) DEFAULT NULL,
  `BIDIRECTION` varchar(255) DEFAULT NULL,
  `QP` varchar(255) DEFAULT NULL,
  `BW(Gpbs)` float DEFAULT NULL,
  `Latency(usec)` float DEFAULT NULL,
  `avg_switch_in(Gbps)` float DEFAULT NULL,
  `avg_switch_out(Gbps)` float DEFAULT NULL,
  `log_id` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verb_36nGCqgYE8`
--

LOCK TABLES `verb_36nGCqgYE8` WRITE;
/*!40000 ALTER TABLE `verb_36nGCqgYE8` DISABLE KEYS */;
INSERT INTO `verb_36nGCqgYE8` VALUES ('ib_read','1','8KB','64',NULL,'1',133.201,0.0970415,144.145,122.446,304),('ib_read','1','8KB','64','True','1',130.868,0.14904,112.514,148.795,305),('ib_read','1','8KB','64',NULL,'2',130.133,0.107321,104.036,109.875,306),('ib_read','1','8KB','64','True','2',116.89,0.266327,136.305,121.547,307),('ib_read','1','8KB','64',NULL,'4',143.168,0.219649,134.405,104.69,308),('ib_read','1','8KB','64','True','4',129.677,0.27715,113.857,105.227,309),('ib_read','1','16KB','64',NULL,'1',114.603,0.126174,126.054,131.852,310),('ib_read','1','16KB','64','True','1',141.984,0.223386,147.543,144.194,311),('ib_read','1','16KB','64',NULL,'2',143.439,0.244478,141.211,144.493,312),('ib_read','1','16KB','64','True','2',146.296,0.0752815,114.697,147.764,313),('ib_read','1','16KB','64',NULL,'4',134.775,0.0327087,123.02,118.207,314),('ib_read','1','16KB','64','True','4',144.279,0.172542,102.288,112.93,315),('ib_read','1','32KB','64',NULL,'1',108.453,0.226291,115.231,143.636,316),('ib_read','1','32KB','64','True','1',121.41,0.190493,125.48,128.22,317),('ib_read','1','32KB','64',NULL,'2',121.904,0.122696,142.098,122.975,318),('ib_read','1','32KB','64','True','2',109.678,0.100674,129.214,138.289,319),('ib_read','1','32KB','64',NULL,'4',119.739,0.225485,109.078,137.759,320),('ib_read','1','32KB','64','True','4',119.252,0.0996024,115.112,114.758,321),('ib_read','1','62KB','64',NULL,'1',140.623,0.234379,102.75,143.167,322),('ib_read','1','62KB','64','True','1',119.88,0.0524097,140.823,121.029,323),('ib_read','1','62KB','64',NULL,'2',102.049,0.111225,139.011,122.825,324),('ib_read','1','62KB','64','True','2',149.237,0.194221,118.757,139.22,325),('ib_read','1','62KB','64',NULL,'4',149.65,0.29416,105.116,137.84,326),('ib_read','1','62KB','64','True','4',131.293,0.213782,135.682,147.225,327),('ib_read','1','1MB','64',NULL,'1',116.858,0.0737358,111.516,141.43,328),('ib_read','1','1MB','64','True','1',148.287,0.0928807,107.718,134.669,329),('ib_read','1','1MB','64',NULL,'2',118.855,0.156424,114.6,142.378,330),('ib_read','1','1MB','64','True','2',102.161,0.102903,109.687,129.126,331),('ib_read','1','1MB','64',NULL,'4',120.37,0.262058,138.459,144.413,332),('ib_read','1','1MB','64','True','4',129.756,0.0748338,122.583,138.433,333),('ib_read','2','8KB','64',NULL,'1',110.852,0.241088,130.413,105.99,334),('ib_read','2','8KB','64','True','1',113.838,0.00819794,119.243,103.646,335),('ib_read','2','8KB','64',NULL,'2',133.187,0.128093,123.581,146.436,336),('ib_read','2','8KB','64','True','2',124.555,0.0142929,146.126,131.27,337),('ib_read','2','8KB','64',NULL,'4',102.1,0.163002,124.976,120.018,338),('ib_read','2','8KB','64','True','4',116.633,0.226344,143.034,146.827,339),('ib_read','2','16KB','64',NULL,'1',143.149,0.198267,136.131,100.757,340),('ib_read','2','16KB','64','True','1',105.25,0.159471,147.881,107.828,341),('ib_read','2','16KB','64',NULL,'2',103.101,0.138869,102.211,137.133,342),('ib_read','2','16KB','64','True','2',105.771,0.285035,101.779,106.508,343),('ib_read','2','16KB','64',NULL,'4',119.752,0.181608,145.367,138.543,344),('ib_read','2','16KB','64','True','4',101.887,0.1242,148.178,126.792,345);
/*!40000 ALTER TABLE `verb_36nGCqgYE8` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verb_9XMcuNAm9Q`
--

DROP TABLE IF EXISTS `verb_9XMcuNAm9Q`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verb_9XMcuNAm9Q` (
  `TYPE` varchar(255) DEFAULT NULL,
  `PORT` varchar(255) DEFAULT NULL,
  `SIZE` varchar(255) DEFAULT NULL,
  `CLASS` varchar(255) DEFAULT NULL,
  `BIDIRECTION` varchar(255) DEFAULT NULL,
  `QP` varchar(255) DEFAULT NULL,
  `BW(Gpbs)` float DEFAULT NULL,
  `Latency(usec)` float DEFAULT NULL,
  `avg_switch_in(Gbps)` float DEFAULT NULL,
  `avg_switch_out(Gbps)` float DEFAULT NULL,
  `log_id` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verb_9XMcuNAm9Q`
--

LOCK TABLES `verb_9XMcuNAm9Q` WRITE;
/*!40000 ALTER TABLE `verb_9XMcuNAm9Q` DISABLE KEYS */;
INSERT INTO `verb_9XMcuNAm9Q` VALUES ('ib_read','1','8KB','64',NULL,'1',138.944,0.00771387,125.776,134.095,188),('ib_read','1','8KB','64','True','1',136.015,0.0900792,121.337,143.997,189),('ib_read','1','8KB','64',NULL,'2',134.026,0.129246,132.211,107.018,190),('ib_read','1','8KB','64','True','2',114.074,0.000216654,140.952,104.719,191),('ib_read','1','8KB','64',NULL,'4',139.253,0.0352844,106.969,142.389,192),('ib_read','1','8KB','64','True','4',111.463,0.26781,118.085,147.177,193),('ib_read','1','16KB','64',NULL,'1',113.916,0.127338,105.563,141.463,194),('ib_read','1','16KB','64','True','1',124.204,0.291299,139.088,120.702,195),('ib_read','1','16KB','64',NULL,'2',120.732,0.289862,109.449,131.847,196),('ib_read','1','16KB','64','True','2',121.616,0.236918,115.794,124.482,197),('ib_read','1','16KB','64',NULL,'4',113.685,0.27857,132.383,123.475,198),('ib_read','1','16KB','64','True','4',148.761,0.186661,129.063,116.493,199),('ib_read','1','32KB','64',NULL,'1',105.015,0.0530233,115.276,123.275,200),('ib_read','1','32KB','64','True','1',113.694,0.288065,139.802,104.922,201),('ib_read','1','32KB','64',NULL,'2',140.539,0.200187,148.758,100.292,202),('ib_read','1','32KB','64','True','2',111.976,0.0467188,104.463,116.126,203),('ib_read','1','32KB','64',NULL,'4',144.151,0.259963,135.715,118.979,204),('ib_read','1','32KB','64','True','4',135.863,0.110666,139.679,141.949,205),('ib_read','1','62KB','64',NULL,'1',110.212,0.0533279,111.442,143.671,206),('ib_read','1','62KB','64','True','1',149.486,0.0798382,133.157,135.049,207),('ib_read','1','62KB','64',NULL,'2',119.22,0.00383604,106.883,143.373,208),('ib_read','1','62KB','64','True','2',126.807,0.0598504,106.019,110.018,209),('ib_read','1','62KB','64',NULL,'4',136.182,0.00879035,115.778,146.613,210),('ib_read','1','62KB','64','True','4',142.258,0.216331,109.169,133.284,211),('ib_read','1','1MB','64',NULL,'1',137.703,0.185261,147.97,127.228,212),('ib_read','1','1MB','64','True','1',117.182,0.0640905,120.616,136.921,213),('ib_read','1','1MB','64',NULL,'2',117.425,0.197883,108.866,147.357,214),('ib_read','1','1MB','64','True','2',138.001,0.240849,147.269,139.441,215),('ib_read','1','1MB','64',NULL,'4',134.66,0.0268098,128.826,101.945,216),('ib_read','1','1MB','64','True','4',116.257,0.200377,123.674,137.442,217),('ib_read','2','8KB','64',NULL,'1',137.073,0.296955,112.777,114.017,218),('ib_read','2','8KB','64','True','1',107.301,0.0125909,131.778,128.648,219),('ib_read','2','8KB','64',NULL,'2',107.697,0.196726,100.6,107.281,220),('ib_read','2','8KB','64','True','2',138.961,0.0291332,135.503,142.935,221),('ib_read','2','8KB','64',NULL,'4',135.025,0.28974,118.207,140.137,222),('ib_read','2','8KB','64','True','4',145.461,0.0662715,100.254,105.988,223),('ib_read','2','16KB','64',NULL,'1',135.039,0.116673,117.463,126.184,224),('ib_read','2','16KB','64','True','1',109.765,0.269398,136.603,134.481,225),('ib_read','2','16KB','64',NULL,'2',149.041,0.140279,111.491,127.761,226),('ib_read','1','8KB','64',NULL,'1',104.314,0.292105,100.99,140.01,227),('ib_read','1','8KB','64','True','1',133.346,0.133921,108.671,100.356,228),('ib_read','1','8KB','64',NULL,'2',112.897,0.133482,110.355,132.993,229),('ib_read','1','8KB','64','True','2',107.575,0.0834805,130.827,106.858,230),('ib_read','1','8KB','64',NULL,'4',116.4,0.168974,102.882,107.915,231),('ib_read','1','8KB','64','True','4',131.477,0.291292,109.688,142.581,232),('ib_read','1','16KB','64',NULL,'1',109.212,0.154025,101.662,109.57,233),('ib_read','1','16KB','64','True','1',125.785,0.0270957,143.154,121.796,234),('ib_read','1','16KB','64',NULL,'2',116.082,0.120932,149.531,141.68,235),('ib_read','1','16KB','64','True','2',131.786,0.177388,103.319,149.344,236),('ib_read','1','16KB','64',NULL,'4',118.081,0.282186,133.658,139.378,237),('ib_read','1','16KB','64','True','4',140.333,0.0463836,128.732,148.914,238),('ib_read','1','32KB','64',NULL,'1',147.343,0.165494,142.772,135.933,239),('ib_read','1','32KB','64','True','1',117.205,0.0260536,108.469,109.893,240),('ib_read','1','32KB','64',NULL,'2',137.162,0.133782,104.556,122,241),('ib_read','1','32KB','64','True','2',122.19,0.128778,121.027,144.611,242),('ib_read','1','32KB','64',NULL,'4',122.921,0.0912861,104.365,113.303,243),('ib_read','1','32KB','64','True','4',136.894,0.291219,113.361,107.142,244),('ib_read','1','62KB','64',NULL,'1',128.945,0.12476,144.331,111.547,245),('ib_read','1','62KB','64','True','1',141.687,0.257363,120.643,143.724,246),('ib_read','1','62KB','64',NULL,'2',112.594,0.165295,137.364,115.286,247),('ib_read','1','62KB','64','True','2',137.997,0.28311,103.556,123.931,248),('ib_read','1','62KB','64',NULL,'4',131.003,0.0017842,119.265,147.169,249),('ib_read','1','62KB','64','True','4',130.313,0.283204,114.779,135.951,250),('ib_read','1','1MB','64',NULL,'1',125.269,0.29449,135.63,123.645,251),('ib_read','1','1MB','64','True','1',109.594,0.224481,111.708,121.245,252),('ib_read','1','1MB','64',NULL,'2',132.545,0.0264347,113.712,137.227,253),('ib_read','1','1MB','64','True','2',135.717,0.0220396,121.798,125.927,254),('ib_read','1','1MB','64',NULL,'4',149.086,0.0785559,104.838,120.073,255),('ib_read','1','1MB','64','True','4',142.039,0.0339522,134.234,133.478,256),('ib_read','2','8KB','64',NULL,'1',108.391,0.17985,123.514,141.442,257),('ib_read','2','8KB','64','True','1',124.933,0.0905839,107.906,147.083,258),('ib_read','2','8KB','64',NULL,'2',116.696,0.259384,142.757,120.838,259),('ib_read','2','8KB','64','True','2',112.011,0.268446,118.071,141.827,260),('ib_read','2','8KB','64',NULL,'4',125.96,0.0993498,116.251,128.068,261),('ib_read','2','8KB','64','True','4',142.868,0.0270394,111.862,101.748,262),('ib_read','2','16KB','64',NULL,'1',141.935,0.226194,109.603,123.093,263),('ib_read','2','16KB','64','True','1',125.521,0.02749,113.564,107.83,264),('ib_read','2','16KB','64',NULL,'2',118.553,0.266563,146.56,113.051,265),('ib_read','2','16KB','64','True','2',109.35,0.12242,131.443,136.254,266),('ib_read','2','16KB','64',NULL,'4',138.156,0.0719354,123.782,127.365,267),('ib_read','2','16KB','64','True','4',127.675,0.284433,131.775,134.689,268),('ib_read','2','32KB','64',NULL,'1',117.961,0.195799,106.034,149.52,269),('ib_read','2','32KB','64','True','1',121.99,0.141711,119.062,103.097,270),('ib_read','2','32KB','64',NULL,'2',133.739,0.00172983,104.013,133.927,271),('ib_read','2','32KB','64','True','2',144.741,0.109908,108.067,140.421,272),('ib_read','2','32KB','64',NULL,'4',104.162,0.0708224,115.344,130.038,273),('ib_read','2','32KB','64','True','4',110.93,0.0954209,138.04,148.228,274),('ib_read','2','62KB','64',NULL,'1',128.833,0.267308,102.508,130.849,275),('ib_read','2','62KB','64','True','1',117.839,0.09308,108.295,121.942,276),('ib_read','2','62KB','64',NULL,'2',112.913,0.0366774,146.016,119.478,277),('ib_read','2','62KB','64','True','2',116.165,0.0691002,129.47,110.081,278),('ib_read','2','62KB','64',NULL,'4',143.935,0.264936,114.447,112.655,279),('ib_read','2','62KB','64','True','4',125.569,0.168311,128.402,131.25,280),('ib_read','2','1MB','64',NULL,'1',107.5,0.284361,135.258,111.258,281),('ib_read','2','1MB','64','True','1',123.11,0.0674029,124.446,129.57,282),('ib_read','2','1MB','64',NULL,'2',122.995,0.016477,117.87,149.943,283),('ib_read','2','1MB','64','True','2',144.954,0.0336848,132.076,106.928,284),('ib_read','2','1MB','64',NULL,'4',125.507,0.225099,128.1,131.344,285),('ib_read','2','1MB','64','True','4',122.98,0.247575,109.059,126.075,286),('ib_send','1','8KB','64',NULL,'1',135.197,0.0761246,145.267,130.811,287),('ib_send','1','8KB','64','True','1',145.245,0.103304,122.1,143.503,288),('ib_send','1','8KB','64',NULL,'2',139.882,0.0211639,121.868,104.328,289),('ib_send','1','8KB','64','True','2',134.388,0.269551,122.369,131.434,290),('ib_send','1','8KB','64',NULL,'4',114.985,0.20036,139.891,145.642,291),('ib_send','1','8KB','64','True','4',145.922,0.210601,139.521,140.416,292),('ib_send','1','16KB','64',NULL,'1',100.207,0.0765682,138.228,145.441,293),('ib_send','1','16KB','64','True','1',100.203,0.174865,116.042,105.954,294),('ib_send','1','16KB','64',NULL,'2',114.442,0.0315817,147.956,148.194,295),('ib_send','1','16KB','64','True','2',116.337,0.15178,133.702,109.829,296),('ib_send','1','16KB','64',NULL,'4',103.277,0.0156273,116.344,130.179,297),('ib_send','1','16KB','64','True','4',127.425,0.129979,118.205,112.543,298),('ib_send','1','32KB','64',NULL,'1',107.716,0.24488,119.975,134.537,299),('ib_send','1','32KB','64','True','1',138.349,0.104318,103.005,114.705,300),('ib_send','1','32KB','64',NULL,'2',124.947,0.032578,143.97,101.767,301),('ib_send','1','32KB','64','True','2',145.063,0.0997398,149.958,105.162,302),('ib_send','1','32KB','64',NULL,'4',137.335,0.224809,116.533,100.807,303);
/*!40000 ALTER TABLE `verb_9XMcuNAm9Q` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verb_9ygwrOdvzR`
--

DROP TABLE IF EXISTS `verb_9ygwrOdvzR`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verb_9ygwrOdvzR` (
  `TYPE` varchar(255) DEFAULT NULL,
  `PORT` varchar(255) DEFAULT NULL,
  `SIZE` varchar(255) DEFAULT NULL,
  `CLASS` varchar(255) DEFAULT NULL,
  `BIDIRECTION` varchar(255) DEFAULT NULL,
  `QP` varchar(255) DEFAULT NULL,
  `BW(Gpbs)` float DEFAULT NULL,
  `Latency(usec)` float DEFAULT NULL,
  `avg_switch_in(Gbps)` float DEFAULT NULL,
  `avg_switch_out(Gbps)` float DEFAULT NULL,
  `log_id` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verb_9ygwrOdvzR`
--

LOCK TABLES `verb_9ygwrOdvzR` WRITE;
/*!40000 ALTER TABLE `verb_9ygwrOdvzR` DISABLE KEYS */;
INSERT INTO `verb_9ygwrOdvzR` VALUES ('ib_read','1','8KB','64','true','1',108.023,0.0614358,117.748,148.35,346),('ib_read','1','8KB','64','false','1',138.723,0.264739,112.306,108.901,347),('ib_read','1','8KB','64','true','2',125.169,0.230337,146.242,147.065,348),('ib_read','1','8KB','64','false','2',145.48,0.0440901,119.208,135.881,349),('ib_read','1','8KB','64','true','4',146.629,0.0714822,147.666,130.853,350),('ib_read','1','8KB','64','false','4',111.827,0.202043,118.971,109.053,351),('ib_read','1','16KB','64','true','1',140.745,0.226722,113.097,129.637,352),('ib_read','1','16KB','64','false','1',142.452,0.189306,116.58,146.141,353),('ib_read','1','16KB','64','true','2',142.341,0.184217,118.231,117.386,354),('ib_read','1','16KB','64','false','2',101.513,0.033685,113.356,107.386,355);
/*!40000 ALTER TABLE `verb_9ygwrOdvzR` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verb_jN1exBz9ZN`
--

DROP TABLE IF EXISTS `verb_jN1exBz9ZN`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verb_jN1exBz9ZN` (
  `TYPE` varchar(255) DEFAULT NULL,
  `PORT` varchar(255) DEFAULT NULL,
  `SIZE` varchar(255) DEFAULT NULL,
  `CLASS` varchar(255) DEFAULT NULL,
  `BIDIRECTION` varchar(255) DEFAULT NULL,
  `QP` varchar(255) DEFAULT NULL,
  `BW(Gpbs)` float DEFAULT NULL,
  `Latency(usec)` float DEFAULT NULL,
  `avg_switch_in(Gbps)` float DEFAULT NULL,
  `avg_switch_out(Gbps)` float DEFAULT NULL,
  `log_id` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verb_jN1exBz9ZN`
--

LOCK TABLES `verb_jN1exBz9ZN` WRITE;
/*!40000 ALTER TABLE `verb_jN1exBz9ZN` DISABLE KEYS */;
INSERT INTO `verb_jN1exBz9ZN` VALUES ('ib_read','1','8KB','64','True','1',135.213,0.228183,112.129,136.028,576),('ib_read','1','8KB','64','False','1',142.107,0.236168,102.859,141.938,577),('ib_read','1','8KB','64','True','2',147.673,0.233798,120.755,119.149,578),('ib_read','1','8KB','64','False','2',106.114,0.0166125,122.566,132.595,579),('ib_read','1','8KB','64','True','4',104.728,0.260972,110.374,125.311,580),('ib_read','1','8KB','64','False','4',117.536,0.118105,137.015,121.218,581),('ib_read','1','16KB','64','True','1',119.331,0.0417777,118.17,112.394,582),('ib_read','1','16KB','64','False','1',141.315,0.0753146,105.026,104.047,583),('ib_read','1','16KB','64','True','2',146.327,0.275933,143.332,121.755,584),('ib_read','1','16KB','64','False','2',102.373,0.293631,145.448,115.757,585),('ib_read','1','16KB','64','True','4',130.647,0.0506359,143.565,116.561,586),('ib_read','1','16KB','64','False','4',138.225,0.23297,142.625,138.63,587),('ib_read','1','32KB','64','True','1',118.792,0.131905,119.249,103.636,588),('ib_read','1','32KB','64','False','1',144.529,0.182586,147.727,100.372,589),('ib_read','1','32KB','64','True','2',102.83,0.0930541,106.152,137.075,590),('ib_read','1','32KB','64','False','2',102.82,0.19837,109.652,149.611,591),('ib_read','1','32KB','64','True','4',111.27,0.058801,121.824,131.705,592),('ib_read','1','32KB','64','False','4',115.87,0.0919548,114.187,128.809,593),('ib_read','1','62KB','64','True','1',148.302,0.242288,107.007,110.342,594),('ib_read','1','62KB','64','False','1',143.362,0.150792,101.38,104.271,595),('ib_read','1','62KB','64','True','2',111.399,0.18454,121.135,111.496,596),('ib_read','1','62KB','64','False','2',113.653,0.153862,147.167,118.803,597),('ib_read','1','62KB','64','True','4',148.18,0.176707,117.665,130.901,598),('ib_read','1','62KB','64','False','4',123.668,0.144935,134.117,143.777,599),('ib_read','1','1MB','64','True','1',115.706,0.176151,106.594,109.792,600),('ib_read','1','1MB','64','False','1',110.218,0.0126169,112.696,110.847,601),('ib_read','1','1MB','64','True','2',139.598,0.25831,137.739,130.299,602),('ib_read','1','1MB','64','False','2',145.47,0.292192,100.069,117.573,603),('ib_read','1','1MB','64','True','4',125.994,0.108757,107.465,111.885,604),('ib_read','1','1MB','64','False','4',133.781,0.0251922,149.838,131.357,605),('ib_read','2','8KB','64','True','1',109.346,0.224588,124.627,135.826,606),('ib_read','2','8KB','64','False','1',138.443,0.235505,109.415,109.548,607),('ib_read','2','8KB','64','True','2',125.352,0.0481565,129.328,149.773,608),('ib_read','2','8KB','64','False','2',115.864,0.238151,103.578,139.854,609),('ib_read','2','8KB','64','True','4',132.668,0.178256,130.045,127.12,610),('ib_read','2','8KB','64','False','4',105.305,0.183599,136.769,142.448,611),('ib_read','2','16KB','64','True','1',109.075,0.235059,120.577,135.961,612),('ib_read','2','16KB','64','False','1',119.538,0.202915,125.286,112.398,613),('ib_read','2','16KB','64','True','2',121.171,0.105354,132.939,119.136,614),('ib_read','2','16KB','64','False','2',106.09,0.0430222,148.264,142.689,615),('ib_read','2','16KB','64','True','4',138.398,0.140751,146.839,143.272,616),('ib_read','2','16KB','64','False','4',104.95,0.29767,129.212,114.178,617),('ib_read','2','32KB','64','True','1',131.859,0.0702174,148.349,148.291,618),('ib_read','2','32KB','64','False','1',139.092,0.252889,105.458,133.457,619),('ib_read','2','32KB','64','True','2',149.354,0.274975,145.556,137.808,620),('ib_read','2','32KB','64','False','2',120.414,0.135466,110.573,113.475,621),('ib_read','2','32KB','64','True','4',142.844,0.0758403,134.181,146.245,622),('ib_read','2','32KB','64','False','4',135.837,0.228279,149.055,139.414,623),('ib_read','2','62KB','64','True','1',128.462,0.286274,147.25,117.542,624),('ib_read','2','62KB','64','False','1',137.406,0.105259,130.902,108.046,625),('ib_read','2','62KB','64','True','2',122.562,0.0829095,129.405,145.425,626),('ib_read','2','62KB','64','False','2',130.961,0.172481,132.317,122.652,627),('ib_read','2','62KB','64','True','4',112.495,0.180901,115.057,148.171,628),('ib_read','2','62KB','64','False','4',139.7,0.0352089,136.039,128.549,629),('ib_read','2','1MB','64','True','1',118.442,0.205136,106.275,104.137,630),('ib_read','2','1MB','64','False','1',110.869,0.0417867,108.514,126.069,631),('ib_read','2','1MB','64','True','2',130.585,0.061276,107.353,124.22,632),('ib_read','2','1MB','64','False','2',133.648,0.101703,111.151,126.95,633),('ib_read','2','1MB','64','True','4',124.538,0.113957,136.026,138.874,634),('ib_read','2','1MB','64','False','4',112.836,0.00163278,131.306,149.956,635),('ib_send','1','8KB','64','True','1',104.779,0.190019,134.961,106.704,636),('ib_send','1','8KB','64','False','1',137.758,0.262895,129.829,136.065,637),('ib_send','1','8KB','64','True','2',130.272,0.185489,128.228,148.614,638),('ib_send','1','8KB','64','False','2',149.247,0.265887,138.121,118.229,639),('ib_send','1','8KB','64','True','4',135.632,0.173107,121.205,143.592,640),('ib_send','1','8KB','64','False','4',132.088,0.00117106,133.444,111.605,641),('ib_send','1','16KB','64','True','1',146.862,0.043178,136.853,110.137,642),('ib_send','1','16KB','64','False','1',146.055,0.153363,143.511,133.578,643),('ib_send','1','16KB','64','True','2',115.386,0.155586,145.783,110.697,644),('ib_send','1','16KB','64','False','2',132.99,0.0908698,128.489,102.148,645),('ib_send','1','16KB','64','True','4',102.209,0.278294,141.247,105.919,646),('ib_send','1','16KB','64','False','4',147.865,0.0264323,136.017,123.753,647),('ib_send','1','32KB','64','True','1',137.534,0.0884855,126.446,135.452,648),('ib_send','1','32KB','64','False','1',137.348,0.279486,120.384,138.381,649),('ib_send','1','32KB','64','True','2',122.027,0.275363,129.381,129.642,650),('ib_send','1','32KB','64','False','2',105.779,0.0630963,104.493,101.69,651),('ib_send','1','32KB','64','True','4',145.062,0.0429154,143.567,122.776,652),('ib_send','1','32KB','64','False','4',144.877,0.172951,143.64,113.181,653),('ib_send','1','62KB','64','True','1',118.859,0.260906,118.271,125.455,654),('ib_send','1','62KB','64','False','1',107.747,0.00121917,120.106,114.071,655),('ib_send','1','62KB','64','True','2',104.239,0.124258,142.364,140.424,656),('ib_send','1','62KB','64','False','2',141.469,0.0787971,111.863,132.684,657),('ib_send','1','62KB','64','True','4',101.112,0.131925,123.456,137.651,658),('ib_send','1','62KB','64','False','4',138.92,0.159446,109.148,129.373,659),('ib_send','1','1MB','64','True','1',121.627,0.0248045,145.909,125.269,660),('ib_send','1','1MB','64','False','1',135.806,0.156818,135.76,104.141,661),('ib_send','1','1MB','64','True','2',104.189,0.0271457,113.744,141.644,662),('ib_send','1','1MB','64','False','2',115.514,0.235313,102.292,142.816,663),('ib_send','1','1MB','64','True','4',145.923,0.0993176,122.769,109.387,664),('ib_send','1','1MB','64','False','4',119.533,0.226192,116.168,148.828,665),('ib_send','2','8KB','64','True','1',114.503,0.25566,141.286,147.35,666),('ib_send','2','8KB','64','False','1',108.974,0.179024,106.456,141.848,667),('ib_send','2','8KB','64','True','2',112.895,0.161716,110.081,104.929,668),('ib_send','2','8KB','64','False','2',127.718,0.289424,106.498,144.613,669),('ib_send','2','8KB','64','True','4',126.501,0.208531,126.387,149.241,670),('ib_send','2','8KB','64','False','4',100.683,0.29143,112.864,144.585,671),('ib_send','2','16KB','64','True','1',117.496,0.0585797,131.769,110.304,672),('ib_send','2','16KB','64','False','1',109.974,0.148962,144.209,139.205,673),('ib_send','2','16KB','64','True','2',107.833,0.116944,135.066,137.31,674),('ib_send','2','16KB','64','False','2',118.474,0.128944,147.538,126.828,675),('ib_send','2','16KB','64','True','4',142.343,0.190035,113.77,134.967,676),('ib_send','2','16KB','64','False','4',124.958,0.140051,119.947,120.459,677),('ib_send','2','32KB','64','True','1',108.381,0.140326,109.526,109.986,678),('ib_send','2','32KB','64','False','1',135.224,0.153744,145.999,141.989,679),('ib_send','2','32KB','64','True','2',129.019,0.179351,143.981,118.644,680),('ib_send','2','32KB','64','False','2',109.835,0.19049,107.572,128.316,681),('ib_send','2','32KB','64','True','4',125.103,0.13303,125.541,120.889,682),('ib_send','2','32KB','64','False','4',127.158,0.261017,143.575,128.957,683),('ib_send','2','62KB','64','True','1',133.491,0.248192,116.089,115.891,684),('ib_send','2','62KB','64','False','1',140.946,0.079547,126.428,140.039,685),('ib_send','2','62KB','64','True','2',133.254,0.0316501,121.762,145.297,686),('ib_send','2','62KB','64','False','2',129.899,0.21992,147.319,115.141,687),('ib_send','2','62KB','64','True','4',124.712,0.288633,149.503,123.781,688),('ib_send','2','62KB','64','False','4',127.046,0.0937813,106.825,106.136,689),('ib_send','2','1MB','64','True','1',101.213,0.292261,130.076,122.605,690),('ib_send','2','1MB','64','False','1',123.628,0.292869,113.835,103.466,691),('ib_send','2','1MB','64','True','2',108.552,0.157066,111.564,118.567,692);
/*!40000 ALTER TABLE `verb_jN1exBz9ZN` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verb_k3HQ3KYTqB`
--

DROP TABLE IF EXISTS `verb_k3HQ3KYTqB`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verb_k3HQ3KYTqB` (
  `TYPE` varchar(255) DEFAULT NULL,
  `PORT` varchar(255) DEFAULT NULL,
  `SIZE` varchar(255) DEFAULT NULL,
  `CLASS` varchar(255) DEFAULT NULL,
  `BIDIRECTION` varchar(255) DEFAULT NULL,
  `QP` varchar(255) DEFAULT NULL,
  `BW(Gpbs)` float DEFAULT NULL,
  `Latency(usec)` float DEFAULT NULL,
  `avg_switch_in(Gbps)` float DEFAULT NULL,
  `avg_switch_out(Gbps)` float DEFAULT NULL,
  `log_id` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verb_k3HQ3KYTqB`
--

LOCK TABLES `verb_k3HQ3KYTqB` WRITE;
/*!40000 ALTER TABLE `verb_k3HQ3KYTqB` DISABLE KEYS */;
INSERT INTO `verb_k3HQ3KYTqB` VALUES ('ib_read','1','8KB','64','True','1',121.882,0.0480039,124.505,127.49,396),('ib_read','1','8KB','64','False','1',104.153,0.038607,113.428,126.929,397),('ib_read','1','8KB','64','True','2',113.355,0.167158,101.453,115.581,398),('ib_read','1','8KB','64','False','2',110.329,0.197957,122.156,135.916,399),('ib_read','1','8KB','64','True','4',129.769,0.211953,135.401,131.584,400),('ib_read','1','8KB','64','False','4',145.635,0.162055,111.375,125.282,401),('ib_read','1','16KB','64','True','1',149.916,0.227338,124.696,147.524,402),('ib_read','1','16KB','64','False','1',134.445,0.0336237,148.434,148.56,403),('ib_read','1','16KB','64','True','2',120.085,0.0154547,126.967,149.949,404),('ib_read','1','16KB','64','False','2',123.155,0.236467,137.091,127.599,405),('ib_read','1','16KB','64','True','4',141.266,0.0624195,149.514,112.151,406),('ib_read','1','16KB','64','False','4',132.366,0.196079,123.389,101.884,407),('ib_read','1','32KB','64','True','1',138.641,0.0560733,132.342,126.828,408),('ib_read','1','32KB','64','False','1',145.73,0.145682,128.079,133.778,409),('ib_read','1','32KB','64','True','2',106.707,0.0280673,123.144,119.593,410),('ib_read','1','32KB','64','False','2',133.129,0.0883529,125.062,100.806,411),('ib_read','1','32KB','64','True','4',136.302,0.0460578,108.641,126.082,412),('ib_read','1','32KB','64','False','4',105.966,0.223638,114.533,147.98,413),('ib_read','1','62KB','64','True','1',109.72,0.0966568,133.875,129.972,414),('ib_read','1','62KB','64','False','1',131.956,0.242331,146.867,128.533,415),('ib_read','1','62KB','64','True','2',117.004,0.160083,110.254,100.74,416),('ib_read','1','62KB','64','False','2',145.027,0.00112691,127.231,127.605,417),('ib_read','1','62KB','64','True','4',129.087,0.235192,104.52,125.766,418),('ib_read','1','62KB','64','False','4',141.361,0.18159,101.674,125.76,419),('ib_read','1','1MB','64','True','1',123.074,0.117401,135.495,102.959,420),('ib_read','1','1MB','64','False','1',117.89,0.0355829,122.418,109.167,421),('ib_read','1','1MB','64','True','2',104.182,0.165846,143.367,112.738,422),('ib_read','1','1MB','64','False','2',130.363,0.237306,138.767,112.743,423),('ib_read','1','1MB','64','True','4',129.195,0.10928,131.386,117.706,424),('ib_read','1','1MB','64','False','4',113.711,0.0851607,131.49,110.742,425),('ib_read','2','8KB','64','True','1',143.371,0.155445,101.405,148.187,426),('ib_read','2','8KB','64','False','1',103.444,0.270769,117.243,106.957,427),('ib_read','2','8KB','64','True','2',135.726,0.263405,121.835,136.861,428),('ib_read','2','8KB','64','False','2',113.499,0.248393,119.617,124.508,429),('ib_read','2','8KB','64','True','4',141.882,0.229928,141.832,113.918,430),('ib_read','2','8KB','64','False','4',128.039,0.157716,131.077,134.121,431),('ib_read','2','16KB','64','True','1',128.62,0.282679,144.77,103.983,432),('ib_read','2','16KB','64','False','1',107.833,0.175848,117.696,124.843,433),('ib_read','2','16KB','64','True','2',118.535,0.0354187,123.468,103.577,434),('ib_read','2','16KB','64','False','2',136.043,0.161253,142.281,141.813,435),('ib_read','2','16KB','64','True','4',108.314,0.162688,149.242,133.294,436),('ib_read','2','16KB','64','False','4',111.882,0.168362,128.341,148.64,437),('ib_read','2','32KB','64','True','1',138.892,0.250164,138.01,148.02,438),('ib_read','2','32KB','64','False','1',136.853,0.217516,140.911,105.078,439),('ib_read','2','32KB','64','True','2',107.231,0.135746,142.169,109.419,440),('ib_read','2','32KB','64','False','2',101.233,0.209147,149.12,121.44,441),('ib_read','2','32KB','64','True','4',122.634,0.0807839,105.431,116.023,442),('ib_read','2','32KB','64','False','4',120.688,0.0538118,116.727,130.409,443),('ib_read','2','62KB','64','True','1',136.907,0.0925934,129.825,129.776,444),('ib_read','2','62KB','64','False','1',107.651,0.120505,141.425,103.412,445),('ib_read','2','62KB','64','True','2',131.21,0.268872,118.564,140.445,446),('ib_read','2','62KB','64','False','2',102.991,0.0204417,145.48,117.791,447),('ib_read','2','62KB','64','True','4',107.156,0.100463,123.513,104.045,448),('ib_read','2','62KB','64','False','4',121.001,0.0828698,126.032,137.762,449),('ib_read','2','1MB','64','True','1',104.437,0.023173,102.199,149.123,450),('ib_read','2','1MB','64','False','1',107.306,0.00189013,103.812,131.791,451),('ib_read','2','1MB','64','True','2',119.369,0.0301389,109.035,149.841,452),('ib_read','2','1MB','64','False','2',119.726,0.0959768,113.876,146.62,453),('ib_read','2','1MB','64','True','4',128.31,0.234778,132.294,102.689,454),('ib_read','2','1MB','64','False','4',105.63,0.0339057,108.343,147.888,455),('ib_send','1','8KB','64','True','1',146.663,0.161785,104.409,109.472,456),('ib_send','1','8KB','64','False','1',124.403,0.223098,129.02,136.064,457),('ib_send','1','8KB','64','True','2',136.601,0.175783,132.711,130.333,458),('ib_send','1','8KB','64','False','2',106.541,0.265476,102.028,115.347,459),('ib_send','1','8KB','64','True','4',110.781,0.09771,101.323,104.596,460),('ib_send','1','8KB','64','False','4',139.731,0.0242697,127.569,105.877,461),('ib_send','1','16KB','64','True','1',132.475,0.0487887,107.404,135.423,462),('ib_send','1','16KB','64','False','1',134.964,0.151119,115.025,102.21,463),('ib_send','1','16KB','64','True','2',114.206,0.150246,124.53,126.382,464),('ib_send','1','16KB','64','False','2',121.276,0.0275747,135.95,146.468,465),('ib_send','1','16KB','64','True','4',124.635,0.249527,134.763,134.285,466),('ib_send','1','16KB','64','False','4',124.338,0.0988649,112.001,103.187,467),('ib_send','1','32KB','64','True','1',115.211,0.272579,123.446,122.807,468),('ib_send','1','32KB','64','False','1',128.528,0.25743,122.801,147.567,469),('ib_send','1','32KB','64','True','2',104.301,0.196738,140.211,123.447,470),('ib_send','1','32KB','64','False','2',114.775,0.0742717,104.74,129.516,471),('ib_send','1','32KB','64','True','4',107.008,0.291873,135.518,143.22,472),('ib_send','1','32KB','64','False','4',119.963,0.227234,147.166,133.862,473),('ib_send','1','62KB','64','True','1',100.018,0.0331686,125.304,123.021,474),('ib_send','1','62KB','64','False','1',102.522,0.0279267,132.236,112.893,475),('ib_send','1','62KB','64','True','2',100.428,0.13804,125.625,116.365,476),('ib_send','1','62KB','64','False','2',147.849,0.0121962,118.341,117.839,477),('ib_send','1','62KB','64','True','4',121.307,0.130311,123.643,149.949,478),('ib_send','1','62KB','64','False','4',147.438,0.116018,111.562,137.782,479),('ib_send','1','1MB','64','True','1',138.21,0.144852,126.757,134.593,480),('ib_send','1','1MB','64','False','1',138.239,0.204787,110.422,128.194,481),('ib_send','1','1MB','64','True','2',118.912,0.147509,130.024,140.391,482),('ib_send','1','1MB','64','False','2',103.122,0.0357477,147.729,142.388,483),('ib_send','1','1MB','64','True','4',120.028,0.271095,113.11,135.598,484),('ib_send','1','1MB','64','False','4',119.312,0.128875,127.096,140.548,485),('ib_send','2','8KB','64','True','1',118.796,0.172878,146.77,105.809,486),('ib_send','2','8KB','64','False','1',121.638,0.207818,138.724,116.789,487),('ib_send','2','8KB','64','True','2',135.615,0.246494,110.683,138.628,488),('ib_send','2','8KB','64','False','2',121.849,0.277525,121.961,102.721,489),('ib_send','2','8KB','64','True','4',101.352,0.219742,141.273,144.652,490),('ib_send','2','8KB','64','False','4',113.312,0.159218,140.247,103.717,491),('ib_send','2','16KB','64','True','1',143.149,0.230925,136.207,121.569,492),('ib_send','2','16KB','64','False','1',117.302,0.108695,128.188,121.624,493),('ib_send','2','16KB','64','True','2',126.616,0.176518,139.723,119.059,494),('ib_send','2','16KB','64','False','2',138.285,0.241107,143.506,113.414,495),('ib_send','2','16KB','64','True','4',121.459,0.227684,114.847,143.859,496),('ib_send','2','16KB','64','False','4',140.339,0.236258,126.282,100.717,497),('ib_send','2','32KB','64','True','1',107.481,0.117738,108.536,148.918,498),('ib_send','2','32KB','64','False','1',122.977,0.153227,134.54,121.662,499),('ib_send','2','32KB','64','True','2',119.781,0.264515,148.819,112.968,500),('ib_send','2','32KB','64','False','2',128.171,0.144306,108.721,101.413,501),('ib_send','2','32KB','64','True','4',123.785,0.173057,145.508,146.326,502),('ib_send','2','32KB','64','False','4',133.293,0.0999963,131.582,108.772,503),('ib_send','2','62KB','64','True','1',106.578,0.21788,130.239,110.712,504),('ib_send','2','62KB','64','False','1',134.375,0.0278502,145.854,149.847,505),('ib_send','2','62KB','64','True','2',105.773,0.165551,110.1,141.56,506),('ib_send','2','62KB','64','False','2',102.411,0.247921,113.176,135.248,507),('ib_send','2','62KB','64','True','4',138.513,0.246952,106.724,137.942,508),('ib_send','2','62KB','64','False','4',108.689,0.229707,121.965,130.094,509),('ib_send','2','1MB','64','True','1',102.931,0.124488,135.693,142.281,510),('ib_send','2','1MB','64','False','1',140.706,0.166439,117.465,113.961,511),('ib_send','2','1MB','64','True','2',106.824,0.139119,129.29,142.791,512),('ib_send','2','1MB','64','False','2',137.975,0.201371,103.548,133.549,513),('ib_send','2','1MB','64','True','4',118.331,0.0779808,112.643,103.11,514),('ib_send','2','1MB','64','False','4',127.545,0.276021,107.421,148.677,515),('ib_write','1','8KB','64','True','1',123.035,0.084796,114.47,138.087,516),('ib_write','1','8KB','64','False','1',146.985,0.254385,116.488,116.56,517),('ib_write','1','8KB','64','True','2',106.912,0.294801,144.793,113.675,518),('ib_write','1','8KB','64','False','2',120.044,0.0116229,143.893,114.966,519),('ib_write','1','8KB','64','True','4',146.499,0.109563,111.542,106.083,520),('ib_write','1','8KB','64','False','4',116.405,0.094235,106.958,107.221,521),('ib_write','1','16KB','64','True','1',129.92,0.0661847,125.359,137.231,522),('ib_write','1','16KB','64','False','1',120.147,0.221239,129.474,127.708,523),('ib_write','1','16KB','64','True','2',114.673,0.283483,141.406,100.535,524),('ib_write','1','16KB','64','False','2',128.467,0.176631,133.76,129.045,525),('ib_write','1','16KB','64','True','4',144.55,0.089428,116.217,132.159,526),('ib_write','1','16KB','64','False','4',136.103,0.270122,149.215,114.643,527),('ib_write','1','32KB','64','True','1',114.807,0.0154475,121.359,122.605,528),('ib_write','1','32KB','64','False','1',121.981,0.0341478,105.359,146.619,529),('ib_write','1','32KB','64','True','2',126.426,0.123873,135.595,148.028,530),('ib_write','1','32KB','64','False','2',134.855,0.245311,110.326,101.943,531),('ib_write','1','32KB','64','True','4',121.62,0.0613403,106.216,107.228,532),('ib_write','1','32KB','64','False','4',127.58,0.125943,128.463,134.612,533),('ib_write','1','62KB','64','True','1',144.146,0.238727,138.304,148.948,534),('ib_write','1','62KB','64','False','1',107.4,0.0535385,129.509,118.062,535),('ib_write','1','62KB','64','True','2',130.919,0.194948,128.751,101.521,536),('ib_write','1','62KB','64','False','2',148.966,0.14428,100.176,124.631,537),('ib_write','1','62KB','64','True','4',109.904,0.00460902,149.984,123.217,538),('ib_write','1','62KB','64','False','4',137.613,0.179445,109.251,125.468,539),('ib_write','1','1MB','64','True','1',107.911,0.136258,124.78,113.496,540),('ib_write','1','1MB','64','False','1',147.518,0.0307666,105.055,131.037,541),('ib_write','1','1MB','64','True','2',124.315,0.19132,138.609,117.701,542),('ib_write','1','1MB','64','False','2',133.48,0.125832,131.331,140.555,543),('ib_write','1','1MB','64','True','4',123.683,0.141991,101.595,139.567,544),('ib_write','1','1MB','64','False','4',135.137,0.280875,100.753,105.257,545),('ib_write','2','8KB','64','True','1',125.136,0.185119,144.443,119.137,546),('ib_write','2','8KB','64','False','1',117.749,0.230252,118.248,108.49,547),('ib_write','2','8KB','64','True','2',119.732,0.202028,113.889,118.546,548),('ib_write','2','8KB','64','False','2',117.363,0.138428,127.141,117.654,549),('ib_write','2','8KB','64','True','4',140.707,0.0400293,110.436,143.784,550),('ib_write','2','8KB','64','False','4',104.493,0.228816,121.448,136.327,551),('ib_write','2','16KB','64','True','1',149.492,0.248627,118.263,101.483,552),('ib_write','2','16KB','64','False','1',131.692,0.164128,107.511,132.183,553),('ib_write','2','16KB','64','True','2',149.629,0.0464654,129.077,131.308,554),('ib_write','2','16KB','64','False','2',113.823,0.205864,138.032,100.147,555),('ib_write','2','16KB','64','True','4',104.402,0.0283661,129.308,108.893,556),('ib_write','2','16KB','64','False','4',100.393,0.00802382,126.377,129.676,557),('ib_write','2','32KB','64','True','1',110.563,0.183135,134.653,105.605,558),('ib_write','2','32KB','64','False','1',117.694,0.0761363,146.649,134.399,559),('ib_write','2','32KB','64','True','2',142.609,0.122297,130.785,115.935,560),('ib_write','2','32KB','64','False','2',110.814,0.100811,105.797,119.593,561),('ib_write','2','32KB','64','True','4',140.248,0.00249817,140.287,128.318,562),('ib_write','2','32KB','64','False','4',110.757,0.292523,139.238,126.864,563),('ib_write','2','62KB','64','True','1',140.533,0.262088,123.382,149.506,564),('ib_write','2','62KB','64','False','1',107.186,0.115009,143.336,139.164,565),('ib_write','2','62KB','64','True','2',125.532,0.274843,112.367,147.627,566),('ib_write','2','62KB','64','False','2',114.006,0.127657,110.528,140.405,567),('ib_write','2','62KB','64','True','4',145.163,0.267167,141.63,131.352,568),('ib_write','2','62KB','64','False','4',123.34,0.176264,114.049,116.861,569),('ib_write','2','1MB','64','True','1',126.543,0.0128444,128,131.345,570),('ib_write','2','1MB','64','False','1',126.813,0.0732062,148.509,126.161,571),('ib_write','2','1MB','64','True','2',113.372,0.246506,121.753,146.285,572),('ib_write','2','1MB','64','False','2',135.14,0.0716705,137.48,149.68,573),('ib_write','2','1MB','64','True','4',145.954,0.190365,103.186,108.948,574),('ib_write','2','1MB','64','False','4',140.11,0.013356,113.799,119.54,575);
/*!40000 ALTER TABLE `verb_k3HQ3KYTqB` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-11-10  7:50:19
