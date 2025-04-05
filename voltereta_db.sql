-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:8889
-- Tiempo de generación: 05-04-2025 a las 17:10:03
-- Versión del servidor: 5.7.44
-- Versión de PHP: 8.2.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `voltereta_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cash_flow`
--

CREATE TABLE `cash_flow` (
  `id` int(11) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `concept` varchar(100) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `role` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `employees`
--

INSERT INTO `employees` (`id`, `name`, `role`) VALUES
(9, 'Aida', 'admin');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu`
--

CREATE TABLE `menu` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(6,2) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu_categories`
--

CREATE TABLE `menu_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `menu_categories`
--

INSERT INTO `menu_categories` (`id`, `name`, `description`) VALUES
(6, 'chino', ''),
(7, 'asiatico', ''),
(9, 'japones', 'sushi'),
(10, 'sushi', 'sushi');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `tableNumber` int(11) DEFAULT '0',
  `customer` varchar(100) DEFAULT NULL,
  `status` enum('pending','in_process','done','delivered') DEFAULT 'pending',
  `comments` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `orders`
--

INSERT INTO `orders` (`id`, `tableNumber`, `customer`, `status`, `comments`, `createdAt`) VALUES
(1, 1, 'Luis', 'delivered', 'Sin gluten', '2025-03-26 12:54:32'),
(2, 1, 'Jose', 'delivered', 'Quiere la paella cruda', '2025-03-27 00:11:06'),
(3, 1, 'prueba', 'delivered', 'prueba', '2025-03-27 12:10:14'),
(4, 4, 'Jose', 'delivered', 'Sin gluten', '2025-03-27 12:25:14'),
(5, 1, 'Luis', 'delivered', 'Sin gluten', '2025-03-27 17:42:18'),
(6, 1, 'Luis', 'pending', 'Sin gluten', '2025-04-04 20:33:38'),
(7, 2, 'Luis', 'pending', '2', '2025-04-04 20:46:39'),
(8, 23, 'aaaa', 'pending', 'aaaaa', '2025-04-04 20:47:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `menuItemId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `customerName` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `guests` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `reservations`
--

INSERT INTO `reservations` (`id`, `customerName`, `date`, `time`, `guests`) VALUES
(1, 'Luis', '2025-09-10', '13:00:00', 4),
(2, 'luis', '2025-09-10', '12:09:00', 4),
(3, 'prueba2', '2025-06-25', '12:24:00', 8),
(4, 'lusi', '2027-10-20', '17:42:00', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'abierto',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `user_id`, `subject`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 8, 'a', 'a', 'cerrado', '2025-03-29 12:16:58', '2025-03-29 12:44:13'),
(2, 8, 'Boton no funciona', 'aaa', 'abierto', '2025-03-29 12:20:55', '2025-03-29 12:20:55'),
(3, 16, 'Boton no funciona', 'aa', 'abierto', '2025-03-29 12:27:43', '2025-03-29 12:27:43'),
(4, 8, 'a', 's', 'en_proceso', '2025-03-29 12:54:28', '2025-03-30 15:05:47'),
(5, 21, 'No funciona la aplicacion', 'aaAAAAA', 'cerrado', '2025-03-30 17:32:04', '2025-03-30 17:32:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` enum('admin','chef','mesero','gerente') DEFAULT 'mesero',
  `fullname` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `profile_pic` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `fullname`, `email`, `profile_pic`) VALUES
(8, 'luis', '$2b$10$NgqcquQSXI4F6yZ0zfba2Omt4yOHxnTcYgwa.f1Xt.zhN5ofH54O2', 'admin', NULL, NULL, '/uploads/profile_pics/user_8_1743373623064.png'),
(16, 'aida', '$2b$10$SPTlN2JukZJD3qjALkbiU.QKVry9hoQp4w7pYHX9deXv/XNjnzCBe', 'mesero', 'aida utrera', 'aida@gmail.com', '/uploads/profile_pics/user_16_1743373375298.png'),
(17, 'jahir', '$2b$10$3xloYjYj8Ahgzgf3bK2EnOURbclLkjyTnZLcBeBs72qjLicJgTzWe', 'gerente', 'jahir rodriguez', 'jahir@gmail.com', 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.lavanguardia.com%2Fpeliculas-series%2Fpersonas%2Fbrad-pitt-287&psig=AOvVaw05fC9GctQF57GWKEyc7UrK&ust=1743248172986000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCPiu39LXrIwDFQAAAAAdAAAAABAE'),
(18, 'aida', '$2b$10$aTIF5gSlAhxqJZHIAB2AT.nMaa9d7/4LwrhJiGR.bHADVt21OWZny', 'mesero', 'aida utrera', 'aida@gmail.com', 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.lavanguardia.com%2Fpeliculas-series%2Fpersonas%2Fbrad-pitt-287&psig=AOvVaw05fC9GctQF57GWKEyc7UrK&ust=1743248172986000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCPiu39LXrIwDFQAAAAAdAAAAABAE'),
(19, 'aida1', '$2b$10$q4CL/wVYxC3msldBZNlFkutWZZ7zH16mNkxhESKU2y4vveMlhu3ta', 'admin', 'aida utrera', 'aida@gmail.com', 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.lavanguardia.com%2Fpeliculas-series%2Fpersonas%2Fbrad-pitt-287&psig=AOvVaw05fC9GctQF57GWKEyc7UrK&ust=1743248172986000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCPiu39LXrIwDFQAAAAAdAAAAABAE'),
(20, 'jahir', '$2b$10$tFSAbZtJRErSAC2VsIIXhOaTjPJpcOoFqCu8iX8BiNgGWX7FwlW4S', 'admin', 'aida utrera', 'aida@gmail.com', 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.lavanguardia.com%2Fpeliculas-series%2Fpersonas%2Fbrad-pitt-287&psig=AOvVaw05fC9GctQF57GWKEyc7UrK&ust=1743248172986000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCPiu39LXrIwDFQAAAAAdAAAAABAE'),
(21, 'aida_utrera', '$2b$10$DaRq5dz.H/mdKSf6.S7dau/414ksenhh7cBVe6bRmBs08C8izCMT2', 'mesero', 'Aida Utrera', 'aida@gmail.com', 'https://megahit.fm/wp-content/uploads/2024/11/dua-lipa-akbee75ukpi7cr1k.jpg');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cash_flow`
--
ALTER TABLE `cash_flow`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orderId` (`orderId`);

--
-- Indices de la tabla `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_category` (`category_id`);

--
-- Indices de la tabla `menu_categories`
--
ALTER TABLE `menu_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orderId` (`orderId`),
  ADD KEY `order_items_ibfk_2` (`menuItemId`);

--
-- Indices de la tabla `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cash_flow`
--
ALTER TABLE `cash_flow`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `menu_categories`
--
ALTER TABLE `menu_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`);

--
-- Filtros para la tabla `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`menuItemId`) REFERENCES `menu` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `support_tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
