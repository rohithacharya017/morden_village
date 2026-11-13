// ==========================================================================
// MODERN VILLAGE - COMPLAINT MANAGEMENT CONTEXT
// Central State for Complaints, Workflow Lifecycle & In-App Notifications
// ==========================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DataRepo } from '../services/supabase';
import { useAuth } from './AuthContext';

const ComplaintContext = createContext(null);

export function ComplaintProvider({ children }) {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load complaints based on role
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const allComplaints = await DataRepo.getComplaints();
      setComplaints(allComplaints);

      if (currentUser) {
        const notifs = await DataRepo.getNotifications(currentUser.id);
        setNotifications(notifs);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Submit a new complaint
  const submitComplaint = async (complaintData) => {
    const saved = await DataRepo.createComplaint({
      ...complaintData,
      reporter_id: currentUser?.id || 'guest',
      reporter_name_snapshot: complaintData.reporter_name_snapshot || currentUser?.full_name || 'Anonymous Villager',
      reporter_mobile_snapshot: complaintData.reporter_mobile_snapshot || currentUser?.mobile_number || '9876543210',
      status: 'PENDING'
    });

    // Refresh local state
    setComplaints(prev => [saved, ...prev]);

    // Send confirmation notification to reporter
    await DataRepo.addNotification({
      recipient_id: saved.reporter_id,
      complaint_id: saved.id,
      title: "Complaint Lodged Successfully",
      message: `Your complaint ${saved.complaint_number} has been recorded and submitted to Kandavara Gram Panchayat. Assigned Priority: ${saved.priority}.`,
      notification_type: "status_update"
    });

    const notifs = await DataRepo.getNotifications(currentUser?.id);
    setNotifications(notifs);

    return saved;
  };

  // Acknowledge a complaint
  const acknowledgeComplaint = async (complaintId, officialName) => {
    const now = new Date().toISOString();
    const updated = await DataRepo.updateComplaint(
      complaintId,
      {
        status: 'ACKNOWLEDGED',
        acknowledged_at: now,
        acknowledged_by: officialName
      },
      officialName,
      `Complaint acknowledged by ${officialName}. Field inspection initiated.`
    );

    if (updated) {
      setComplaints(prev => prev.map(c => c.id === complaintId ? updated : c));

      // Notify original reporter
      await DataRepo.addNotification({
        recipient_id: updated.reporter_id,
        complaint_id: updated.id,
        title: "Complaint Acknowledged by Panchayat",
        message: `Your complaint ${updated.complaint_number} '${updated.title}' has been acknowledged by ${officialName}. Work allocation has commenced.`,
        notification_type: "acknowledgement"
      });

      if (currentUser) {
        const notifs = await DataRepo.getNotifications(currentUser.id);
        setNotifications(notifs);
      }
    }
    return updated;
  };

  // Mark work as in progress
  const setComplaintInProgress = async (complaintId, officialName, note = '') => {
    const updated = await DataRepo.updateComplaint(
      complaintId,
      { status: 'IN_PROGRESS' },
      officialName,
      note || `Work crew dispatched by ${officialName}.`
    );

    if (updated) {
      setComplaints(prev => prev.map(c => c.id === complaintId ? updated : c));

      await DataRepo.addNotification({
        recipient_id: updated.reporter_id,
        complaint_id: updated.id,
        title: "Work In Progress 🛠️",
        message: `Field work is currently underway for your complaint ${updated.complaint_number}. ${note || ''}`,
        notification_type: "status_update"
      });
    }
    return updated;
  };

  // Mark complaint completed
  const completeComplaint = async (complaintId, officialName, completionNote = '', completionImageUrl = '') => {
    const now = new Date().toISOString();
    const updated = await DataRepo.updateComplaint(
      complaintId,
      {
        status: 'COMPLETED',
        completed_at: now,
        completed_by: officialName,
        completion_note: completionNote,
        completion_image_url: completionImageUrl
      },
      officialName,
      `Work verified and marked resolved. Note: ${completionNote || 'No completion remarks provided.'}`
    );

    if (updated) {
      setComplaints(prev => prev.map(c => c.id === complaintId ? updated : c));

      // Trigger automatic resolution notification
      await DataRepo.addNotification({
        recipient_id: updated.reporter_id,
        complaint_id: updated.id,
        title: "Complaint Resolved! 🎉",
        message: `Your complaint ${updated.complaint_number}, '${updated.title}', has been resolved by the Gram Panchayat. Official Note: "${completionNote || 'Work verified complete.'}"`,
        notification_type: "completion"
      });

      if (currentUser) {
        const notifs = await DataRepo.getNotifications(currentUser.id);
        setNotifications(notifs);
      }
    }
    return updated;
  };

  // Re-open a complaint
  const reopenComplaint = async (complaintId, officialName, reason) => {
    const updated = await DataRepo.updateComplaint(
      complaintId,
      { status: 'REOPENED', completed_at: null },
      officialName,
      `Complaint reopened by ${officialName}. Reason: ${reason}`
    );

    if (updated) {
      setComplaints(prev => prev.map(c => c.id === complaintId ? updated : c));

      await DataRepo.addNotification({
        recipient_id: updated.reporter_id,
        complaint_id: updated.id,
        title: "Complaint Reopened for Review",
        message: `Your complaint ${updated.complaint_number} has been reopened for additional inspection: "${reason}"`,
        notification_type: "status_update"
      });
    }
    return updated;
  };

  // Override Priority by Official
  const overridePriority = async (complaintId, newPriority, reason, officialName) => {
    const updated = await DataRepo.updateComplaint(
      complaintId,
      {
        priority: newPriority,
        priority_override_reason: reason,
        priority_overridden_by: officialName
      },
      officialName,
      `Priority modified to ${newPriority} by ${officialName}. Reason: ${reason}`
    );

    if (updated) {
      setComplaints(prev => prev.map(c => c.id === complaintId ? updated : c));
    }
    return updated;
  };

  // Delete complaint
  const deleteComplaint = async (complaintId) => {
    await DataRepo.deleteComplaint(complaintId);
    setComplaints(prev => prev.filter(c => c.id !== complaintId));
  };

  // Mark notification read
  const markNotificationRead = async (notifId) => {
    await DataRepo.markNotificationRead(notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read_at: new Date().toISOString() } : n));
  };

  // Filter complaints for logged-in villager
  const villagerComplaints = complaints.filter(c => {
    if (!currentUser) return false;
    return c.reporter_id === currentUser.id || c.reporter_mobile_snapshot === currentUser.mobile_number;
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        villagerComplaints,
        notifications,
        unreadCount,
        loading,
        submitComplaint,
        acknowledgeComplaint,
        setComplaintInProgress,
        completeComplaint,
        reopenComplaint,
        overridePriority,
        deleteComplaint,
        markNotificationRead,
        refreshComplaints: loadData
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  return useContext(ComplaintContext);
}
