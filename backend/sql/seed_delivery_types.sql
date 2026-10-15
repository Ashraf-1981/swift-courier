INSERT INTO delivery_types
  (name, base_fee, per_km_rate, extra_stop_fee, collect_back_fee, max_weight_kg, max_length_cm, max_width_cm, max_height_cm, delivery_window_hours, suitable_for, remarks)
VALUES
  ('Bike', 8.00, 0.80, 3.00, 5.00, 10.00, 40, 30, 30, NULL, 'Documents and small parcels', 'Cheapest option'),
  ('Car', 18.00, 1.20, 5.00, 10.00, 100.00, 100, 60, 60, NULL, 'Boxes and medium parcels', 'Fits several boxes'),
  ('Van', 70.00, 2.20, 10.00, 15.00, 1000.00, 300, 160, 150, NULL, 'Furniture and bulky items (van up to 3m)', 'Driver may need help loading'),
  ('4-Hour Bike', 15.00, 1.20, 4.00, 8.00, 10.00, 40, 30, 30, 4, 'Urgent documents and small parcels', 'Must arrive within 4 hours of pickup'),
  ('4-Hour Car', 30.00, 1.80, 7.00, 13.00, 100.00, 100, 60, 60, 4, 'Urgent boxes and medium parcels', 'Must arrive within 4 hours of pickup'),
  ('4-Hour Van', 100.00, 3.00, 14.00, 20.00, 1000.00, 300, 160, 150, 4, 'Urgent bulky items', 'Must arrive within 4 hours of pickup');