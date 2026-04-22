-- Migration 001: add columns missing from live DB
-- Run once: psql -U admin -d timetable -f migrations/001_add_phone_and_reminder_frequency.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR DEFAULT NULL;
ALTER TABLE notification_settings ADD COLUMN IF NOT EXISTS reminder_frequency VARCHAR DEFAULT 'medium';
