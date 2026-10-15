-- 1:M 
-- One customer(user) has many deliveries
-- But one delivery has only one customer

-- One delivery type (like Bike) is used by many deliveries.
-- But one delivery has only one type

-- One delivery has many proofs of delivery (photo, signature, COD collected)

-- M:N
-- (join table courier_zones)
-- One courier covers many zones
-- And one zone has many couriers


-- 1:1
-- apart from delivery details. One delivery has one payment row


CREATE TABLE IF NOT EXISTS users (

  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'courier', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

  CREATE TABLE IF NOT EXISTS delivery_types (

  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  image_url VARCHAR(255),
  base_fee DECIMAL(8,2) NOT NULL,
  per_km_rate DECIMAL(6,2) NOT NULL,
  extra_stop_fee DECIMAL(6,2) NOT NULL,
  max_weight_kg DECIMAL(6,2) NOT NULL,
  max_length_cm SMALLINT UNSIGNED NOT NULL,
  max_width_cm SMALLINT UNSIGNED NOT NULL,
  max_height_cm SMALLINT UNSIGNED NOT NULL,
  delivery_window_hours TINYINT UNSIGNED NULL,
  suitable_for VARCHAR(255),
  remarks VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- for center_lag and center_lat
-- Distance without live maps. We can calculate km between the pickup zone centre and drop-off zone centre with a formula
-- eg: Raffles Place → Tuas ≈ 24 km
CREATE TABLE IF NOT EXISTS zones (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  center_lat DECIMAL(9,6) NOT NULL,
  center_lng DECIMAL(9,6) NOT NULL,
  outskirt_surcharge DECIMAL(6,2) NOT NULL DEFAULT 0,
  restricted_surcharge DECIMAL(6,2) NOT NULL DEFAULT 0,
  erp_surcharge DECIMAL(6,2) NOT NULL DEFAULT 0,
  restricted_note VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS deliveries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tracking_no VARCHAR(20) NOT NULL UNIQUE,
  customer_id INT UNSIGNED NOT NULL,
  courier_id INT UNSIGNED NULL,
  delivery_type_id INT UNSIGNED NOT NULL,
  pickup_zone_id INT UNSIGNED NOT NULL,
  dropoff_zone_id INT UNSIGNED NOT NULL,
  pickup_address VARCHAR(255) NOT NULL,
  pickup_contact_name VARCHAR(100) NOT NULL,
  pickup_contact_phone VARCHAR(20) NOT NULL,
  dropoff_address VARCHAR(255) NOT NULL,
  dropoff_contact_name VARCHAR(100) NOT NULL,
  dropoff_contact_phone VARCHAR(20) NOT NULL,
  instructions VARCHAR(255),
  allow_doorstep BOOLEAN NOT NULL DEFAULT FALSE, -- No permission unless the customer allows
  weight_kg DECIMAL(6,2) NOT NULL,
  length_cm SMALLINT UNSIGNED NOT NULL,
  width_cm SMALLINT UNSIGNED NOT NULL,
  height_cm SMALLINT UNSIGNED NOT NULL,
  extra_stops TINYINT UNSIGNED NOT NULL DEFAULT 0,
  distance_km DECIMAL(6,2) NOT NULL,
  base_fee DECIMAL(8,2) NOT NULL,
  distance_fee DECIMAL(8,2) NOT NULL,
  stops_fee DECIMAL(8,2) NOT NULL,
  surcharge_total DECIMAL(8,2) NOT NULL,
  total_fee DECIMAL(8,2) NOT NULL,
  status ENUM('pending','assigned','picked_up','out_for_delivery','delivered','failed','returned','cancelled') NOT NULL DEFAULT 'pending',
  scheduled_pickup_at DATETIME NOT NULL,
  deadline_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (courier_id) REFERENCES users(id),
  FOREIGN KEY (delivery_type_id) REFERENCES delivery_types(id),
  FOREIGN KEY (pickup_zone_id) REFERENCES zones(id),
  FOREIGN KEY (dropoff_zone_id) REFERENCES zones(id)
);

CREATE TABLE IF NOT EXISTS delivery_status_history (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  delivery_id INT UNSIGNED NOT NULL,
  old_status ENUM('pending','assigned','picked_up','out_for_delivery','delivered','failed','returned','cancelled') NULL,
  new_status ENUM('pending','assigned','picked_up','out_for_delivery','delivered','failed','returned','cancelled') NOT NULL,
  changed_by INT UNSIGNED NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS courier_zones (
  courier_id INT UNSIGNED NOT NULL,
  zone_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (courier_id, zone_id),
  FOREIGN KEY (courier_id) REFERENCES users(id),
  FOREIGN KEY (zone_id) REFERENCES zones(id)
);

CREATE TABLE IF NOT EXISTS proof_of_delivery (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  delivery_id INT UNSIGNED NOT NULL,
  proof_type ENUM('photo','signature_digital','signature_paper','cod_collected') NOT NULL,
  file_url VARCHAR(255) NULL,
  received_by VARCHAR(100) NULL,
  remarks VARCHAR(255),
  recorded_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS delivery_payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  delivery_id INT UNSIGNED NOT NULL UNIQUE,
  method ENUM('cod','paynow','paypal','credit_card') NOT NULL,
  amount DECIMAL(8,2) NOT NULL,
  status ENUM('unpaid','paid') NOT NULL DEFAULT 'unpaid',
  paid_at DATETIME NULL,
  collected_by INT UNSIGNED NULL,
  return_fee DECIMAL(8,2) NOT NULL DEFAULT 0,
  return_method ENUM('cash','paynow','paypal','credit_card') NULL,
  return_status ENUM('not_needed','unpaid','paid') NOT NULL DEFAULT 'not_needed',
  return_paid_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
  FOREIGN KEY (collected_by) REFERENCES users(id)
);