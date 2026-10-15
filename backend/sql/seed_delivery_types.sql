INSERT INTO delivery_types
  (name, base_fee, per_km_rate, extra_stop_fee, max_weight_kg, max_length_cm, max_width_cm, max_height_cm, delivery_window_hours, suitable_for, remarks)
VALUES
  ('Bike', 8.00, 0.80, 3.00, 10.00, 40, 30, 30, NULL, 'Documents and small parcels', 'Cheapest option'),
  ('Car', 18.00, 1.20, 5.00, 100.00, 100, 60, 60, NULL, 'Boxes and medium parcels', 'Fits several boxes'),
  ('Van', 70.00, 2.20, 10.00, 1000.00, 300, 160, 150, NULL, 'Furniture and bulky items (van up to 3m)', 'Driver may need help loading'),
  ('4 Hour', 35.00, 1.50, 6.00, 50.00, 80, 50, 50, 4, 'Urgent parcels', 'Must arrive within 4 hours of pickup');