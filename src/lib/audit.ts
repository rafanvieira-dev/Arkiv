"use client";

import type { AuditLog, Usuario } from '@/types';

const AUDIT_LOG_STORAGE_KEY = 'arquivocentral_audit_logs';

/**
 * Logs an action performed by a user.
 * This function should be called after a state-changing action has been successfully performed.
 * @param action A string identifying the action, e.g., 'CREATE_DOCUMENT'.
 * @param details An object containing relevant details about the action, e.g., { documentId: '...' }.
 */
export function logAction(action: string, details: Record<string, any> = {}) {
  try {
    const userJson = window.localStorage.getItem('currentUser');
    if (!userJson) {
      console.warn('Audit log skipped: No user is currently logged in.');
      return;
    }

    const currentUser: Usuario = JSON.parse(userJson);
    
    const newLogEntry: AuditLog = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.nomeCompleto,
      action: action,
      details: details,
    };

    const storedLogs = window.localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    const allLogs: AuditLog[] = storedLogs ? JSON.parse(storedLogs) : [];

    // Keep the log from getting excessively large, e.g., cap at 5000 entries
    const LOG_LIMIT = 5000;
    const updatedLogs = [newLogEntry, ...allLogs].slice(0, LOG_LIMIT);
    
    window.localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(updatedLogs));

  } catch (error) {
    console.error("Failed to write audit log to localStorage:", error);
  }
}
