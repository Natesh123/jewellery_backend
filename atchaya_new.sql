-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 26, 2025 at 09:57 PM
-- Server version: 8.0.42-0ubuntu0.20.04.1
-- PHP Version: 7.4.3-4ubuntu2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `atchaya_new`
--

-- --------------------------------------------------------

--
-- Table structure for table `account_head`
--

CREATE TABLE `account_head` (
  `id` int NOT NULL,
  `sub_cat_code` varchar(255) DEFAULT NULL,
  `cat_id` int DEFAULT NULL,
  `cat_code_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `account_head`
--

INSERT INTO `account_head` (`id`, `sub_cat_code`, `cat_id`, `cat_code_name`) VALUES
(1, 'GTA1001', 1, 'GTA1'),
(2, 'GTA1002', 1, 'GTA1'),
(3, 'GTA1003', 1, 'GTA1');

-- --------------------------------------------------------

--
-- Table structure for table `account_head_creation`
--

CREATE TABLE `account_head_creation` (
  `id` int NOT NULL,
  `group_name` varchar(225) NOT NULL,
  `group_code` varchar(255) NOT NULL,
  `head_name` varchar(255) NOT NULL,
  `address` longtext NOT NULL,
  `gst_no` varchar(255) NOT NULL,
  `phone_no` varchar(255) NOT NULL,
  `gst_type` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `state_code` varchar(255) NOT NULL,
  `crated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `account_code` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `account_head_creation`
--

INSERT INTO `account_head_creation` (`id`, `group_name`, `group_code`, `head_name`, `address`, `gst_no`, `phone_no`, `gst_type`, `state`, `state_code`, `crated_at`, `account_code`) VALUES
(1, 'Muthu Kumar', 'M01', 'Demo', '748a1\nGandhinagar', '1234', '7826027176', 'Regular', 'Tamil Nadu', 'Tamil Nadu', '2025-10-26 14:54:08', 'M010001'),
(2, 'Muthu Kumar', 'M01', 'Demo', '748a1\nGandhinagar', '1234', '7826027176', 'Regular', 'Tamil Nadu', 'Tamil Nadu', '2025-10-26 14:55:56', 'M010002'),
(3, 'Sankar1', 'S02', 'frgstg', 'Gandhinagar', '1234', '7826027176', 'Regular', 'TamilNadu', '33', '2025-10-26 16:02:48', 'S020001');

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `company_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `branch_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `branch_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `area` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `pincode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `district` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `state_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phoneno` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `financial_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `company_id`, `company_name`, `branch_name`, `branch_id`, `address1`, `address2`, `area`, `city`, `pincode`, `district`, `state`, `state_code`, `phoneno`, `email`, `created_at`, `updated_by`, `financial_id`) VALUES
(1, 12, 'Amaya Gold Point', 'SRIVILLIPUTHUR', 'AGSR-430', '139 NETHAJI ROAD', NULL, '.', 'SRIVILLIPUTHUR', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '9894547484', 'AMAYAGOLDPOINT@GMAIL.COM', '2025-07-10 15:01:07', 1, 1),
(5, 12, 'Amaya Gold Point', 'RAJAPALAYAM', 'AGRA-277', '.', '.', '.', 'RAJAPALAYAM', '626117', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '8489520724', 'AMAYAGOLDPOINT@GMAIL.COM', '2025-09-26 12:05:39', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `branch_documents`
--

CREATE TABLE `branch_documents` (
  `id` int NOT NULL,
  `branch_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `metal_id` int NOT NULL,
  `tax_type` enum('taxable','non-taxable') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `category_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `category_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cgst` decimal(5,2) DEFAULT '0.00',
  `sgst` decimal(5,2) DEFAULT '0.00',
  `igst` decimal(5,2) DEFAULT '0.00',
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
  `financial_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `metal_id`, `tax_type`, `category_name`, `category_code`, `cgst`, `sgst`, `igst`, `status`, `financial_id`, `created_at`, `created_by`, `updated_by`) VALUES
(1, 1, 'taxable', 'Gold Taxable Ornaments', 'GTA1', '1.50', '1.50', '3.00', 'active', 1, '2025-07-12 08:20:21', 1, 33);

-- --------------------------------------------------------

--
-- Table structure for table `collections`
--

CREATE TABLE `collections` (
  `id` int NOT NULL,
  `quotation_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `purchase_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `customer_id` int DEFAULT NULL,
  `customer_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `aadhar_no` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pan_no` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `total_amount` decimal(12,2) NOT NULL,
  `bill_copy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ornament_photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference_person` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `other_reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('pending_payment','completed','paid','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending_payment',
  `margin_percent` decimal(5,2) DEFAULT '3.00',
  `payment_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `barcode_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qr_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `qr_code_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bill_pdf_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_by` int NOT NULL,
  `updated_by` int NOT NULL,
  `financial_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_capture` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bref_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tenant_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `issrcc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `collections`
--

INSERT INTO `collections` (`id`, `quotation_id`, `purchase_id`, `customer_id`, `customer_name`, `aadhar_no`, `pan_no`, `products`, `total_amount`, `bill_copy`, `ornament_photo`, `reference`, `reference_person`, `other_reference`, `remarks`, `status`, `margin_percent`, `payment_method`, `barcode`, `barcode_path`, `qr_data`, `qr_code_path`, `bill_pdf_path`, `created_by`, `updated_by`, `financial_id`, `created_at`, `user_capture`, `bref_no`, `tenant_type`, `issrcc`) VALUES
(1, 'QT25099913', 'PUR25095098', NULL, 'Raj', '123456789101', 'aaaaa23456', '[{\"key\":\"ab58e819-4f53-4b3a-aee5-61c1788561a4\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":16.5,\"dust_weight\":0.23,\"stone_weight\":0.45,\"net_weight\":15.82,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.4746,\"final_weight\":15.3454,\"rate\":10124.89,\"amount\":155370.48700599998}]', '155370.49', NULL, NULL, 'sales_executive', NULL, NULL, 's', 'completed', '3.00', 'partial_cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-26 12:33:46', NULL, 'BREF8699753', 'D', 'D'),
(2, NULL, 'PUR25097343', 10, 'Raj', '123456789101', 'aaaaa23456', '[{\"key\":\"ab58e819-4f53-4b3a-aee5-61c1788561a4\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":16.5,\"dust_weight\":0.23,\"stone_weight\":0.45,\"net_weight\":15.82,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.4746,\"final_weight\":15.3454,\"rate\":10124.89,\"amount\":155370.48700599998}]', '155370.49', NULL, NULL, 'sales_executive', NULL, 'sales_executive', 's', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-27 13:49:57', NULL, 'BREF3362649', 'D', 'D'),
(3, NULL, 'PUR25094759', 10, 'Raj', '123456789101', 'aaaaa23456', '[{\"key\":\"ab58e819-4f53-4b3a-aee5-61c1788561a4\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":16.5,\"dust_weight\":0.23,\"stone_weight\":0.45,\"net_weight\":15.82,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.4746,\"final_weight\":15.3454,\"rate\":10124.89,\"amount\":155370.48700599998}]', '155370.49', NULL, NULL, 'sales_executive', NULL, 'sales_executive', 's', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-28 09:15:55', NULL, 'BREF0091971', 'D', 'D'),
(4, 'QT967339266', 'PUR25095943', NULL, 'Raj', '123456789101', 'aaaaa23456', '[{\"key\":\"31043ed3-c48f-4f67-8970-9e82a28ef2cb\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":6,\"dust_weight\":0.1,\"stone_weight\":0.2,\"net_weight\":5.7,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.171,\"final_weight\":5.529,\"rate\":10124.89,\"amount\":55980.516809999994}]', '55980.52', NULL, NULL, 'advertisement', NULL, NULL, 'new qouatation', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-28 09:16:41', NULL, 'BREF4295181', 'D', 'D'),
(5, 'QT25093140', 'PUR25095858', NULL, 'kirupa', '233552468965', 'aaaaa12345', '[{\"key\":\"38489491-fa29-49bc-b720-f6a3a79b8469\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":10124.89,\"amount\":147022.515201}]', '147022.52', NULL, '/uploads/purchases/temp/ornament-1759226989611.jpg', 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-30 10:09:49', '/uploads/purchases/temp/LiveCapture-1759226989611.jpg', 'BREF6725681', 'D', 'D'),
(6, 'QT25099503', 'PUR25092693', NULL, 'kirupa', '233552468965', 'aaaaa12345', '[{\"key\":\"7e1f65aa-028f-4b8c-9892-141adf9ba97a\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":10124.89,\"amount\":147022.515201}]', '147022.52', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-30 10:39:11', NULL, 'BREF6835607', 'D', 'D'),
(7, 'QT25099880', 'PUR25098752', NULL, 'kirupa', '233552468965', 'aaaaa12345', '[{\"key\":\"e03bc54b-7973-482b-b69c-4e437442154b\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":10124.89,\"amount\":147022.515201}]', '147022.52', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-30 10:55:48', NULL, 'BREF6606733', 'D', 'D'),
(8, 'QT25093164', 'PUR25098242', NULL, 'darsni', '233552468965', 'aaaaa12345', '[{\"key\":\"6273e988-e190-4f0b-aa7a-c6c71626f0c3\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":16,\"dust_weight\":0.06,\"stone_weight\":0,\"net_weight\":15.94,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.4782,\"final_weight\":15.4618,\"rate\":10124.89,\"amount\":156549.024202}]', '156549.02', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 32, 32, 1, '2025-09-30 11:13:50', NULL, 'BREF1723681', 'D', 'D'),
(9, 'QT25099329', 'PUR25094360', NULL, 'raja', '123456789011', 'Abcde12345', '[{\"key\":\"539add26-7abf-4ca8-a20a-a34866f40e55\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":12,\"dust_weight\":0.35,\"stone_weight\":0.15,\"net_weight\":11.5,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.345,\"final_weight\":11.155,\"rate\":10124.89,\"amount\":112943.14794999998}]', '112943.15', NULL, NULL, 'RAJ', NULL, 'RAJ', 'D', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-30 11:27:03', '/uploads/purchases/temp/LiveCapture-1759231623478.jpg', 'BREF1114532', 'D', 'D'),
(10, 'QT25091253', 'PUR25098845', NULL, 'darsni', '233552468965', 'aaaaa12345', '[{\"key\":\"9fd4249d-a7c0-406c-ac0c-3a45eeee1b39\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":13.6,\"dust_weight\":0.36,\"stone_weight\":0,\"net_weight\":13.24,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.3972,\"final_weight\":12.8428,\"rate\":10124.89,\"amount\":130031.937292},{\"key\":\"d78b2e4f-c04a-4b99-a74a-12cac8c113b8\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":1.76,\"dust_weight\":0.16,\"stone_weight\":0,\"net_weight\":1.6,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.04800000000000001,\"final_weight\":1.552,\"rate\":10124.89,\"amount\":15713.82928}]', '145745.77', NULL, NULL, 'sales_executive', NULL, NULL, '.', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-30 11:33:09', NULL, 'BREF8586451', 'D', 'D'),
(11, 'QT25092021', 'PUR25092371', NULL, 'Raj', '123456789101', 'aaaaa23456', '[{\"key\":\"1a8985c4-a195-422d-b955-b64ab9d69c83\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24,\"dust_weight\":0.3,\"stone_weight\":0.06,\"net_weight\":23.64,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.7092,\"final_weight\":22.9308,\"rate\":10124.89,\"amount\":232171.827612}]', '232171.83', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-30 11:40:33', NULL, 'BREF3343420', 'D', 'D'),
(12, 'QTRA009803', 'PUR25107107', NULL, 'sample', '987654321987', 'AFZPK7190K', '[{\"key\":\"b75756de-b27c-42d6-bf97-2d944953cd15\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":5,\"dust_weight\":0.1,\"stone_weight\":0.1,\"net_weight\":4.800000000000001,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.14400000000000002,\"final_weight\":4.656000000000001,\"rate\":12013.13,\"amount\":55933.13328}]', '55933.13', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 45, 45, 1, '2025-10-01 10:53:03', NULL, 'BREF1572791', 'D', 'D'),
(13, 'QTRA007970', 'PUR25109967', NULL, 'sample', '987654321987', 'AFZPK7190K', '[{\"key\":\"6e56eb72-2506-4460-9ad3-27f048440524\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":4,\"dust_weight\":0.1,\"stone_weight\":0.1,\"net_weight\":3.8,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.11399999999999999,\"final_weight\":3.686,\"rate\":12013.13,\"amount\":44280.39718}]', '44280.40', NULL, NULL, 'advertisement', NULL, NULL, 'test', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 45, 45, 1, '2025-10-01 11:31:10', NULL, 'BREF9544252', 'D', 'D'),
(14, 'QTSR009171', 'PUR25105960', NULL, 'kajo', '233552468965', 'aaaaa12345', '[{\"key\":\"b4631c3e-b834-4148-ba63-847493db50da\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":12013.13,\"amount\":174441.459417}]', '174441.46', NULL, NULL, 'manager', NULL, NULL, 'gfg', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-10-01 11:55:00', NULL, 'BREF8831302', 'D', 'D'),
(15, 'QTSR008437', 'PUR25101710', NULL, 'mari', '233759697894', 'BGGPV2379J', '[{\"key\":\"7912d7cc-96b5-4646-92ff-8cf071084c03\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":12013.13,\"amount\":174441.459417}]', '174441.46', NULL, NULL, 'sales_executive', NULL, NULL, '.', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-10-01 12:33:10', NULL, 'BREF0361327', 'D', 'D'),
(16, 'QT25093691', 'PUR25106681', NULL, 'hari', '123456789101', 'aaaaa23456', '[{\"key\":\"29e245b8-dae9-4733-ba9f-64bd44fd51b1\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":10,\"dust_weight\":0.23,\"stone_weight\":0,\"net_weight\":9.77,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.29309999999999997,\"final_weight\":9.476899999999999,\"rate\":10124.89,\"amount\":95952.57004099998}]', '95952.57', NULL, NULL, 'sales_executive', NULL, NULL, '2', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-10-01 12:34:45', NULL, 'BREF1291670', 'D', 'D'),
(17, 'QTSR004983', 'PUR25104342', NULL, 'test1', '233552468965', 'aaaaa12345', '[{\"key\":\"a560b3d9-ea21-4c41-9565-06b15d6885c4\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24.02,\"dust_weight\":0.48,\"stone_weight\":0.1,\"net_weight\":23.439999999999998,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.7031999999999999,\"final_weight\":22.7368,\"rate\":12013.13,\"amount\":273140.13418399997}]', '273140.13', NULL, NULL, 'manager', NULL, NULL, 'yfty', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 32, 32, 1, '2025-10-02 05:47:31', NULL, 'BREF0252469', 'D', 'D'),
(18, 'QTSR002194', 'PUR25104195', NULL, 'test123', '233552468965', 'BGGPV2379J', '[{\"key\":\"aa2a0fe0-bd1b-4507-9178-f1b5b23a69a1\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":5,\"dust_weight\":0.1,\"stone_weight\":0.3,\"net_weight\":4.6000000000000005,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.138,\"final_weight\":4.462000000000001,\"rate\":12013.13,\"amount\":53602.58606}]', '53602.59', NULL, '/uploads/purchases/temp/ornament-1759407947194.jpg', 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-10-02 12:25:47', '/uploads/purchases/temp/LiveCapture-1759407947195.jpg', 'BREF9890395', 'D', 'D');

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int NOT NULL,
  `company_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `company_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `gst_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `area` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `pincode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `district` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `state_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phoneno` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `turnover` enum('above_5_crore','below_5_crore','below_1_crore') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `financial_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `company_name`, `company_code`, `gst_no`, `address1`, `address2`, `area`, `city`, `pincode`, `district`, `state`, `state_code`, `phoneno`, `email`, `turnover`, `created_at`, `updated_by`, `financial_id`) VALUES
(12, 'Amaya Gold Point', 'AG000001', '33ACHFA7580N1ZY', '139 NETHAJI ROAD', NULL, '.', 'SRIVILLIPUTHUR', '626117', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '9003343490', 'AMAYAGOLDPOINT@GMAIL.COM', 'below_5_crore', '2025-07-10 13:33:24', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `company_documents`
--

CREATE TABLE `company_documents` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_documents`
--

INSERT INTO `company_documents` (`id`, `company_id`, `name`, `url`, `created_at`) VALUES
(17, 12, 'WhatsApp Image 2025-07-07 at 8.54.02 PM.jpeg', '/uploads/companies/12/1752154404751-WhatsApp Image 2025-07-07 at 8.54.02 PM.jpeg', '2025-09-26 12:02:44');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int NOT NULL,
  `customer_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `customer_photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `aadhar_no` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `aadhar_verified` tinyint(1) DEFAULT '0',
  `aadhar_photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `aadhar_otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `pan_no` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pan_photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address_1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address_2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `area` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `pincode` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `district` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `state_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phoneno` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phoneno2` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `office_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `reference_details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `has_bank_account` tinyint(1) DEFAULT '0',
  `financial_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `customer_id`, `customer_name`, `customer_photo`, `aadhar_no`, `aadhar_verified`, `aadhar_photo`, `aadhar_otp`, `otp_expiry`, `pan_no`, `pan_photo`, `address_1`, `address_2`, `area`, `city`, `pincode`, `district`, `state`, `state_code`, `phoneno`, `phoneno2`, `office_address`, `reference_details`, `remarks`, `has_bank_account`, `financial_id`, `created_by`, `updated_by`, `created_at`) VALUES
(7, 'R41', 'Raj', '/uploads/customers/7/customer-1758889653662-amaya logo.jpg', '123456789101', 0, NULL, NULL, NULL, 'aaaaa23456', NULL, 'south street', NULL, '.', 'SRIVILLIPUTHUR', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '1554545555', 'undefined', 'sss', 'Manager', '.', 1, 1, 1, 1, '2025-09-26 12:27:33'),
(8, 'S41', 'shar', NULL, '123456789101', 0, NULL, NULL, NULL, 'aaaaa23456', NULL, 'south street', NULL, '.', 'SRIVILLIPUTHUR', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '9894547484', 'undefined', NULL, 'Manager', '.', 1, 1, 1, 1, '2025-09-26 12:56:43'),
(9, 'H40', 'hari', NULL, '123456789101', 0, NULL, NULL, NULL, 'aaaaa23456', NULL, 'south street', NULL, '.', 'SRIVILLIPUTHUR', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '9894547484', '9894547484', 'south street', 'Manager', NULL, 1, 1, 1, 1, '2025-09-26 13:14:52'),
(10, 'R38', 'Raj', NULL, '123456789101', 0, NULL, NULL, NULL, 'aaaaa23456', NULL, 'south street', NULL, '.', 'SRIVILLIPUTHUR', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '9894547484', '9894547484', 'south street', 'Manager', NULL, 1, 1, 1, 1, '2025-09-27 06:36:31'),
(11, 'B95', 'BALA', NULL, '123456789101', 0, NULL, NULL, NULL, 'aaaaa23456', NULL, 'south street', NULL, '.', 'SRIVILLIPUTHUR', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '9894547484', 'undefined', 'south street', 'Manager', NULL, 1, 1, 1, 1, '2025-09-27 06:48:30'),
(12, 'R69', 'Raj', NULL, '123456789101', 0, NULL, NULL, NULL, 'aaaaa23456', NULL, 'south street', NULL, '.', 'SRIVILLIPUTHUR', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '9894547484', '9894547484', NULL, 'Manager', '.', 0, 1, 1, 1, '2025-09-30 06:20:49'),
(13, 'R69', 'Raj', NULL, '123456789101', 0, NULL, NULL, NULL, 'aaaaa23456', NULL, 'south street', NULL, '.', 'SRIVILLIPUTHUR', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '9894547484', '9894547484', NULL, 'Manager', NULL, 1, 1, 1, 1, '2025-09-30 06:23:25'),
(14, 'K33', 'kirupa', NULL, '233552468965', 0, NULL, NULL, NULL, 'aaaaa12345', NULL, 'south street', NULL, '.', 'SRIVILLIPUTHUR', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '8524838698', 'undefined', 'office street', 'Manager', NULL, 1, 1, 31, 31, '2025-09-30 09:56:43'),
(15, 'D32', 'darsni', NULL, '233552468965', 0, NULL, NULL, NULL, 'aaaaa12345', NULL, 'south street', NULL, '.', 'SRIVILLIPUTHUR', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '8489520724', 'undefined', NULL, 'Manager', NULL, 1, 1, 32, 33, '2025-09-30 11:02:43'),
(16, 'R75', 'raja', NULL, '123456789011', 0, NULL, NULL, NULL, 'Abcde12345', NULL, '15 New Street', NULL, '.', 'Rajapalayam', '626117', 'Virudhunagar Dist', 'Tamil Nadu', 'TN', '9788545456', 'undefined', NULL, 'Rajkumar  - 92225556', NULL, 1, 1, 44, 44, '2025-09-30 11:12:18'),
(17, 'P10', 'Pandikani', NULL, '897654321567', 0, NULL, NULL, NULL, '9876543214', NULL, 'dfghjkl', 'xmdfghjkl', 'vbnm,.', 'Rajapalayam', '626611', 'Virudhunager', 'Tamil Nadu', 'TN', '8778874778', '8778874776', 'dfghjkl', 'rtyujkl', 'dfghjk', 1, 1, 1, 1, '2025-10-01 07:03:49'),
(18, 'S99', 'sample', NULL, '987654321987', 0, NULL, NULL, NULL, 'AFZPK7190K', NULL, 'rjp', NULL, 'rjpm', 'rjpm', '626117', 'vnr', 'Tamil Nadu', 'TN', '9788545456', 'undefined', 'rjpm', NULL, 'test', 1, 1, 45, 45, '2025-10-01 10:48:52'),
(19, 'T24', 'test4', NULL, '233552468965', 0, NULL, NULL, NULL, '9876543434', NULL, 'hGSKK', 'SJHHFJ', 'HJEHJF', 'Srivi', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '8489520724', 'undefined', 'defdfdfd', 'defdfd', 'dfddaf', 1, 1, 31, 31, '2025-10-01 11:27:30'),
(20, 'K77', 'kajo', NULL, '233552468965', 0, NULL, NULL, NULL, 'aaaaa12345', NULL, 'south street', NULL, '.', 'SRIVILLIPUTHUR', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '8489520724', 'undefined', 'south street', 'Manager', '.', 1, 1, 31, 31, '2025-10-01 11:49:30'),
(21, 'M89', 'mari', NULL, '233759697894', 0, NULL, NULL, NULL, 'BGGPV2379J', NULL, 'south street', NULL, 'KANSAI', 'SRIVILLIPUTHUR', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '8489520724', 'undefined', 'south street', 'Manager', '.', 0, 1, 31, 31, '2025-10-01 12:23:53'),
(22, 'T18', 'test1', NULL, '233552468965', 0, NULL, NULL, NULL, 'aaaaa12345', NULL, 'south street', 'SJHHFJ', '.', 'SRIVILLIPUTHUR', '626125', 'VIRUDHUNAGAR DIST', 'Tamil Nadu', 'TN', '8489520724', '8489520724', NULL, 'Manager', NULL, 1, 1, 32, 32, '2025-10-02 05:36:55'),
(23, 'T13', 'test123', NULL, '233552468965', 0, NULL, NULL, NULL, 'BGGPV2379J', NULL, 'srivi', NULL, 'srivi', 'srivi', '626117', 'vnr', 'Tamil Nadu', 'TN', '9876543210', 'undefined', 'srivi', NULL, NULL, 1, 1, 31, 31, '2025-10-02 12:21:17');

-- --------------------------------------------------------

--
-- Table structure for table `customer_bank_accounts`
--

CREATE TABLE `customer_bank_accounts` (
  `id` int NOT NULL,
  `customer_id` int NOT NULL,
  `bank_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `account_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ifsc_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `branch_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `account_type` enum('Savings','Current','Fixed Deposit','Recurring Deposit') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_by` int NOT NULL,
  `updated_by` int NOT NULL,
  `financial_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customer_bank_accounts`
--

INSERT INTO `customer_bank_accounts` (`id`, `customer_id`, `bank_name`, `account_number`, `ifsc_code`, `branch_name`, `account_type`, `is_primary`, `documents`, `created_by`, `updated_by`, `financial_id`, `created_at`) VALUES
(1, 3, 'State Bank of India', '0987654345678', 'ABCD0123456', 'RJPM', 'Savings', 1, '[{\"name\":\"WhatsApp Image 2025-07-07 at 8.54.02 PM.jpeg\",\"type\":\"image/jpeg\",\"url\":\"/uploads/bank-accounts/3/doc-1752391433038-0-WhatsApp Image 2025-07-07 at 8.54.02 PM.jpeg\"}]', 1, 1, 1, '2025-07-13 07:23:53'),
(2, 4, 'State Bank of India', '098765432345', 'ABCD0123456', 'Srivi', 'Savings', 0, '[{\"name\":\"WhatsApp Image 2025-07-07 at 8.54.02 PM.jpeg\",\"type\":\"image/jpeg\",\"url\":\"/uploads/bank-accounts/4/doc-1753595635375-0-WhatsApp Image 2025-07-07 at 8.54.02 PM.jpeg\"}]', 1, 1, 1, '2025-07-27 05:53:55'),
(3, 4, 'HDFC Bank', '9876541234', 'ABCD012345F', 'srivi', 'Savings', 1, '[{\"name\":\"WhatsApp Image 2025-07-30 at 9.51.49 PM.jpeg\",\"type\":\"image/jpeg\",\"url\":\"/uploads/bank-accounts/4/doc-1754120668091-0-WhatsApp Image 2025-07-30 at 9.51.49 PM.jpeg\"},{\"name\":\"WhatsApp Image 2025-07-30 at 9.52.45 PM.jpeg\",\"type\":\"image/jpeg\",\"url\":\"/uploads/bank-accounts/4/doc-1754120668091-1-WhatsApp Image 2025-07-30 at 9.52.45 PM.jpeg\"}]', 10, 10, 1, '2025-08-02 07:44:28'),
(4, 7, 'HDFC Bank', '5125152200000', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Savings', 1, '[]', 1, 1, 1, '2025-09-26 12:28:52'),
(5, 8, 'State Bank of India', '5125152200000', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Savings', 1, '[]', 1, 1, 1, '2025-09-26 12:58:55'),
(6, 9, 'ICICI Bank', '5125152200000', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Savings', 1, '[]', 1, 1, 1, '2025-09-26 13:16:28'),
(7, 10, 'State Bank of India', '5125152200000', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Current', 1, '[]', 1, 1, 1, '2025-09-27 06:37:50'),
(8, 11, 'State Bank of India', '5125152200000', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Savings', 1, '[]', 1, 1, 1, '2025-09-27 06:48:55'),
(9, 13, 'State Bank of India', '5125152200000', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Savings', 1, '[]', 1, 1, 1, '2025-09-30 06:24:58'),
(10, 13, 'State Bank of India', '5125152200000', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Savings', 0, '[]', 1, 1, 1, '2025-09-30 06:25:57'),
(11, 14, 'State Bank of India', '235644556', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Savings', 0, '[]', 31, 31, 1, '2025-09-30 09:59:48'),
(13, 14, 'State Bank of India', '5125152200000', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Savings', 0, '[]', 31, 31, 1, '2025-09-30 10:58:52'),
(14, 15, 'HDFC Bank', '123456789', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Savings', 1, '[]', 32, 32, 1, '2025-09-30 11:05:45'),
(15, 16, 'HDFC Bank', '111222325456', 'HDFC0000775', 'rajapalauyam', 'Savings', 1, '[]', 44, 44, 1, '2025-09-30 11:13:55'),
(16, 15, 'State Bank of India', '1234567898', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Savings', 0, '[]', 33, 33, 1, '2025-10-01 08:20:48'),
(17, 18, 'HDFC Bank', '111222325456', 'HDFC0077555', 'rajapalauyam', 'Savings', 1, '[]', 45, 45, 1, '2025-10-01 10:49:56'),
(18, 20, 'State Bank of India', '5125152200000', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Savings', 1, '[]', 31, 31, 1, '2025-10-01 11:50:08'),
(19, 22, 'ICICI Bank', '1234567898', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Savings', 1, '[]', 32, 32, 1, '2025-10-02 05:38:48'),
(20, 23, 'HDFC Bank', '5125152200000', 'HDFC0000775', 'SRIVILLIPUTHUR', 'Savings', 1, '[]', 31, 31, 1, '2025-10-02 12:21:51');

-- --------------------------------------------------------

--
-- Table structure for table `financial_years`
--

CREATE TABLE `financial_years` (
  `id` bigint UNSIGNED NOT NULL,
  `starting_year_month` datetime NOT NULL,
  `ending_year_month` datetime NOT NULL,
  `financial_year_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `financial_years`
--

INSERT INTO `financial_years` (`id`, `starting_year_month`, `ending_year_month`, `financial_year_code`, `is_active`, `created_at`) VALUES
(1, '2025-04-01 00:00:00', '2026-03-31 23:59:59', '25-26', 1, '2025-07-10 07:51:04');

-- --------------------------------------------------------

--
-- Table structure for table `master_grouping`
--

CREATE TABLE `master_grouping` (
  `id` int NOT NULL,
  `group_name` varchar(225) NOT NULL,
  `group_code` varchar(255) NOT NULL,
  `group_type` varchar(255) NOT NULL,
  `major_group` varchar(255) DEFAULT NULL,
  `major_group_code` varchar(255) DEFAULT NULL,
  `group_items` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `master_grouping`
--

INSERT INTO `master_grouping` (`id`, `group_name`, `group_code`, `group_type`, `major_group`, `major_group_code`, `group_items`, `created_at`) VALUES
(1, 'Sankar', 'S01', 'major', NULL, NULL, 'Liabilities, Income, Expenditure, Asset', '2025-10-26 07:35:42'),
(2, 'Sankar1', 'S02', 'major', NULL, NULL, 'Liabilities, Income, Expenditure, Asset', '2025-10-26 07:38:07'),
(3, 'Muthu Kumar', 'M01', 'sub', 'Sankar1', 'S02', 'Asset, Liabilities, Income, Expenditure', '2025-10-26 07:48:05');

-- --------------------------------------------------------

--
-- Table structure for table `mcx_rates`
--

CREATE TABLE `mcx_rates` (
  `id` int NOT NULL,
  `metal` varchar(225) NOT NULL,
  `origin_price` decimal(25,3) NOT NULL,
  `rate` double(25,3) NOT NULL,
  `sub_amt` decimal(25,3) NOT NULL,
  `date` varchar(255) NOT NULL,
  `metal_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `mcx_rates`
--

INSERT INTO `mcx_rates` (`id`, `metal`, `origin_price`, `rate`, `sub_amt`, `date`, `metal_name`) VALUES
(3, '1', '10127.810', 10127.810, '100.000', '2025-08-19', 'Gold'),
(4, '1', '9283.830', 9183.830, '100.000', '2025-08-20', 'Gold'),
(5, '1', '9427.270', 9427.270, '0.000', '2025-08-23', 'Gold'),
(6, '1', '9325.540', 9325.540, '0.000', '2025-08-24', 'Gold'),
(7, '1', '9419.730', 9419.730, '0.000', '2025-08-25', 'Gold'),
(8, '1', '9588.290', 9488.290, '100.000', '2025-08-29', 'Gold'),
(9, '1', '9741.040', 9741.040, '0.000', '2025-08-30', 'Gold'),
(10, '1', '9846.820', 9846.820, '0.000', '2025-09-02', 'Gold'),
(11, '1', '9944.500', 9944.500, '0.000', '2025-09-03', 'Gold'),
(12, '1', '9974.450', 9974.450, '0.000', '2025-09-04', 'Gold'),
(13, '1', '10124.890', 10124.890, '100.000', '2025-09-06', 'Gold'),
(14, '1', '12013.130', 12013.130, '0.000', '2025-10-01', 'Gold');

-- --------------------------------------------------------

--
-- Table structure for table `melt`
--

CREATE TABLE `melt` (
  `id` int NOT NULL,
  `metal` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `product` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `sub_product` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `product_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `weight` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `purchases` longtext,
  `melt_weight` varchar(255) DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assign_customer` int DEFAULT '0',
  `assigned_at` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `melt`
--

INSERT INTO `melt` (`id`, `metal`, `product`, `sub_product`, `product_type`, `weight`, `purchases`, `melt_weight`, `status`, `created_at`, `assign_customer`, `assigned_at`) VALUES
(7, NULL, NULL, NULL, NULL, '39.000', '[{\"key\":\"e03bc54b-7973-482b-b69c-4e437442154b\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":10124.89,\"amount\":147022.515201,\"purchase_record_id\":2,\"purchase_id\":\"PUR25098752\",\"customer_name\":\"kirupa\",\"uniqueKey\":\"2-0\"},{\"key\":\"1a8985c4-a195-422d-b955-b64ab9d69c83\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24,\"dust_weight\":0.3,\"stone_weight\":0.06,\"net_weight\":23.64,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.7092,\"final_weight\":22.9308,\"rate\":10124.89,\"amount\":232171.827612,\"purchase_record_id\":1,\"purchase_id\":\"PUR25092371\",\"customer_name\":\"Raj\",\"uniqueKey\":\"1-0\"}]', NULL, 0, '2025-10-25 19:21:42', 0, NULL),
(8, '1', '1', 'chainn', '24k', '22.9308', '[{\"key\":\"1a8985c4-a195-422d-b955-b64ab9d69c87\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24,\"dust_weight\":0.3,\"stone_weight\":0.06,\"net_weight\":23.64,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.7092,\"final_weight\":22.9308,\"rate\":10124.89,\"amount\":232171.827612,\"purchase_record_id\":1,\"purchase_id\":\"PUR25092371\",\"customer_name\":\"Raj\",\"uniqueKey\":\"1-1\"}]', NULL, 1, '2025-10-25 19:21:42', 14, '2025-10-25T19:59:44.370Z'),
(9, NULL, NULL, NULL, NULL, '24.000', '[{\"key\":\"1a8985c4-a195-422d-b955-b64ab9d69c87\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24,\"dust_weight\":0.3,\"stone_weight\":0.06,\"net_weight\":23.64,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.7092,\"final_weight\":22.9308,\"rate\":10124.89,\"amount\":232171.827612,\"purchase_record_id\":1,\"purchase_id\":\"PUR25092371\",\"customer_name\":\"Raj\",\"uniqueKey\":\"1-1\"}]', NULL, 0, '2025-10-25 19:21:42', 0, NULL),
(10, '1', '1', 'chainn', '22k', '22.9308', '[{\"key\":\"1a8985c4-a195-422d-b955-b64ab9d69c83\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24,\"dust_weight\":0.3,\"stone_weight\":0.06,\"net_weight\":23.64,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.7092,\"final_weight\":22.9308,\"rate\":10124.89,\"amount\":232171.827612,\"purchase_record_id\":1,\"purchase_id\":\"PUR25092371\",\"customer_name\":\"Raj\",\"uniqueKey\":\"1-0\"}]', NULL, 1, '2025-10-25 19:21:42', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `melting_purchase`
--

CREATE TABLE `melting_purchase` (
  `id` int NOT NULL,
  `quotation_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `purchase_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `customer_id` int DEFAULT NULL,
  `customer_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `aadhar_no` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pan_no` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `total_amount` decimal(12,2) NOT NULL,
  `bill_copy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ornament_photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference_person` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `other_reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('pending_payment','completed','paid','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending_payment',
  `margin_percent` decimal(5,2) DEFAULT '3.00',
  `payment_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `barcode_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qr_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `qr_code_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bill_pdf_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_by` int NOT NULL,
  `updated_by` int NOT NULL,
  `financial_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_capture` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bref_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_details` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pledge_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `regional_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `accounts_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `company_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `branch_id` varchar(255) DEFAULT NULL,
  `collected_status` varchar(255) DEFAULT NULL,
  `accounts_id` varchar(255) DEFAULT NULL,
  `collect_accounts_status` int NOT NULL DEFAULT '0',
  `melting_status` int NOT NULL DEFAULT '0',
  `melting_products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `copper_percentage` varchar(255) DEFAULT NULL,
  `total_calculated_weight` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `purity_type` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `melting_purchase`
--

INSERT INTO `melting_purchase` (`id`, `quotation_id`, `purchase_id`, `customer_id`, `customer_name`, `aadhar_no`, `pan_no`, `products`, `total_amount`, `bill_copy`, `ornament_photo`, `reference`, `reference_person`, `other_reference`, `remarks`, `status`, `margin_percent`, `payment_method`, `barcode`, `barcode_path`, `qr_data`, `qr_code_path`, `bill_pdf_path`, `created_by`, `updated_by`, `financial_id`, `created_at`, `user_capture`, `bref_no`, `payment_details`, `pledge_status`, `regional_status`, `accounts_status`, `company_code`, `branch_id`, `collected_status`, `accounts_id`, `collect_accounts_status`, `melting_status`, `melting_products`, `copper_percentage`, `total_calculated_weight`, `purity_type`) VALUES
(1, 'QT25092021', 'PUR25092371', NULL, 'Raj', '123456789101', 'aaaaa23456', '[{\"key\":\"1a8985c4-a195-422d-b955-b64ab9d69c83\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24,\"dust_weight\":0.3,\"stone_weight\":0.06,\"net_weight\":23.64,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.7092,\"final_weight\":22.9308,\"rate\":10124.89,\"amount\":232171.827612},{\"key\":\"1a8985c4-a195-422d-b955-b64ab9d69c87\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24,\"dust_weight\":0.3,\"stone_weight\":0.06,\"net_weight\":23.64,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.7092,\"final_weight\":22.9308,\"rate\":10124.89,\"amount\":232171.827612}]', '232171.83', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-10-18 15:33:25', NULL, 'BREF11', '\"Full\"', '0', '1', NULL, 'AG000001', '1', '1', '1', 1, 1, NULL, NULL, NULL, NULL),
(2, 'QT25099880', 'PUR25098752', NULL, 'kirupa', '233552468965', 'aaaaa12345', '[{\"key\":\"e03bc54b-7973-482b-b69c-4e437442154b\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":10124.89,\"amount\":147022.515201}]', '147022.52', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-10-18 15:44:36', NULL, 'BREF7', '\"Full\"', '0', '1', NULL, 'AG000001', '1', '1', '1', 1, 0, '[{\"dust_weight\":0.03,\"purity\":\"22k\",\"calculated_weight\":0,\"final_product\":\"\"}]', '8', '0.000', '22k');

-- --------------------------------------------------------

--
-- Table structure for table `metals`
--

CREATE TABLE `metals` (
  `id` int NOT NULL,
  `metalname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `metal_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `financial_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `metals`
--

INSERT INTO `metals` (`id`, `metalname`, `metal_code`, `status`, `created_by`, `updated_by`, `financial_id`, `created_at`) VALUES
(1, 'Gold', 'G', 'active', 1, 1, 1, '2025-07-11 22:32:42');

-- --------------------------------------------------------

--
-- Table structure for table `metal_prices`
--

CREATE TABLE `metal_prices` (
  `id` bigint UNSIGNED NOT NULL,
  `metal` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `carat` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'INR',
  `fetched_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `metal_prices`
--

INSERT INTO `metal_prices` (`id`, `metal`, `carat`, `price`, `currency`, `fetched_at`) VALUES
(19, 'gold', '24K', '11991.18', 'INR', '2025-10-01 04:59:57'),
(20, 'gold', '22K', '11991.18', 'INR', '2025-10-01 04:59:57'),
(21, 'silver', '999', '151.10', 'INR', '2025-10-01 04:59:57'),
(22, 'gold', '24K', '12025.26', 'INR', '2025-10-01 09:54:02'),
(23, 'gold', '22K', '12025.26', 'INR', '2025-10-01 09:54:02'),
(24, 'silver', '999', '151.51', 'INR', '2025-10-01 09:54:02');

-- --------------------------------------------------------

--
-- Table structure for table `pledge_final_quotation`
--

CREATE TABLE `pledge_final_quotation` (
  `id` int NOT NULL,
  `quotation_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `purchase_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `customer_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `aadhar_no` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pan_no` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `total_amount` decimal(15,2) NOT NULL,
  `bill_copy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ornament_photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference_person` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `other_reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('active','inactive','closed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `margin_percent` decimal(5,2) DEFAULT NULL,
  `margin_approval_requested` tinyint(1) DEFAULT '0',
  `margin_approval_status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `financial_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `user_capture` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pledge_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pledge_final_quotation`
--

INSERT INTO `pledge_final_quotation` (`id`, `quotation_id`, `purchase_id`, `customer_id`, `customer_name`, `aadhar_no`, `pan_no`, `products`, `total_amount`, `bill_copy`, `ornament_photo`, `reference`, `reference_person`, `other_reference`, `remarks`, `status`, `margin_percent`, `margin_approval_requested`, `margin_approval_status`, `financial_id`, `created_by`, `updated_by`, `created_at`, `updated_at`, `user_capture`, `pledge_id`) VALUES
(1, 'QT967339266', 'PUR25095943', '7', 'Raj', '123456789101', 'aaaaa23456', '[{\"id\":1,\"metal\":1,\"purity\":100,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":6,\"dust_weight\":0.1,\"stone_weight\":0.2,\"net_weight\":5.7,\"mcx_rate\":10124.89,\"rate\":10124.89,\"margin_weight\":0.171,\"final_weight\":5.529,\"amount\":55980.52}]', '55980.52', NULL, NULL, NULL, NULL, NULL, 'new qouatation', 'closed', '3.00', 0, NULL, 1, 31, 31, '2025-09-28 09:10:29', '2025-09-28 09:16:41', NULL, '40'),
(2, 'QTRA007970', 'PUR25109967', '18', 'sample', '987654321987', 'AFZPK7190K', '[{\"id\":1,\"metal\":1,\"purity\":100,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":4,\"dust_weight\":0.1,\"stone_weight\":0.1,\"net_weight\":3.8,\"mcx_rate\":12013.13,\"rate\":12013.13,\"margin_weight\":0.114,\"final_weight\":3.686,\"amount\":44280.4}]', '44280.40', NULL, NULL, NULL, NULL, NULL, 'test', 'closed', '3.00', 0, NULL, 1, 45, 45, '2025-10-01 11:30:22', '2025-10-01 11:31:10', NULL, '53');

-- --------------------------------------------------------

--
-- Table structure for table `pledge_items`
--

CREATE TABLE `pledge_items` (
  `id` int NOT NULL,
  `customer_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `adhar_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pan_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bill` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ornament_photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `product_details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `remarks` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `role_id` int DEFAULT NULL,
  `interest_rate` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pledge_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `current_interest` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `total_payment` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_user` int DEFAULT NULL,
  `approval` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `manager` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `money_request_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `money_request_lat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `money_requet_lng` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `money_rquest_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `accounts_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `accounts_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `collection_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `collection_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bank_collection_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bank_collection_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bank_collection_lat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bank_collection_lng` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `finance_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `finance_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `finance_lat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `finance_lng` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gold_collect_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gold_collect_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gold_collect_lat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gold_collect_lng` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `manager_approvel_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `manager_approval_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `regional_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `regional_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approval_accounts_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approval_accounts_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `regional_manager_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `manage_approval_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `accounts_amount` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pledge_items`
--

INSERT INTO `pledge_items` (`id`, `customer_id`, `adhar_number`, `pan_number`, `phone_number`, `bill`, `ornament_photo`, `product_details`, `remarks`, `created_at`, `role_id`, `interest_rate`, `pledge_amount`, `current_interest`, `total_payment`, `reference`, `created_user`, `approval`, `manager`, `money_request_id`, `money_request_lat`, `money_requet_lng`, `money_rquest_status`, `accounts_id`, `accounts_status`, `collection_id`, `collection_type`, `bank_collection_id`, `bank_collection_status`, `bank_collection_lat`, `bank_collection_lng`, `finance_id`, `finance_status`, `finance_lat`, `finance_lng`, `gold_collect_id`, `gold_collect_status`, `gold_collect_lat`, `gold_collect_lng`, `manager_approvel_id`, `manager_approval_status`, `regional_id`, `regional_status`, `approval_accounts_id`, `approval_accounts_status`, `regional_manager_status`, `manage_approval_status`, `accounts_amount`) VALUES
(60, 'K33', '233552468965', 'aaaaa12345', '8524838698', 'bill-1759325940850-320543453.jpg', 'ornament_photo-1759325940851-817111961.jpg', '[{\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":2,\"dust_weight\":0,\"stone_weight\":0,\"net_weight\":\"2.000\",\"rate\":12013.13,\"amount\":\"24026.26\"},{\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":4,\"dust_weight\":0,\"stone_weight\":0,\"net_weight\":\"4.000\",\"rate\":12013.13,\"amount\":\"48052.52\"}]', 'demo', '2025-10-01 19:09:00', 5, 'undefined', '54059.08', 'undefined', '55059.08', '38', 31, '0', '33', '41', NULL, NULL, NULL, NULL, '2', '31', '1', '38', '1', '12.8909312', '80.2455552', '38', '1', '12.8909312', '80.2455552', '38', '1', '12.8909312', '80.2455552', '33', NULL, '39', '1', '41', '1', '1', NULL, '2000'),
(61, 'K33', '233552468965', 'aaaaa12345', '8524838698', 'bill-1759326851275-893906523.jpg', 'ornament_photo-1759326851280-540359109.jpg', '[{\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":3,\"dust_weight\":0,\"stone_weight\":0,\"net_weight\":\"3.000\",\"rate\":12013.13,\"amount\":\"36039.39\"},{\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":1,\"dust_weight\":0,\"stone_weight\":0,\"net_weight\":\"1.000\",\"rate\":12013.13,\"amount\":\"12013.13\"}]', 'demo', '2025-10-01 19:24:11', 5, 'undefined', '36039.39', 'undefined', '36139.39', '43', 44, '0', '42', '41', NULL, NULL, NULL, NULL, '1', '44', '1', '43', '1', '12.8909312', '80.2455552', '43', '1', '12.8909312', '80.2455552', '43', '1', '12.8909312', '80.2455552', '42', NULL, '39', '1', '41', '1', '1', '1', '1234'),
(65, 'K33', '233552468965', 'aaaaa12345', '8524838698', NULL, NULL, '[{\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":2,\"dust_weight\":0,\"stone_weight\":0,\"net_weight\":\"2.000\",\"rate\":12013.13,\"amount\":\"24026.26\"}]', NULL, '2025-10-01 19:56:36', 5, 'undefined', '18019.69', 'undefined', '18020.69', NULL, 31, '0', '33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pledge_quotations`
--

CREATE TABLE `pledge_quotations` (
  `id` int NOT NULL,
  `quotation_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `purchase_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `customer_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `aadhar_no` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pan_no` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `total_amount` decimal(15,2) NOT NULL,
  `bill_copy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ornament_photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference_person` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `other_reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('active','inactive','closed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `margin_percent` decimal(5,2) DEFAULT NULL,
  `margin_approval_requested` tinyint(1) DEFAULT '0',
  `margin_approval_status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `financial_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `user_capture` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pledge_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `branch_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pledge_quotations`
--

INSERT INTO `pledge_quotations` (`id`, `quotation_id`, `purchase_id`, `customer_id`, `customer_name`, `aadhar_no`, `pan_no`, `products`, `total_amount`, `bill_copy`, `ornament_photo`, `reference`, `reference_person`, `other_reference`, `remarks`, `status`, `margin_percent`, `margin_approval_requested`, `margin_approval_status`, `financial_id`, `created_by`, `updated_by`, `created_at`, `updated_at`, `user_capture`, `pledge_id`, `branch_id`) VALUES
(1, 'QT967339266', 'PUR141859126', '7', 'Raj', '123456789101', 'aaaaa23456', '[{\"id\":1,\"metal\":1,\"purity\":100,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":5,\"dust_weight\":0.1,\"stone_weight\":0.1,\"net_weight\":4.8,\"margin_weight\":0.096,\"final_weight\":4.704,\"rate\":10124.89,\"amount\":47627.48,\"mcx_rate\":10124.89}]', '47627.48', NULL, NULL, NULL, NULL, NULL, NULL, 'closed', '2.00', 0, NULL, NULL, 31, NULL, '2025-09-28 08:59:35', '2025-09-28 09:10:29', NULL, '40', NULL),
(2, 'QTRA007970', 'PURRA002315', '18', 'sample', '987654321987', 'AFZPK7190K', '[{\"id\":1,\"metal\":1,\"purity\":100,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":4,\"dust_weight\":0.1,\"stone_weight\":0.2,\"net_weight\":3.7,\"margin_weight\":0,\"final_weight\":3.7,\"rate\":12013.13,\"amount\":44448.58,\"mcx_rate\":12013.13}]', '44448.58', NULL, NULL, NULL, NULL, NULL, 'test', 'closed', '0.00', 0, NULL, NULL, 45, NULL, '2025-10-01 11:21:27', '2025-10-01 11:30:22', NULL, '53', '5'),
(3, 'QTRA005760', 'PURRA001795', '14', 'kirupa', '233552468965', 'aaaaa12345', '[{\"id\":1,\"metal\":1,\"purity\":100,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":3,\"dust_weight\":0,\"stone_weight\":0,\"net_weight\":3,\"margin_weight\":0,\"final_weight\":3,\"rate\":12013.13,\"amount\":36039.39,\"mcx_rate\":12013.13},{\"id\":2,\"metal\":1,\"purity\":100,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":1,\"dust_weight\":0,\"stone_weight\":0,\"net_weight\":1,\"margin_weight\":0,\"final_weight\":1,\"rate\":12013.13,\"amount\":12013.13,\"mcx_rate\":12013.13}]', '48052.52', 'bill-1759326851275-893906523.jpg', 'ornament_photo-1759326851280-540359109.jpg', NULL, NULL, NULL, 'demo', 'active', '0.00', 0, NULL, NULL, 44, NULL, '2025-10-01 14:00:50', NULL, NULL, '61', '5');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `metal_id` int NOT NULL,
  `category_id` int NOT NULL,
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `product_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sub_product` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'no',
  `hsn_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `financial_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `metal_id`, `category_id`, `product_name`, `product_code`, `sub_product`, `hsn_code`, `description`, `status`, `created_at`, `created_by`, `updated_by`, `financial_id`) VALUES
(1, 1, 1, 'gold', 'GO146', 'yes', '9876543212', NULL, 'active', '2025-07-12 10:27:47', 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` int NOT NULL,
  `quotation_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `purchase_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `customer_id` int DEFAULT NULL,
  `customer_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `aadhar_no` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pan_no` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `total_amount` decimal(12,2) NOT NULL,
  `bill_copy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ornament_photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference_person` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `other_reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('pending_payment','completed','paid','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending_payment',
  `margin_percent` decimal(5,2) DEFAULT '3.00',
  `payment_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `barcode_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qr_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `qr_code_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bill_pdf_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_by` int NOT NULL,
  `updated_by` int NOT NULL,
  `financial_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_capture` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bref_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_details` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pledge_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `regional_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `accounts_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `company_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `branch_id` varchar(255) DEFAULT NULL,
  `collected_status` varchar(255) DEFAULT NULL,
  `accounts_id` varchar(255) DEFAULT NULL,
  `melting_status` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `quotation_id`, `purchase_id`, `customer_id`, `customer_name`, `aadhar_no`, `pan_no`, `products`, `total_amount`, `bill_copy`, `ornament_photo`, `reference`, `reference_person`, `other_reference`, `remarks`, `status`, `margin_percent`, `payment_method`, `barcode`, `barcode_path`, `qr_data`, `qr_code_path`, `bill_pdf_path`, `created_by`, `updated_by`, `financial_id`, `created_at`, `user_capture`, `bref_no`, `payment_details`, `pledge_status`, `regional_status`, `accounts_status`, `company_code`, `branch_id`, `collected_status`, `accounts_id`, `melting_status`) VALUES
(1, 'QT25099913', 'PUR25095098', NULL, 'Raj', '123456789101', 'aaaaa23456', '[{\"key\":\"ab58e819-4f53-4b3a-aee5-61c1788561a4\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":16.5,\"dust_weight\":0.23,\"stone_weight\":0.45,\"net_weight\":15.82,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.4746,\"final_weight\":15.3454,\"rate\":10124.89,\"amount\":155370.48700599998}]', '155370.49', NULL, NULL, 'sales_executive', NULL, NULL, 's', 'completed', '3.00', 'partial_cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-26 12:33:46', NULL, 'BREF8699753', '{\"cashAmount\":155370.48,\"bankAmount\":0,\"bankDetails\":\"\"}', '0', NULL, NULL, 'AG000001', NULL, NULL, NULL, 0),
(2, NULL, 'PUR25097343', 10, 'Raj', '123456789101', 'aaaaa23456', '[{\"key\":\"ab58e819-4f53-4b3a-aee5-61c1788561a4\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":16.5,\"dust_weight\":0.23,\"stone_weight\":0.45,\"net_weight\":15.82,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.4746,\"final_weight\":15.3454,\"rate\":10124.89,\"amount\":155370.48700599998}]', '155370.49', NULL, NULL, 'sales_executive', NULL, 'sales_executive', 's', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-27 13:49:57', NULL, 'BREF3362649', '\"Full\"', '0', NULL, NULL, 'AG000001', NULL, '1', NULL, 0),
(3, NULL, 'PUR25094759', 10, 'Raj', '123456789101', 'aaaaa23456', '[{\"key\":\"ab58e819-4f53-4b3a-aee5-61c1788561a4\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":16.5,\"dust_weight\":0.23,\"stone_weight\":0.45,\"net_weight\":15.82,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.4746,\"final_weight\":15.3454,\"rate\":10124.89,\"amount\":155370.48700599998}]', '155370.49', NULL, NULL, 'sales_executive', NULL, 'sales_executive', 's', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-28 09:15:55', NULL, 'BREF0091971', '\"Full\"', '0', NULL, NULL, 'AG000001', NULL, NULL, NULL, 0),
(4, 'QT967339266', 'PUR25095943', NULL, 'Raj', '123456789101', 'aaaaa23456', '[{\"key\":\"31043ed3-c48f-4f67-8970-9e82a28ef2cb\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":6,\"dust_weight\":0.1,\"stone_weight\":0.2,\"net_weight\":5.7,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.171,\"final_weight\":5.529,\"rate\":10124.89,\"amount\":55980.516809999994}]', '55980.52', NULL, NULL, 'advertisement', NULL, NULL, 'new qouatation', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-28 09:16:41', NULL, 'BREF4295181', '\"Full\"', '1', NULL, NULL, 'AG000001', NULL, NULL, NULL, 0),
(5, 'QT25093140', 'PUR25095858', NULL, 'kirupa', '233552468965', 'aaaaa12345', '[{\"key\":\"38489491-fa29-49bc-b720-f6a3a79b8469\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":10124.89,\"amount\":147022.515201}]', '147022.52', NULL, '/uploads/purchases/temp/ornament-1759226989611.jpg', 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-30 10:09:49', '/uploads/purchases/temp/LiveCapture-1759226989611.jpg', 'BREF6725681', '\"Full\"', '0', NULL, NULL, 'AG000001', '1', NULL, NULL, 0),
(6, 'QT25099503', 'PUR25092693', NULL, 'kirupa', '233552468965', 'aaaaa12345', '[{\"key\":\"7e1f65aa-028f-4b8c-9892-141adf9ba97a\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":10124.89,\"amount\":147022.515201}]', '147022.52', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-30 10:39:11', NULL, 'BREF6835607', '\"Full\"', '0', NULL, NULL, 'AG000001', '1', NULL, NULL, 0),
(7, 'QT25099880', 'PUR25098752', NULL, 'kirupa', '233552468965', 'aaaaa12345', '[{\"key\":\"e03bc54b-7973-482b-b69c-4e437442154b\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":10124.89,\"amount\":147022.515201}]', '147022.52', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-30 10:55:48', NULL, 'BREF6606733', '\"Full\"', '0', '1', NULL, 'AG000001', '1', '1', '1', 0),
(8, 'QT25093164', 'PUR25098242', NULL, 'darsni', '233552468965', 'aaaaa12345', '[{\"key\":\"6273e988-e190-4f0b-aa7a-c6c71626f0c3\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":16,\"dust_weight\":0.06,\"stone_weight\":0,\"net_weight\":15.94,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.4782,\"final_weight\":15.4618,\"rate\":10124.89,\"amount\":156549.024202}]', '156549.02', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 32, 32, 1, '2025-09-30 11:13:50', NULL, 'BREF1723681', '\"Full\"', '0', '1', NULL, 'AG000001', '1', NULL, '1', 0),
(9, 'QT25099329', 'PUR25094360', NULL, 'raja', '123456789011', 'Abcde12345', '[{\"key\":\"539add26-7abf-4ca8-a20a-a34866f40e55\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":12,\"dust_weight\":0.35,\"stone_weight\":0.15,\"net_weight\":11.5,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.345,\"final_weight\":11.155,\"rate\":10124.89,\"amount\":112943.14794999998}]', '112943.15', NULL, NULL, 'RAJ', NULL, 'RAJ', 'D', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-30 11:27:03', '/uploads/purchases/temp/LiveCapture-1759231623478.jpg', 'BREF1114532', '\"Full\"', '0', '1', NULL, 'AG000001', '1', '1', '1', 0),
(10, 'QT25091253', 'PUR25098845', NULL, 'darsni', '233552468965', 'aaaaa12345', '[{\"key\":\"9fd4249d-a7c0-406c-ac0c-3a45eeee1b39\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":13.6,\"dust_weight\":0.36,\"stone_weight\":0,\"net_weight\":13.24,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.3972,\"final_weight\":12.8428,\"rate\":10124.89,\"amount\":130031.937292},{\"key\":\"d78b2e4f-c04a-4b99-a74a-12cac8c113b8\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":1.76,\"dust_weight\":0.16,\"stone_weight\":0,\"net_weight\":1.6,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.04800000000000001,\"final_weight\":1.552,\"rate\":10124.89,\"amount\":15713.82928}]', '145745.77', NULL, NULL, 'sales_executive', NULL, NULL, '.', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-30 11:33:09', NULL, 'BREF8586451', '\"Full\"', '0', '1', NULL, 'AG000001', '1', '1', '1', 0),
(11, 'QT25092021', 'PUR25092371', NULL, 'Raj', '123456789101', 'aaaaa23456', '[{\"key\":\"1a8985c4-a195-422d-b955-b64ab9d69c83\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24,\"dust_weight\":0.3,\"stone_weight\":0.06,\"net_weight\":23.64,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.7092,\"final_weight\":22.9308,\"rate\":10124.89,\"amount\":232171.827612}]', '232171.83', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-30 11:40:33', NULL, 'BREF3343420', '\"Full\"', '0', '1', NULL, 'AG000001', '1', '1', '1', 0),
(12, 'QTRA009803', 'PUR25107107', NULL, 'sample', '987654321987', 'AFZPK7190K', '[{\"key\":\"b75756de-b27c-42d6-bf97-2d944953cd15\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":5,\"dust_weight\":0.1,\"stone_weight\":0.1,\"net_weight\":4.800000000000001,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.14400000000000002,\"final_weight\":4.656000000000001,\"rate\":12013.13,\"amount\":55933.13328}]', '55933.13', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 45, 45, 1, '2025-10-01 10:53:03', NULL, 'BREF1572791', '\"Full\"', '0', NULL, NULL, 'AG000001', '5', NULL, NULL, 0),
(13, 'QTRA007970', 'PUR25109967', NULL, 'sample', '987654321987', 'AFZPK7190K', '[{\"key\":\"6e56eb72-2506-4460-9ad3-27f048440524\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":4,\"dust_weight\":0.1,\"stone_weight\":0.1,\"net_weight\":3.8,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.11399999999999999,\"final_weight\":3.686,\"rate\":12013.13,\"amount\":44280.39718}]', '44280.40', NULL, NULL, 'advertisement', NULL, NULL, 'test', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 45, 45, 1, '2025-10-01 11:31:10', NULL, 'BREF9544252', '\"Full\"', '1', NULL, NULL, 'AG000001', '5', NULL, NULL, 0),
(14, 'QTSR009171', 'PUR25105960', NULL, 'kajo', '233552468965', 'aaaaa12345', '[{\"key\":\"b4631c3e-b834-4148-ba63-847493db50da\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":12013.13,\"amount\":174441.459417}]', '174441.46', NULL, NULL, 'manager', NULL, NULL, 'gfg', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-10-01 11:55:00', NULL, 'BREF8831302', '\"Full\"', '0', '1', NULL, 'AG000001', '1', NULL, '1', 0),
(15, 'QTSR008437', 'PUR25101710', NULL, 'mari', '233759697894', 'BGGPV2379J', '[{\"key\":\"7912d7cc-96b5-4646-92ff-8cf071084c03\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":12013.13,\"amount\":174441.459417}]', '174441.46', NULL, NULL, 'sales_executive', NULL, NULL, '.', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-10-01 12:33:10', NULL, 'BREF0361327', '\"Full\"', '0', '1', NULL, 'AG000001', '1', NULL, '1', 0),
(16, 'QT25093691', 'PUR25106681', NULL, 'hari', '123456789101', 'aaaaa23456', '[{\"key\":\"29e245b8-dae9-4733-ba9f-64bd44fd51b1\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":10,\"dust_weight\":0.23,\"stone_weight\":0,\"net_weight\":9.77,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.29309999999999997,\"final_weight\":9.476899999999999,\"rate\":10124.89,\"amount\":95952.57004099998}]', '95952.57', NULL, NULL, 'sales_executive', NULL, NULL, '2', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-10-01 12:34:45', NULL, 'BREF1291670', '\"Full\"', '0', '1', NULL, 'AG000001', '1', '1', '1', 0),
(17, 'QTSR004983', 'PUR25104342', NULL, 'test1', '233552468965', 'aaaaa12345', '[{\"key\":\"a560b3d9-ea21-4c41-9565-06b15d6885c4\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24.02,\"dust_weight\":0.48,\"stone_weight\":0.1,\"net_weight\":23.439999999999998,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.7031999999999999,\"final_weight\":22.7368,\"rate\":12013.13,\"amount\":273140.13418399997}]', '273140.13', NULL, NULL, 'manager', NULL, NULL, 'yfty', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 32, 32, 1, '2025-10-02 05:47:31', NULL, 'BREF0252469', '\"Full\"', '0', '1', NULL, 'AG000001', '1', NULL, '1', 0),
(18, 'QTSR002194', 'PUR25104195', NULL, 'test123', '233552468965', 'BGGPV2379J', '[{\"key\":\"aa2a0fe0-bd1b-4507-9178-f1b5b23a69a1\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":5,\"dust_weight\":0.1,\"stone_weight\":0.3,\"net_weight\":4.6000000000000005,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.138,\"final_weight\":4.462000000000001,\"rate\":12013.13,\"amount\":53602.58606}]', '53602.59', NULL, '/uploads/purchases/temp/ornament-1759407947194.jpg', 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-10-02 12:25:47', '/uploads/purchases/temp/LiveCapture-1759407947195.jpg', 'BREF9890395', '\"Full\"', '0', '1', NULL, 'AG000001', '1', NULL, '1', 0);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_payments`
--

CREATE TABLE `purchase_payments` (
  `id` int NOT NULL,
  `purchase_id` int NOT NULL,
  `payment_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `bank_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `transaction_reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `remaining_amount` decimal(12,2) NOT NULL,
  `recorded_by` int NOT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purities`
--

CREATE TABLE `purities` (
  `id` int NOT NULL,
  `metal_id` int NOT NULL,
  `purity_standard` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `purity_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `purity_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `purity_percentage` decimal(5,2) NOT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `financial_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purities`
--

INSERT INTO `purities` (`id`, `metal_id`, `purity_standard`, `purity_name`, `purity_code`, `purity_percentage`, `status`, `created_by`, `updated_by`, `financial_id`, `created_at`) VALUES
(1, 1, '24k', '24K (99.9%) Gold', 'G24', '99.91', 'active', 1, 1, 1, '2025-07-12 06:10:51'),
(2, 1, '22k', '22K (91.6%) Gold', 'G22', '91.60', 'active', 1, NULL, 1, '2025-09-19 14:19:28'),
(3, 1, '18k', '18K (75%) Gold', 'G18', '75.00', 'active', 1, NULL, 1, '2025-09-19 14:19:46');

-- --------------------------------------------------------

--
-- Table structure for table `quotations`
--

CREATE TABLE `quotations` (
  `id` int NOT NULL,
  `quotation_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `purchase_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `customer_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `aadhar_no` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pan_no` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `total_amount` decimal(15,2) NOT NULL,
  `bill_copy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ornament_photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference_person` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `other_reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('active','inactive','closed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `margin_percent` decimal(5,2) DEFAULT NULL,
  `margin_approval_requested` tinyint(1) DEFAULT '0',
  `margin_approval_status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `financial_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `user_capture` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pledge_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `quotations`
--

INSERT INTO `quotations` (`id`, `quotation_id`, `purchase_id`, `customer_id`, `customer_name`, `aadhar_no`, `pan_no`, `products`, `total_amount`, `bill_copy`, `ornament_photo`, `reference`, `reference_person`, `other_reference`, `remarks`, `status`, `margin_percent`, `margin_approval_requested`, `margin_approval_status`, `financial_id`, `created_by`, `updated_by`, `created_at`, `updated_at`, `user_capture`, `pledge_id`) VALUES
(3, 'QT25092021', 'PUR25092371', '13', 'Raj', '123456789101', 'aaaaa23456', '[{\"id\":1,\"metal\":1,\"purity\":91.6,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24,\"dust_weight\":0.3,\"stone_weight\":0.06,\"net_weight\":21.654,\"mcx_rate\":10124.89,\"rate\":10124.89,\"margin_weight\":0.65,\"final_weight\":21.005,\"amount\":212669.39}]', '212669.39', NULL, NULL, 'manager', 'kann', NULL, NULL, 'closed', '3.00', 0, NULL, 1, 1, 1, '2025-09-30 06:32:52', '2025-09-30 11:40:33', NULL, NULL),
(6, 'QT25099880', 'PUR25098752', '14', 'kirupa', '233552468965', 'aaaaa12345', '[{\"id\":1,\"metal\":1,\"purity\":100,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":10124.89,\"rate\":10124.89,\"margin_weight\":0.449,\"final_weight\":14.521,\"amount\":147022.52}]', '0.00', NULL, NULL, 'manager', 'kann', NULL, NULL, 'closed', '3.00', 0, NULL, 1, 31, 31, '2025-09-30 10:54:46', '2025-09-30 10:55:48', NULL, NULL),
(8, 'QT25099329', 'PUR25094360', '16', 'raja', '123456789011', 'Abcde12345', '[{\"id\":1,\"metal\":1,\"purity\":78,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":12,\"dust_weight\":0.35,\"stone_weight\":0.15,\"net_weight\":8.97,\"mcx_rate\":10124.89,\"rate\":10124.89,\"margin_weight\":0.269,\"final_weight\":8.701,\"amount\":88095.66}]', '88095.66', NULL, '/uploads/quotations/temp/ornament-1759231051292.jpg', 'other', NULL, 'RAJ', 'D', 'closed', '3.00', 0, NULL, 1, 44, 44, '2025-09-30 11:17:31', '2025-09-30 11:27:03', NULL, NULL),
(9, 'QT25091253', 'PUR25098845', '15', 'darsni', '233552468965', 'aaaaa12345', '[{\"id\":1,\"metal\":1,\"purity\":82,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":13.6,\"dust_weight\":0.36,\"stone_weight\":0,\"net_weight\":10.857,\"mcx_rate\":10124.89,\"rate\":10124.89,\"margin_weight\":0.326,\"final_weight\":10.531,\"amount\":106626.19},{\"id\":2,\"purity\":72,\"gross_weight\":1.76,\"dust_weight\":0.16,\"stone_weight\":0,\"net_weight\":1.152,\"mcx_rate\":10124.89,\"rate\":10124.89,\"margin_weight\":0.035,\"final_weight\":1.117,\"amount\":11313.96,\"metal\":1,\"product\":1,\"sub_product\":\"chainn\"}]', '117940.15', NULL, '/uploads/quotations/temp/ornament-1759231867478.jpg', 'sales_executive', '135', NULL, '.', 'closed', '3.00', 0, NULL, 1, 1, 1, '2025-09-30 11:31:07', '2025-09-30 11:33:09', NULL, NULL),
(10, 'QT25093691', 'PUR25106681', '9', 'hari', '123456789101', 'aaaaa23456', '[{\"id\":1,\"metal\":1,\"purity\":78,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":10,\"dust_weight\":0.23,\"stone_weight\":0,\"net_weight\":7.621,\"mcx_rate\":10124.89,\"rate\":10124.89,\"margin_weight\":0.229,\"final_weight\":7.392,\"amount\":74843}]', '0.00', NULL, NULL, 'sales_executive', '135', NULL, '2', 'closed', '3.00', 0, NULL, 1, 1, 31, '2025-09-30 11:38:59', '2025-10-01 12:34:45', NULL, NULL),
(11, 'QTRA009803', 'PUR25107107', '18', 'sample', '987654321987', 'AFZPK7190K', '[{\"id\":1,\"metal\":1,\"purity\":100,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":5,\"dust_weight\":0.1,\"stone_weight\":0.1,\"net_weight\":4.8,\"mcx_rate\":12013.13,\"rate\":12013.13,\"margin_weight\":0.144,\"final_weight\":4.656,\"amount\":55933.13}]', '55933.13', NULL, NULL, 'manager', 'test', NULL, NULL, 'closed', '3.00', 0, NULL, 1, 45, 45, '2025-10-01 10:51:56', '2025-10-01 10:53:03', NULL, NULL),
(12, 'QTSR009171', 'PUR25105960', '20', 'kajo', '233552468965', 'aaaaa12345', '[{\"id\":1,\"metal\":1,\"purity\":100,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":12013.13,\"rate\":12013.13,\"margin_weight\":0.449,\"final_weight\":14.521,\"amount\":174441.46}]', '174441.46', NULL, NULL, 'manager', 'kann', NULL, 'gfg', 'closed', '3.00', 0, NULL, 1, 31, 31, '2025-10-01 11:52:59', '2025-10-01 11:55:00', NULL, NULL),
(13, 'QTSR008437', 'PUR25101710', '21', 'mari', '233759697894', 'BGGPV2379J', '[{\"id\":1,\"metal\":1,\"purity\":100,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":12013.13,\"rate\":12013.13,\"margin_weight\":0.449,\"final_weight\":14.521,\"amount\":174441.46}]', '0.00', NULL, NULL, 'sales_executive', 'kann', NULL, '.', 'closed', '3.00', 0, NULL, 1, 31, 31, '2025-10-01 12:26:12', '2025-10-01 12:33:10', NULL, NULL),
(14, 'QTSR004983', 'PUR25104342', '22', 'test1', '233552468965', 'aaaaa12345', '[{\"id\":1,\"metal\":1,\"purity\":100,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24.02,\"dust_weight\":0.48,\"stone_weight\":0.1,\"net_weight\":23.44,\"mcx_rate\":12013.13,\"rate\":12013.13,\"margin_weight\":0.703,\"final_weight\":22.737,\"amount\":273140.13}]', '273140.13', NULL, NULL, 'manager', 'kann', NULL, 'yfty', 'closed', '3.00', 0, NULL, 1, 32, 32, '2025-10-02 05:46:49', '2025-10-02 05:47:31', NULL, NULL),
(15, 'QTSR002194', 'PUR25104195', '23', 'test123', '233552468965', 'BGGPV2379J', '[{\"id\":1,\"metal\":1,\"purity\":100,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":5,\"dust_weight\":0.1,\"stone_weight\":0.3,\"net_weight\":4.6,\"mcx_rate\":12013.13,\"rate\":12013.13,\"margin_weight\":0.138,\"final_weight\":4.462,\"amount\":53602.59}]', '53602.59', NULL, NULL, 'manager', '135', NULL, NULL, 'closed', '3.00', 0, NULL, 1, 31, 31, '2025-10-02 12:24:07', '2025-10-02 12:25:47', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `quotation_approvals`
--

CREATE TABLE `quotation_approvals` (
  `id` int NOT NULL,
  `quotation_id` int NOT NULL,
  `requested_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `old_margin` decimal(5,2) NOT NULL,
  `new_margin` decimal(5,2) NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `approval_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `rejection_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receipt`
--

CREATE TABLE `receipt` (
  `id` int NOT NULL,
  `type` varchar(225) NOT NULL,
  `ref_no` varchar(255) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_code` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `gst_no` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL,
  `narration` varchar(255) NOT NULL,
  `mode_of_receipt` varchar(255) NOT NULL,
  `crated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `receipt`
--

INSERT INTO `receipt` (`id`, `type`, `ref_no`, `account_name`, `account_code`, `address`, `gst_no`, `amount`, `narration`, `mode_of_receipt`, `crated_at`) VALUES
(1, 'General Receipt', 'M010002Ref01', 'Demo', 'M010002', '748a1\nGandhinagar', '1234', '23', 'fghdfth', 'Cash', '2025-10-26 15:34:26'),
(2, 'General Receipt', 'M010002Ref02', 'Demo', 'M010002', '748a1\nGandhinagar', '1234', '23', 'fghdfth', 'Cash', '2025-10-26 15:35:25');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `financial_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `status`, `created_at`, `created_by`, `financial_id`) VALUES
(1, 'Sales Exectivee', 'sales departmenttt', 'active', '2025-07-11 10:13:10', 1, 1),
(2, 'general Manager', 'general', 'active', '2025-07-11 11:04:41', 1, 1),
(3, 'Admin', 'admin for lachu', 'active', '2025-07-12 11:33:30', 1, 1),
(4, 'Super Admin', 'superadmin', 'active', '2025-07-12 11:33:30', 1, 1),
(5, 'Office Executive', 'office exe', 'active', '2025-08-02 06:43:51', 1, 1),
(6, 'Accounts', 'demo', 'active', '2025-08-17 17:21:46', 1, 1),
(7, 'Regional Manager', 'Regional Manager', 'active', '2025-08-19 07:12:42', 1, 1),
(8, 'Head Office', 'Head Office', 'active', '2025-10-18 06:20:29', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int NOT NULL,
  `role_id` int NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `financial_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permissions`, `financial_id`, `created_by`, `created_at`) VALUES
(1, 1, '[\"dashboard\",\"pledege_sales_executive\",\"accounts\",\"pledge_manager_approval\",\"collection\",\"bank_collection\",\"finance_institute\",\"gold_collect\"]', 1, 1, '2025-07-11 14:27:41'),
(3, 3, '[\"dashboard\",\"users:roles\",\"users:permissions\",\"users:user-creation\",\"metals\",\"purity\",\"items:items:category\",\"items:items:products\",\"items:items:subproducts\",\"customer_creation\",\"customer_bank_creation\",\"customer_quotation\",\"purchase\",\"pledege_items\",\"sales\",\"reports\",\"setting\"]', 1, 1, '2025-07-12 11:37:52'),
(4, 4, '[\"dashboard\",\"company_creation\",\"branches\",\"users:user-creation\",\"metals\",\"purity\",\"items:items:category\",\"items:items:products\",\"items:items:subproducts\",\"customer_creation\",\"customer_bank_creation\",\"setting\",\"reports\",\"sales\",\"purchase\",\"customer_quotation\",\"mcx_rate\",\"all_pledges\",\"pledge_quotation\",\"metal_live_rate\",\"regional_manager_purchase_approval\",\"accounts_purchase_approval\",\"melting_purchase\",\"melting_status\",\"master_grouping\",\"account_head\",\"account_receipt\",\"state\"]', 1, 1, '2025-07-12 13:08:03'),
(5, 5, '[\"items:items:products\",\"items:items:subproducts\",\"customer_creation\",\"customer_bank_creation\",\"customer_quotation\",\"purchase\",\"pledege_items\",\"dashboard\",\"collection\",\"pledge_quotation\"]', 1, 31, '2025-08-02 06:44:11'),
(6, 2, '[\"dashboard\",\"users:permissions\",\"users:user-creation\",\"pledege_item_manager\",\"purity\",\"metals\",\"customer_creation\",\"purchase\",\"customer_quotation\",\"customer_bank_creation\",\"reports\",\"items:items:category\",\"items:items:products\",\"items:items:subproducts\",\"manager_approval\",\"pledege_zone_manager\",\"pledge_quotation\",\"metal_live_rate\"]', 1, 1, '2025-08-02 06:50:25'),
(7, 6, '[\"dashboard\",\"company_creation\",\"branches\",\"accounts\",\"accounts_approval\",\"accounts_purchase_approval\"]', 1, 1, '2025-08-17 17:24:46'),
(16, 7, '[\"dashboard\",\"reports\",\"sales\",\"setting\",\"religional_manager\",\"accounts_approval\",\"users:user-creation\",\"users:permissions\",\"users:roles\",\"regional_manager_purchase_approval\"]', 1, 1, '2025-08-19 07:58:33'),
(17, 8, '[\"dashboard\",\"company_creation\",\"branches\",\"melting_purchase\",\"melting_status\"]', 1, 1, '2025-10-18 06:21:22');

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int NOT NULL,
  `purchase_id` varchar(225) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `comments` longtext,
  `created_user` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `purchase_id`, `user_id`, `comments`, `created_user`) VALUES
(1, 'PUR25098752', '19', 'hyjgh', '1');

-- --------------------------------------------------------

--
-- Table structure for table `state`
--

CREATE TABLE `state` (
  `id` int NOT NULL,
  `name` varchar(225) NOT NULL,
  `code` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `state`
--

INSERT INTO `state` (`id`, `name`, `code`) VALUES
(1, 'TamilNadu', '33');

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--

CREATE TABLE `stock` (
  `id` int NOT NULL,
  `quotation_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `customer_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `aadhar_no` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pan_no` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `total_amount` decimal(12,2) NOT NULL,
  `bill_copy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ornament_photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference_person` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `other_reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('pending_payment','completed','paid','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending_payment',
  `margin_percent` decimal(5,2) DEFAULT '3.00',
  `payment_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `barcode_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qr_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `qr_code_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bill_pdf_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_by` int NOT NULL,
  `updated_by` int NOT NULL,
  `financial_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_capture` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `issrcc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bref_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `purchase_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stock`
--

INSERT INTO `stock` (`id`, `quotation_id`, `customer_id`, `customer_name`, `aadhar_no`, `pan_no`, `products`, `total_amount`, `bill_copy`, `ornament_photo`, `reference`, `reference_person`, `other_reference`, `remarks`, `status`, `margin_percent`, `payment_method`, `barcode`, `barcode_path`, `qr_data`, `qr_code_path`, `bill_pdf_path`, `created_by`, `updated_by`, `financial_id`, `created_at`, `user_capture`, `issrcc`, `bref_no`, `purchase_id`) VALUES
(1, 'QT25099913', NULL, 'Raj', '123456789101', 'aaaaa23456', '{\"key\":\"ab58e819-4f53-4b3a-aee5-61c1788561a4\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":16.5,\"dust_weight\":0.23,\"stone_weight\":0.45,\"net_weight\":15.82,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.4746,\"final_weight\":15.3454,\"rate\":10124.89,\"amount\":155370.48700599998}', '155370.49', NULL, NULL, 'sales_executive', NULL, NULL, 's', 'completed', '3.00', 'partial_cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-26 12:33:46', NULL, 'D', 'BREF8699753', 'PUR25095098'),
(2, NULL, 10, 'Raj', '123456789101', 'aaaaa23456', '{\"key\":\"ab58e819-4f53-4b3a-aee5-61c1788561a4\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":16.5,\"dust_weight\":0.23,\"stone_weight\":0.45,\"net_weight\":15.82,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.4746,\"final_weight\":15.3454,\"rate\":10124.89,\"amount\":155370.48700599998}', '155370.49', NULL, NULL, 'sales_executive', NULL, 'sales_executive', 's', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-27 13:49:57', NULL, 'D', 'BREF3362649', 'PUR25097343'),
(3, NULL, 10, 'Raj', '123456789101', 'aaaaa23456', '{\"key\":\"ab58e819-4f53-4b3a-aee5-61c1788561a4\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":16.5,\"dust_weight\":0.23,\"stone_weight\":0.45,\"net_weight\":15.82,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.4746,\"final_weight\":15.3454,\"rate\":10124.89,\"amount\":155370.48700599998}', '155370.49', NULL, NULL, 'sales_executive', NULL, 'sales_executive', 's', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-28 09:15:55', NULL, 'D', 'BREF0091971', 'PUR25094759'),
(4, 'QT967339266', NULL, 'Raj', '123456789101', 'aaaaa23456', '{\"key\":\"31043ed3-c48f-4f67-8970-9e82a28ef2cb\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":6,\"dust_weight\":0.1,\"stone_weight\":0.2,\"net_weight\":5.7,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.171,\"final_weight\":5.529,\"rate\":10124.89,\"amount\":55980.516809999994}', '55980.52', NULL, NULL, 'advertisement', NULL, NULL, 'new qouatation', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-28 09:16:41', NULL, 'D', 'BREF4295181', 'PUR25095943'),
(5, 'QT25093140', NULL, 'kirupa', '233552468965', 'aaaaa12345', '{\"key\":\"38489491-fa29-49bc-b720-f6a3a79b8469\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":10124.89,\"amount\":147022.515201}', '147022.52', NULL, '/uploads/purchases/temp/ornament-1759226989611.jpg', 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-30 10:09:49', '/uploads/purchases/temp/LiveCapture-1759226989611.jpg', 'D', 'BREF6725681', 'PUR25095858'),
(6, 'QT25099503', NULL, 'kirupa', '233552468965', 'aaaaa12345', '{\"key\":\"7e1f65aa-028f-4b8c-9892-141adf9ba97a\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":10124.89,\"amount\":147022.515201}', '147022.52', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-30 10:39:11', NULL, 'D', 'BREF6835607', 'PUR25092693'),
(7, 'QT25099880', NULL, 'kirupa', '233552468965', 'aaaaa12345', '{\"key\":\"e03bc54b-7973-482b-b69c-4e437442154b\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":10124.89,\"amount\":147022.515201}', '147022.52', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-09-30 10:55:48', NULL, 'D', 'BREF6606733', 'PUR25098752'),
(8, 'QT25093164', NULL, 'darsni', '233552468965', 'aaaaa12345', '{\"key\":\"6273e988-e190-4f0b-aa7a-c6c71626f0c3\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":16,\"dust_weight\":0.06,\"stone_weight\":0,\"net_weight\":15.94,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.4782,\"final_weight\":15.4618,\"rate\":10124.89,\"amount\":156549.024202}', '156549.02', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 32, 32, 1, '2025-09-30 11:13:50', NULL, 'D', 'BREF1723681', 'PUR25098242'),
(9, 'QT25099329', NULL, 'raja', '123456789011', 'Abcde12345', '{\"key\":\"539add26-7abf-4ca8-a20a-a34866f40e55\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":12,\"dust_weight\":0.35,\"stone_weight\":0.15,\"net_weight\":11.5,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.345,\"final_weight\":11.155,\"rate\":10124.89,\"amount\":112943.14794999998}', '112943.15', NULL, NULL, 'RAJ', NULL, 'RAJ', 'D', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-30 11:27:03', '/uploads/purchases/temp/LiveCapture-1759231623478.jpg', 'D', 'BREF1114532', 'PUR25094360'),
(10, 'QT25091253', NULL, 'darsni', '233552468965', 'aaaaa12345', '{\"key\":\"9fd4249d-a7c0-406c-ac0c-3a45eeee1b39\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":13.6,\"dust_weight\":0.36,\"stone_weight\":0,\"net_weight\":13.24,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.3972,\"final_weight\":12.8428,\"rate\":10124.89,\"amount\":130031.937292}', '145745.77', NULL, NULL, 'sales_executive', NULL, NULL, '.', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-30 11:33:09', NULL, 'D', 'BREF8586451', 'PUR25098845'),
(11, 'QT25091253', NULL, 'darsni', '233552468965', 'aaaaa12345', '{\"key\":\"d78b2e4f-c04a-4b99-a74a-12cac8c113b8\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":1.76,\"dust_weight\":0.16,\"stone_weight\":0,\"net_weight\":1.6,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.04800000000000001,\"final_weight\":1.552,\"rate\":10124.89,\"amount\":15713.82928}', '145745.77', NULL, NULL, 'sales_executive', NULL, NULL, '.', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-30 11:33:09', NULL, 'D', 'BREF8586451', 'PUR25098845'),
(12, 'QT25092021', NULL, 'Raj', '123456789101', 'aaaaa23456', '{\"key\":\"1a8985c4-a195-422d-b955-b64ab9d69c83\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24,\"dust_weight\":0.3,\"stone_weight\":0.06,\"net_weight\":23.64,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.7092,\"final_weight\":22.9308,\"rate\":10124.89,\"amount\":232171.827612}', '232171.83', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-30 11:40:33', NULL, 'D', 'BREF3343420', 'PUR25092371'),
(13, 'QTRA009803', NULL, 'sample', '987654321987', 'AFZPK7190K', '{\"key\":\"b75756de-b27c-42d6-bf97-2d944953cd15\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":5,\"dust_weight\":0.1,\"stone_weight\":0.1,\"net_weight\":4.800000000000001,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.14400000000000002,\"final_weight\":4.656000000000001,\"rate\":12013.13,\"amount\":55933.13328}', '55933.13', NULL, NULL, 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 45, 45, 1, '2025-10-01 10:53:03', NULL, 'D', 'BREF1572791', 'PUR25107107'),
(14, 'QTRA007970', NULL, 'sample', '987654321987', 'AFZPK7190K', '{\"key\":\"6e56eb72-2506-4460-9ad3-27f048440524\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":4,\"dust_weight\":0.1,\"stone_weight\":0.1,\"net_weight\":3.8,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.11399999999999999,\"final_weight\":3.686,\"rate\":12013.13,\"amount\":44280.39718}', '44280.40', NULL, NULL, 'advertisement', NULL, NULL, 'test', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 45, 45, 1, '2025-10-01 11:31:10', NULL, 'D', 'BREF9544252', 'PUR25109967'),
(15, 'QTSR009171', NULL, 'kajo', '233552468965', 'aaaaa12345', '{\"key\":\"b4631c3e-b834-4148-ba63-847493db50da\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":12013.13,\"amount\":174441.459417}', '174441.46', NULL, NULL, 'manager', NULL, NULL, 'gfg', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-10-01 11:55:00', NULL, 'D', 'BREF8831302', 'PUR25105960'),
(16, 'QTSR008437', NULL, 'mari', '233759697894', 'BGGPV2379J', '{\"key\":\"7912d7cc-96b5-4646-92ff-8cf071084c03\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":15,\"dust_weight\":0.03,\"stone_weight\":0,\"net_weight\":14.97,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.44910000000000005,\"final_weight\":14.520900000000001,\"rate\":12013.13,\"amount\":174441.459417}', '174441.46', NULL, NULL, 'sales_executive', NULL, NULL, '.', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-10-01 12:33:10', NULL, 'D', 'BREF0361327', 'PUR25101710'),
(17, 'QT25093691', NULL, 'hari', '123456789101', 'aaaaa23456', '{\"key\":\"29e245b8-dae9-4733-ba9f-64bd44fd51b1\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":10,\"dust_weight\":0.23,\"stone_weight\":0,\"net_weight\":9.77,\"mcx_rate\":10124.89,\"margin_percent\":3,\"margin_weight\":0.29309999999999997,\"final_weight\":9.476899999999999,\"rate\":10124.89,\"amount\":95952.57004099998}', '95952.57', NULL, NULL, 'sales_executive', NULL, NULL, '2', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-10-01 12:34:45', NULL, 'D', 'BREF1291670', 'PUR25106681'),
(18, 'QTSR004983', NULL, 'test1', '233552468965', 'aaaaa12345', '{\"key\":\"a560b3d9-ea21-4c41-9565-06b15d6885c4\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":24.02,\"dust_weight\":0.48,\"stone_weight\":0.1,\"net_weight\":23.439999999999998,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.7031999999999999,\"final_weight\":22.7368,\"rate\":12013.13,\"amount\":273140.13418399997}', '273140.13', NULL, NULL, 'manager', NULL, NULL, 'yfty', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 32, 32, 1, '2025-10-02 05:47:31', NULL, 'D', 'BREF0252469', 'PUR25104342'),
(19, 'QTSR002194', NULL, 'test123', '233552468965', 'BGGPV2379J', '{\"key\":\"aa2a0fe0-bd1b-4507-9178-f1b5b23a69a1\",\"metal\":1,\"product\":1,\"sub_product\":\"chainn\",\"gross_weight\":5,\"dust_weight\":0.1,\"stone_weight\":0.3,\"net_weight\":4.6000000000000005,\"mcx_rate\":12013.13,\"margin_percent\":3,\"margin_weight\":0.138,\"final_weight\":4.462000000000001,\"rate\":12013.13,\"amount\":53602.58606}', '53602.59', NULL, '/uploads/purchases/temp/ornament-1759407947194.jpg', 'manager', NULL, NULL, '', 'completed', '3.00', 'cash', NULL, NULL, NULL, NULL, NULL, 31, 31, 1, '2025-10-02 12:25:47', '/uploads/purchases/temp/LiveCapture-1759407947195.jpg', 'D', 'BREF9890395', 'PUR25104195');

-- --------------------------------------------------------

--
-- Table structure for table `sub_products`
--

CREATE TABLE `sub_products` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `sub_product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sub_product_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `financial_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sub_products`
--

INSERT INTO `sub_products` (`id`, `product_id`, `sub_product_name`, `sub_product_code`, `description`, `status`, `created_at`, `created_by`, `updated_by`, `financial_id`) VALUES
(1, 1, 'chainn', 'GOCH54', NULL, 'active', '2025-07-12 11:11:13', 1, 33, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `is_active`, `created_at`) VALUES
(1, 'superadmin', 'superadmin@gmail.com', '$2b$10$5BsBcX2LmVy2zWEwGn8kCel.dwPx28BQ4lkfqwXwFvSzUIttSUzae', '4', 1, '2025-07-09 06:19:35'),
(31, 'mariya.j', 'KAJOJOVIN@GMAIL.COM', '$2b$10$U/FJrjTVJI13h2YekBOOsuPQborRA5r/ifO2Zr5QyLAgUZW4tl2Em', '5', 1, '2025-09-27 13:23:33'),
(32, 'sharmila.c', 'SHARMILASURESH61@GMAIL.COM', '$2b$10$a1u0TU75SzsWohglmbNlFuPsNwZf/z9n/f7sJYfR1R/yPfDmTkBOi', '5', 1, '2025-09-27 13:27:53'),
(33, 'm.subbiah', '123@GMAIL.COM', '$2b$10$Q8ugNcxNN5Rbi4hB1ZYNLO5sWjWVVFydRDq50ebuGQTu61i6JGUaG', '2', 1, '2025-09-27 14:26:13'),
(38, 'muthu.karuppasamy', '1234@GMAIL.COM', '$2b$10$syxLm3bTPgHKtGBBbfKZ/OEFXDpPkWSoIVBW/AOZ5Ie7A/e0w5yne', '1', 1, '2025-09-29 08:35:33'),
(39, 'balamurugan.g', 'balag851997@gmail.com', '$2b$10$BW5477bVYNtidfedCg0nsOZaYwZCp6/Gk1ihwoTk1p2qoT7ZH6Nei', '7', 1, '2025-09-29 08:48:59'),
(41, 'accounts.accounts', 'sankarvjss78@gmail.com', '$2b$10$WKmIWqqBcTXJxyAuGMxFCu7YPAcHkwuow029mONozYMSnkScosIR.', '6', 1, '2025-09-29 13:38:49'),
(42, 'Sundaram', 'ksrs87@gmail.com', '$2b$10$3TagrRKfCTA9vxzobcKJlOJOq1fNmEA9Fhv9ZMA.jaOKr0zWZbTc6', '2', 1, '2025-09-30 10:37:29'),
(43, 'VENKATESH', 'svenkateshkumar2695@gmail.com', '$2b$10$L5rvXNwockC/6Cy8mYLljekIRXrMOrrNsL7q6AE0YY9pZDarmL6Ca', '1', 1, '2025-09-30 10:43:56'),
(44, 'ANGAYARKANNI', 'aangayarkanni79@gmail.com', '$2b$10$yF//po4RiYlKYXoWP2tVTeMyLHYHvApillgOLojDxUGuhzuU8/dRC', '5', 1, '2025-09-30 11:06:28'),
(45, 'poongodi.k', 'poongodikaruppiah2004@gmail.com', '$2b$10$FplRvSLikIkQ.2zaKzblCOqmXexB32YGyJLTlAXVohaF4Bw2ve0ue', '5', 1, '2025-10-01 10:09:59'),
(46, 'headoffice', 'headoffice@gmail.com', '$2b$10$uRU1X24Xxd/Jz4Swvj7kpOlS4VDicfcTpi9Fv.PigVH1cFvH1OwoC', '8', 1, '2025-10-18 06:23:23');

-- --------------------------------------------------------

--
-- Table structure for table `user_details`
--

CREATE TABLE `user_details` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `user_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `first_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `branch_id` int DEFAULT NULL,
  `aadhar` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pan` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `permanent_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `reference_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference_contact` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `profile_photo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `resume` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `degree_certificate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `branches` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_details`
--

INSERT INTO `user_details` (`id`, `user_id`, `user_code`, `first_name`, `last_name`, `phone`, `company_id`, `branch_id`, `aadhar`, `pan`, `permanent_address`, `reference_name`, `reference_contact`, `joining_date`, `profile_photo`, `resume`, `degree_certificate`, `branches`) VALUES
(6, 1, 'AGSR-4300002CTl6', 'AKSHAY', 'admin', '9003343490', 12, 1, '987654312345', 'AFZPK7190G', 'rjpm', 'lachu', '1234567890', '2025-07-12', NULL, NULL, NULL, '[]'),
(9, 31, 'AGSR-4300002GEl9', 'MARIYA', 'J', '8524838698', 12, 1, '233759655278', 'VGGPV2379J', '3/207 R C STREET\r\nKHANSAPURAM\r\nVIRUDHUNAGAR DIST\r\n', 'INTERVIEW', '9999999999', '2025-07-09', '{\"name\":\"WhatsApp Image 2025-09-25 at 2.44.54 PM.jpeg\",\"url\":\"/uploads/users/31/profile_photo-1758979413179.jpeg\"}', '{\"name\":\"Aathar.pdf\",\"url\":\"/uploads/users/31/resume-1758979413180.pdf\"}', '{\"name\":\"WhatsApp Image 2025-09-25 at 2.44.54 PM.jpeg\",\"url\":\"/uploads/users/31/degree_certificate-1758979413180.jpeg\"}', '[]'),
(10, 32, 'AGSR-4300003XsYo', 'SHARMILA', 'C', '9798514477', 12, 1, '963892728757', 'RWJPS4512P', '265 SANTHIYA KINATRU STREET\r\nSRIVILLIPUTHUR - 626125', 'INTERVIEW', '9999999999', '2024-10-01', '{\"name\":\"WhatsApp Image 2025-09-25 at 2.44.54 PM.jpeg\",\"url\":\"/uploads/users/32/profile_photo-1758979673041.jpeg\"}', '{\"name\":\"Daily Attendance Report.pdf\",\"url\":\"/uploads/users/32/resume-1758979673041.pdf\"}', '{\"name\":\"WhatsApp Image 2025-09-25 at 2.44.54 PM.jpeg\",\"url\":\"/uploads/users/32/degree_certificate-1758979673042.jpeg\"}', '[]'),
(11, 33, 'AGSR-4300005qNgJ', 'M', 'SUBBIAH', '9787017320', 12, 1, '203843195916', 'SFQPS5042B', '66A , ARACHIPATTI PILLAYAR KOVIL STREET\r\nSRIVILLIPUTHUR - 626125\r\n', 'INTERVIEW', '9999999999', '2024-01-01', '{\"name\":\"ornament.jpg\",\"url\":\"/uploads/users/33/profile_photo-1758985377494.jpg\"}', NULL, NULL, '[]'),
(15, 38, 'AGSR-43000051IDp', 'Muthu', 'Karuppasamy', '8220194484', 12, 1, '924943187573', 'KQOPK3018Q', 'S/O VEERAMANIKANDAN\r\n69B BALA VINAYAGAR KOVIL STREET\r\nPULIYANGUDI,- 627855 TIRUNELVELI DIST', 'INTERVIEW', '9999999999', '2025-08-01', '{\"name\":\"ornament.jpg\",\"url\":\"/uploads/users/38/profile_photo-1759134933338.jpg\"}', NULL, NULL, '[1,5]'),
(16, 39, 'AGRA-2770006fOZz', 'Balamurugan', 'G', '8489520724', 12, 5, '523417766089', 'EOMPB6575K', 'C/O GURUSAMY\r\n182 SOUTH STREET\r\nK THOTTIAPTTI\r\nRAJAPALAYAM - 626 117\r\nVIRUDHUNAGAR DIST', 'INTERVIEW', '9999999999', '2024-09-01', '{\"name\":\"ornament.jpg\",\"url\":\"/uploads/users/39/profile_photo-1759135739787.jpg\"}', NULL, NULL, '[1,5]'),
(18, 41, 'AGSR-4300007apUE', 'Accounts', 'Accounts', '7826027176', 12, 1, '123456789012', 'CJPXV6503M', '748 A1, Gandhi nagar, Malayadipatti,', 'Sankar', '9876543210', '2025-09-29', NULL, NULL, NULL, '[]'),
(19, 42, 'AGRA-2770008LEU1', 'Sundaram', 'K', '9597747788', 12, 5, '553295467642', 'CRMPS1585B', '85/G1 KURUNJI NAGAR\r\nNORTH MALAIYADIPATTI\r\nRAJAPALAYAM - 626117', 'INTERVIEW', '9999999999', '2025-07-21', '{\"name\":\"ornament.jpg\",\"url\":\"/uploads/users/42/profile_photo-1759228649754.jpg\"}', '{\"name\":\"Aadhar.docx\",\"url\":\"/uploads/users/42/resume-1759228649755.docx\"}', '{\"name\":\"WhatsApp Image 2025-09-29 at 2.28.37 PM.jpeg\",\"url\":\"/uploads/users/42/degree_certificate-1759228649755.jpeg\"}', '[]'),
(20, 43, 'AGRA-27700093XOS', 'VENKATESHKUMAR', 'S', '7538892695', 12, 5, '679076937301', 'CIYPV5227L', '79C KARUPPAGNANIYAR KOVIL STREET\r\nRAJAPALAYAM - 626117', 'INTERVIEW', '9999999998', '2025-07-24', '{\"name\":\"ornament.jpg\",\"url\":\"/uploads/users/43/profile_photo-1759229036485.jpg\"}', '{\"name\":\"Aadhar.docx\",\"url\":\"/uploads/users/43/resume-1759229036485.docx\"}', '{\"name\":\"WhatsApp Image 2025-09-29 at 2.28.37 PM.jpeg\",\"url\":\"/uploads/users/43/degree_certificate-1759229036485.jpeg\"}', '[]'),
(21, 44, 'AGRA-2770010c6o3', 'ANGAYARKANNI', 'B', '6382752996', 12, 5, '812792711250', 'FPNPA1675G', '23 AMBEDKAR STREET\r\nMAMSAPURAM\r\nRAJAPALAYAM - 626117', 'INTERVIEW', '9999999977', '2025-07-16', '{\"name\":\"ornament.jpg\",\"url\":\"/uploads/users/44/profile_photo-1759230388398.jpg\"}', '{\"name\":\"Aadhar.docx\",\"url\":\"/uploads/users/44/resume-1759230388398.docx\"}', '{\"name\":\"WhatsApp Image 2025-09-29 at 2.28.37 PM.jpeg\",\"url\":\"/uploads/users/44/degree_certificate-1759230388398.jpeg\"}', '[]'),
(22, 45, 'AGRA-2770010IDfu', 'Poongodi', 'K', '6374940394', 12, 5, '394783938323', 'QNAPK8145P', '114, Meenatchi Thotta street, Mamsapuram.', 'INTERVIEW', '9876543210', '2025-06-10', NULL, NULL, NULL, '[]'),
(23, 46, 'AGSR-4300011qyq0', 'head', 'office', '9876543210', 12, 1, '123456789012', 'CJPXV6503M', '748a1\r\nGandhinagar', 'dfg', '9876543210', '2025-10-18', '{\"name\":\"1000_F_626508560_0haD67maNFpmolZL3zgWIOHfEgBKvs53.jpg\",\"url\":\"/uploads/users/46/profile_photo-1760768603311.jpg\"}', NULL, NULL, '[]');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_head`
--
ALTER TABLE `account_head`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cat_id` (`cat_id`);

--
-- Indexes for table `account_head_creation`
--
ALTER TABLE `account_head_creation`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `branch_id` (`branch_id`),
  ADD KEY `branches_ibfk_1` (`company_id`);

--
-- Indexes for table `branch_documents`
--
ALTER TABLE `branch_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_code` (`category_code`);

--
-- Indexes for table `collections`
--
ALTER TABLE `collections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_id` (`purchase_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `financial_id` (`financial_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `company_code` (`company_code`),
  ADD UNIQUE KEY `gst_no` (`gst_no`),
  ADD KEY `financial_id` (`financial_id`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `company_documents`
--
ALTER TABLE `company_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_bank_accounts`
--
ALTER TABLE `customer_bank_accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `financial_id` (`financial_id`);

--
-- Indexes for table `financial_years`
--
ALTER TABLE `financial_years`
  ADD PRIMARY KEY (`id`),
  ADD KEY `financial_year_code` (`financial_year_code`);

--
-- Indexes for table `master_grouping`
--
ALTER TABLE `master_grouping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mcx_rates`
--
ALTER TABLE `mcx_rates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `melt`
--
ALTER TABLE `melt`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `melting_purchase`
--
ALTER TABLE `melting_purchase`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_id` (`purchase_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `financial_id` (`financial_id`);

--
-- Indexes for table `metals`
--
ALTER TABLE `metals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `metal_code` (`metal_code`);

--
-- Indexes for table `metal_prices`
--
ALTER TABLE `metal_prices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pledge_final_quotation`
--
ALTER TABLE `pledge_final_quotation`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `quotation_id` (`quotation_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `financial_id` (`financial_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `pledge_items`
--
ALTER TABLE `pledge_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pledge_quotations`
--
ALTER TABLE `pledge_quotations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `quotation_id` (`quotation_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `financial_id` (`financial_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_code` (`product_code`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_id` (`purchase_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `financial_id` (`financial_id`);

--
-- Indexes for table `purchase_payments`
--
ALTER TABLE `purchase_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_id` (`purchase_id`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Indexes for table `purities`
--
ALTER TABLE `purities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `quotation_id` (`quotation_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `financial_id` (`financial_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `quotation_approvals`
--
ALTER TABLE `quotation_approvals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `receipt`
--
ALTER TABLE `receipt`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_role_unique` (`role_id`),
  ADD KEY `idx_financial_id` (`financial_id`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_id` (`purchase_id`);

--
-- Indexes for table `state`
--
ALTER TABLE `state`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `financial_id` (`financial_id`);

--
-- Indexes for table `sub_products`
--
ALTER TABLE `sub_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sub_product_code` (`sub_product_code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_details`
--
ALTER TABLE `user_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `user_code` (`user_code`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_head`
--
ALTER TABLE `account_head`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `account_head_creation`
--
ALTER TABLE `account_head_creation`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `branch_documents`
--
ALTER TABLE `branch_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `collections`
--
ALTER TABLE `collections`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `company_documents`
--
ALTER TABLE `company_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `customer_bank_accounts`
--
ALTER TABLE `customer_bank_accounts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `financial_years`
--
ALTER TABLE `financial_years`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `master_grouping`
--
ALTER TABLE `master_grouping`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `mcx_rates`
--
ALTER TABLE `mcx_rates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `melt`
--
ALTER TABLE `melt`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `melting_purchase`
--
ALTER TABLE `melting_purchase`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `metals`
--
ALTER TABLE `metals`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `metal_prices`
--
ALTER TABLE `metal_prices`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `pledge_final_quotation`
--
ALTER TABLE `pledge_final_quotation`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pledge_items`
--
ALTER TABLE `pledge_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `pledge_quotations`
--
ALTER TABLE `pledge_quotations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `purchase_payments`
--
ALTER TABLE `purchase_payments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purities`
--
ALTER TABLE `purities`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `quotations`
--
ALTER TABLE `quotations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `quotation_approvals`
--
ALTER TABLE `quotation_approvals`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `receipt`
--
ALTER TABLE `receipt`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `state`
--
ALTER TABLE `state`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stock`
--
ALTER TABLE `stock`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `sub_products`
--
ALTER TABLE `sub_products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `user_details`
--
ALTER TABLE `user_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account_head`
--
ALTER TABLE `account_head`
  ADD CONSTRAINT `account_head_ibfk_1` FOREIGN KEY (`cat_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `branches`
--
ALTER TABLE `branches`
  ADD CONSTRAINT `branches_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `branch_documents`
--
ALTER TABLE `branch_documents`
  ADD CONSTRAINT `branch_documents_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`financial_id`) REFERENCES `financial_years` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `companies_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `company_documents`
--
ALTER TABLE `company_documents`
  ADD CONSTRAINT `company_documents_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `roles`
--
ALTER TABLE `roles`
  ADD CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_details`
--
ALTER TABLE `user_details`
  ADD CONSTRAINT `user_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_details_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `user_details_ibfk_3` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
