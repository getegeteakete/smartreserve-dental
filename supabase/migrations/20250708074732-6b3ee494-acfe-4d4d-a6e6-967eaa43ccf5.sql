-- Enable pg_cron and pg_net extensions for automated scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule reminder emails
-- JST 18:00 = UTC 09:00 (前日リマインダー)
SELECT cron.schedule(
  'reminder-day-before',
  '0 9 * * *',
  $$SELECT net.http_post(
    url:='https://ebuweyxsblraqhesdmvd.supabase.co/functions/v1/send-reminder-emails',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVidXdleXhzYmxyYXFoZXNkbXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNDk4MDQsImV4cCI6MjA2MDcyNTgwNH0.KBnbyk-m7RwBYDxKnQM9wWfMw4hQPjCMzbOBoB0H3lM"}'::jsonb,
    body:='{"reminderType": "day_before"}'::jsonb
  ) AS request_id$$
);

-- JST 08:00 = UTC 23:00 (当日リマインダー)
SELECT cron.schedule(
  'reminder-morning-of',
  '0 23 * * *',
  $$SELECT net.http_post(
    url:='https://ebuweyxsblraqhesdmvd.supabase.co/functions/v1/send-reminder-emails',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVidXdleXhzYmxyYXFoZXNkbXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNDk4MDQsImV4cCI6MjA2MDcyNTgwNH0.KBnbyk-m7RwBYDxKnQM9wWfMw4hQPjCMzbOBoB0H3lM"}'::jsonb,
    body:='{"reminderType": "morning_of"}'::jsonb
  ) AS request_id$$
);