-- 004: warehouse hand-over status + express couriers
-- migration file to add a new delivery status and a new user type (express courier)

-- add 'at_warehouse' (after picked_up) to the delivery status
ALTER TABLE deliveries MODIFY status
  ENUM('pending','assigned','picked_up','at_warehouse','out_for_delivery','delivered','failed','returned','cancelled')
  NOT NULL DEFAULT 'pending';

-- same new status in the audit trail
ALTER TABLE delivery_status_history MODIFY old_status
  ENUM('pending','assigned','picked_up','at_warehouse','out_for_delivery','delivered','failed','returned','cancelled') NULL;

ALTER TABLE delivery_status_history MODIFY new_status
  ENUM('pending','assigned','picked_up','at_warehouse','out_for_delivery','delivered','failed','returned','cancelled') NOT NULL;

-- 0 = normal courier (zones), 1 = express courier (4-Hour, island-wide)
ALTER TABLE users ADD COLUMN is_express TINYINT(1) NOT NULL DEFAULT 0;