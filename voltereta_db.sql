-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:8889
-- Tiempo de generación: 07-05-2025 a las 21:50:33
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

--
-- Volcado de datos para la tabla `cash_flow`
--

INSERT INTO `cash_flow` (`id`, `type`, `amount`, `concept`, `createdAt`) VALUES
(1, 'income', 125.50, 'Ventas del día - Comidas', '2025-04-25 22:15:00'),
(2, 'income', 87.25, 'Ventas del día - Bebidas', '2025-04-25 22:20:00'),
(3, 'expense', 350.00, 'Compra de ingredientes', '2025-04-26 09:30:00'),
(4, 'expense', 120.00, 'Pago servicio electricidad', '2025-04-26 14:25:00'),
(5, 'income', 210.75, 'Ventas del día - Comidas', '2025-04-26 22:00:00'),
(6, 'income', 95.00, 'Ventas del día - Bebidas', '2025-04-26 22:05:00'),
(7, 'expense', 80.00, 'Mantenimiento equipo cocina', '2025-04-27 10:15:00');

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
(1, 'Carlos García', 'admin'),
(2, 'María López', 'mesero'),
(3, 'Juan Rodríguez', 'chef'),
(4, 'Ana Martínez', 'gerente');

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

--
-- Volcado de datos para la tabla `invoices`
--

INSERT INTO `invoices` (`id`, `orderId`, `total`, `createdAt`) VALUES
(1, 3, 25.00, '2025-04-25 15:45:20'),
(2, 4, 54.50, '2025-04-25 19:30:45'),
(3, 6, 39.50, '2025-04-26 21:10:15');

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

--
-- Volcado de datos para la tabla `menu`
--

INSERT INTO `menu` (`id`, `name`, `price`, `category_id`, `imageUrl`) VALUES
(1, 'Paella Valenciana', 18.50, 1, '/uploads/menu/paella.jpg'),
(2, 'Filete de Ternera', 22.00, 2, '/uploads/menu/filete.jpg'),
(3, 'Ensalada César', 10.50, 3, '/uploads/menu/ensalada_cesar.jpg'),
(4, 'Gazpacho', 8.00, 3, '/uploads/menu/gazpacho.jpg'),
(5, 'Tortilla Española', 9.50, 1, '/uploads/menu/tortilla.jpg'),
(6, 'Sushi Variado', 24.00, 4, '/uploads/menu/sushi.jpg'),
(7, 'Pasta Carbonara', 12.50, 5, '/uploads/menu/carbonara.jpg');

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
(1, 'Arroces', 'Platos principales a base de arroz'),
(2, 'Carnes', 'Selección de carnes de primera calidad'),
(3, 'Entrantes', 'Platos para iniciar la comida'),
(4, 'Asiático', 'Especialidades de cocina asiática'),
(5, 'Pasta', 'Platos de pasta italiana'),
(6, 'Postres', 'Deliciosos postres caseros'),
(8, 'Zumos', 'Zumos tropicales');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `newsletters`
--

CREATE TABLE `newsletters` (
  `id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body_html` text NOT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `newsletters`
--

INSERT INTO `newsletters` (`id`, `subject`, `body_html`, `scheduled_at`, `sent_at`, `created_at`) VALUES
(1, 'Nuevo menú de primavera', '<h1>¡Descubre nuestro nuevo menú de primavera!</h1><p>Hemos preparado deliciosas especialidades con productos de temporada.</p>', '2025-05-01 10:00:00', NULL, '2025-04-24 14:20:00'),
(2, 'Promoción especial fin de semana', '<h1>25% de descuento en cenas</h1><p>Este fin de semana disfruta de un 25% de descuento en todas las cenas.</p>', '2025-05-05 08:00:00', NULL, '2025-04-25 11:30:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `newsletter_recipients`
--

CREATE TABLE `newsletter_recipients` (
  `id` int(11) NOT NULL,
  `newsletter_id` int(11) NOT NULL,
  `subscriber_id` int(11) NOT NULL,
  `status` enum('pending','sent','failed') DEFAULT 'pending',
  `sent_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `newsletter_recipients`
--

INSERT INTO `newsletter_recipients` (`id`, `newsletter_id`, `subscriber_id`, `status`, `sent_at`) VALUES
(1, 1, 1, 'pending', NULL),
(2, 1, 2, 'pending', NULL),
(3, 1, 3, 'pending', NULL),
(4, 2, 1, 'pending', NULL),
(5, 2, 2, 'pending', NULL),
(6, 2, 3, 'pending', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `tableNumber` int(11) DEFAULT '0',
  `customer` varchar(100) DEFAULT NULL,
  `status` enum('pedido_realizado','en_proceso','finalizado','entregado','cancelado') NOT NULL DEFAULT 'pedido_realizado',
  `comments` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `orders`
--

INSERT INTO `orders` (`id`, `tableNumber`, `customer`, `status`, `comments`, `createdAt`) VALUES
(1, 3, 'Pedro Sánchez', 'finalizado', 'Sin cebolla', '2025-04-25 12:30:00'),
(2, 5, 'Laura Gómez', 'finalizado', 'Extra de salsa', '2025-04-25 13:15:45'),
(3, 2, 'Miguel Torres', 'finalizado', 'Sin gluten', '2025-04-25 14:20:10'),
(4, 7, 'Carmen Ruiz', 'finalizado', 'Alérgico a frutos secos', '2025-04-25 18:40:22'),
(5, 4, 'Fernando López', 'cancelado', 'Cliente cambió de opinión', '2025-04-26 19:10:05'),
(6, 1, 'Elena Martín', 'finalizado', 'Preferencia de cocción: al punto', '2025-04-26 20:05:30'),
(7, 6, 'Roberto Núñez', 'finalizado', '', '2025-04-27 13:25:15'),
(8, 3, 'Sofía Castro', 'finalizado', 'Sin lácteos', '2025-04-27 14:10:40'),
(9, 3, 'Luis', 'finalizado', 'aaa', '2025-04-27 16:23:15'),
(10, 1, 'luis', 'finalizado', 'es alergico a la vida', '2025-04-29 12:37:43'),
(11, 20, 'luis', 'finalizado', '', '2025-04-29 12:43:28'),
(12, 1, 'luis', 'finalizado', '', '2025-04-29 12:45:48'),
(13, 1, 'luis', 'cancelado', '', '2025-04-29 12:49:25'),
(14, 1, 'luis', 'cancelado', '', '2025-04-29 12:51:41'),
(15, 123, 'luis', 'finalizado', '', '2025-04-29 12:52:07'),
(16, 32, 'luis', 'finalizado', '', '2025-04-29 12:52:40'),
(17, 32, 'luis', 'cancelado', '', '2025-04-29 12:52:40'),
(18, 1, 'luis', 'finalizado', '', '2025-04-29 12:57:09'),
(19, 1, 'luis', 'finalizado', '', '2025-04-29 15:21:43'),
(20, 1, 'luis', 'cancelado', '', '2025-04-29 15:23:42'),
(21, 1, 'luis', 'cancelado', '', '2025-04-29 15:23:42'),
(22, 4, 'luissss', 'finalizado', '', '2025-04-29 15:23:56'),
(23, 4, 'luissss', 'cancelado', '', '2025-04-29 15:23:56'),
(24, 4, 'luissss', 'cancelado', '', '2025-04-29 15:23:56'),
(25, 3, 'luis', 'finalizado', '', '2025-04-29 15:46:42'),
(26, 3, 'luis', 'finalizado', '', '2025-04-29 15:47:00'),
(27, 3, 'luis', 'cancelado', '', '2025-04-29 15:47:00'),
(28, 2, 'luis', 'cancelado', '', '2025-04-29 15:57:24'),
(29, 1, 'luis', 'cancelado', '', '2025-04-29 15:59:34'),
(30, 2, 'luis', 'cancelado', '', '2025-04-29 16:02:23'),
(31, 3, 'luis', 'pedido_realizado', 'El filete a su punto', '2025-05-03 18:40:46');

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

--
-- Volcado de datos para la tabla `order_items`
--

INSERT INTO `order_items` (`id`, `orderId`, `menuItemId`, `quantity`) VALUES
(1, 1, 1, 2),
(2, 1, 3, 1),
(3, 2, 2, 1),
(5, 3, 4, 1),
(6, 3, 5, 1),
(8, 4, 6, 2),
(9, 4, 7, 1),
(10, 5, 2, 1),
(11, 6, 1, 1),
(12, 6, 3, 2),
(13, 7, 5, 1),
(14, 7, 7, 1),
(15, 8, 6, 3),
(17, 10, 7, 4),
(18, 10, 6, 4),
(19, 11, 3, 1),
(20, 12, 7, 1),
(21, 13, 7, 1),
(22, 13, 6, 1),
(23, 14, 7, 1),
(24, 15, 7, 1),
(25, 16, 4, 1),
(26, 17, 4, 1),
(27, 18, 7, 1),
(28, 19, 7, 1),
(29, 19, 5, 1),
(30, 19, 4, 1),
(31, 20, 7, 1),
(32, 21, 7, 1),
(33, 22, 6, 1),
(34, 23, 6, 1),
(35, 24, 6, 1),
(36, 25, 6, 1),
(37, 25, 5, 1),
(38, 26, 7, 1),
(39, 26, 5, 1),
(40, 27, 7, 1),
(41, 27, 5, 1),
(42, 28, 6, 1),
(43, 28, 5, 1),
(44, 29, 7, 1),
(45, 30, 7, 1),
(46, 31, 7, 5),
(47, 31, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `customerName` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `guests` int(11) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `reservations`
--

INSERT INTO `reservations` (`id`, `customerName`, `date`, `time`, `guests`, `phone`, `notes`) VALUES
(1, 'Alberto Moreno', '2025-04-29', '14:00:00', 5, NULL, NULL),
(2, 'Pilar Domínguez', '2025-05-11', '21:00:00', 2, NULL, NULL),
(3, 'Mario Vázquez', '2025-05-15', '13:30:00', 6, NULL, NULL),
(4, 'Cristina Herrera', '2025-05-17', '20:15:00', 3, NULL, NULL),
(5, 'Javier Ortiz', '2025-05-18', '14:45:00', 5, NULL, NULL),
(6, 'Silvia Mendoza', '2025-05-20', '19:30:00', 2, NULL, NULL),
(7, 'aida utrera', '2025-04-29', '11:49:00', 20, NULL, NULL),
(10, 'Luis', '2025-05-03', '20:30:00', 5, '722152111', 'Alérgico al gluten');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subscribers`
--

CREATE TABLE `subscribers` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `subscribers`
--

INSERT INTO `subscribers` (`id`, `email`, `first_name`, `last_name`, `active`, `created_at`) VALUES
(1, 'cliente1@ejemplo.com', 'Antonio', 'Fernández', 1, '2025-03-15 10:20:00'),
(2, 'cliente2@ejemplo.com', 'Lucía', 'González', 1, '2025-03-18 14:35:00'),
(3, 'cliente3@ejemplo.com', 'Manuel', 'Pérez', 1, '2025-04-02 09:45:00'),
(4, 'cliente4@ejemplo.com', 'Beatriz', 'Jiménez', 0, '2025-04-10 16:30:00');

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
(1, 1, 'Error al generar factura', 'No puedo generar la factura para el pedido #4', 'en_proceso', '2025-04-20 10:24:00', '2025-04-29 13:01:59'),
(2, 2, 'Problema con el módulo de reservas', 'El calendario no muestra correctamente las horas disponibles', 'en_proceso', '2025-04-21 14:35:15', '2025-04-22 09:10:20'),
(3, 3, 'No puedo modificar menú', 'Al intentar editar un elemento del menú me da error', 'abierto', '2025-04-23 11:42:30', '2025-04-23 11:42:30'),
(4, 1, 'Impresora de cocina no funciona', 'Los tickets no se imprimen en la impresora de cocina', 'cerrado', '2025-04-25 16:28:45', '2025-04-26 08:30:10'),
(5, 6, 'Boton no funciona', 'aa', 'cerrado', '2025-04-27 14:28:11', '2025-04-27 14:32:07'),
(6, 6, 'Boton no funciona', 'hgghghghgh', 'cerrado', '2025-04-27 14:32:18', '2025-04-27 14:32:21'),
(7, 6, 'Boton no funciona', 'a', 'cerrado', '2025-04-29 13:02:06', '2025-05-03 16:43:28'),
(8, 6, 'Seccion pedidos no va', 'Hay que arreglarlo urgentemente!!!', 'cerrado', '2025-05-03 16:42:51', '2025-05-03 16:43:24');

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
(1, 'admin', '$2b$10$WkV.iY3K6DMQKZpvlgHFHusFjn/tfWkbH52AlYkyTuTaYvXUpXBrm', 'admin', 'Administrador Sistema', 'admin@voltereta.com', '/uploads/profile_pics/default_admin.jpg'),
(2, 'mesero2', '$2b$10$VtLtTz7dNEIWEtJbo76/aeJw.HPVN6YJXMFtj7izLtMy/WRqBH1wu', 'chef', 'Pablo Sánchez', 'pablo@voltereta.com', NULL),
(3, 'chef1', '$2b$10$ZdFOeEKv/.Ty5MyYdQoUHO4QCyrfoalX2IG5SUSOsCgJ/4IksVV2W', 'chef', 'Isabel Martínez', 'isabel@voltereta.com', '/uploads/profile_pics/default_chef.jpg'),
(4, 'gerente1', '$2b$10$6FTme/V2oDAxqjN4/NWo/.jSvI9ZoP9doZPCztrGbbqYFBDVQ83Rq', 'gerente', 'David Gutiérrez', 'david@voltereta.com', '/uploads/profile_pics/default_manager.jpg'),
(6, 'jose', '$2b$10$fmIb4Z.t.q59r/B7NCzWUOGThAiJTuXsxNQVbXj/uwonVXgq.QW56', 'admin', 'José Administrador', 'jose@voltereta.com', '/uploads/profile_pics/user_6_1746290534031.jpg');

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
-- Indices de la tabla `newsletters`
--
ALTER TABLE `newsletters`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `newsletter_recipients`
--
ALTER TABLE `newsletter_recipients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `newsletter_id` (`newsletter_id`),
  ADD KEY `subscriber_id` (`subscriber_id`);

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
-- Indices de la tabla `subscribers`
--
ALTER TABLE `subscribers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `menu_categories`
--
ALTER TABLE `menu_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `newsletters`
--
ALTER TABLE `newsletters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `newsletter_recipients`
--
ALTER TABLE `newsletter_recipients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT de la tabla `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `subscribers`
--
ALTER TABLE `subscribers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
-- Filtros para la tabla `newsletter_recipients`
--
ALTER TABLE `newsletter_recipients`
  ADD CONSTRAINT `newsletter_recipients_ibfk_1` FOREIGN KEY (`newsletter_id`) REFERENCES `newsletters` (`id`),
  ADD CONSTRAINT `newsletter_recipients_ibfk_2` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`);

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
