SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('messages', 'conversations', 'direct_messages');
