-- KhetRent Database Cleanup Script for Final Real-User Testing
-- Execute this script in MySQL Workbench or MySQL CLI to remove all test data while preserving table structures

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE bookings;
TRUNCATE TABLE equipment;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;
