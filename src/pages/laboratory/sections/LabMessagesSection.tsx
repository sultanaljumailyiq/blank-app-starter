import React from 'react';
import LabConversations from '../../../components/lab/LabConversations';

// LabMessagesSection now delegates to LabConversations which uses real Supabase data
// (get_lab_conversations RPC → lab_chat_conversations + lab_chat_messages tables)
export const LabMessagesSection: React.FC = () => {
  return <LabConversations />;
};