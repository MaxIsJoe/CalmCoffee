import { supabase } from './supabaseClient';
import type { Database } from '../../database.types.ts';

type NotificationType = Database['public']['Tables']['notifications']['Row']['type'];

interface NotificationOptions {
    userId: string;
    message: string;
    type: NotificationType;
    sentBy: string;
}

/**
 * Send a notification to a user
 */
export async function sendNotification({ userId, message, type, sentBy }: NotificationOptions) {
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            message,
            type,
            sent_by: sentBy,
            read: false
        });

    if (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
}

/**
 * Send a notification about a new comment
 */
export async function sendCommentNotification({
    userId,
    commenterId,
    commenterUsername,
    storyTitle
}: {
    userId: string;
    commenterId: string;
    commenterUsername: string;
    storyTitle: string;
}) {
    await sendNotification({
        userId,
        message: `${commenterUsername} commented on your story "${storyTitle}"`,
        type: 'comment',
        sentBy: commenterId
    });
}

export async function sendLikeStoryNotification({
    userId,
    reactorId,
    reactorUsername,
    storyTitle,
}: {
    userId: string;
    reactorId: string;
    reactorUsername: string;
    storyTitle: string;
    reaction: string;
}) {
    await sendNotification({
        userId,
        message: `${reactorUsername} has liked to your submission "${storyTitle}"`,
        type: 'like',
        sentBy: reactorId
    });
}

export async function sendWatchStoryNotification({
    userId,
    reactorId,
    reactorUsername,
    storyTitle,
}: {
    userId: string;
    reactorId: string;
    reactorUsername: string;
    storyTitle: string;
    reaction: string;
}) {
    await sendNotification({
        userId,
        message: `${reactorUsername} is now following your story "${storyTitle}"!`,
        type: 'like',
        sentBy: reactorId
    });
}

export async function sendWatchUpdateNotification({
    userId,
    reactorId,
    storyTitle,
}: {
    userId: string;
    reactorId: string;
    reactorUsername: string;
    storyTitle: string;
    reaction: string;
}) {
    await sendNotification({
        userId,
        message: `"${storyTitle}" has been updated!`,
        type: 'watch_inform',
        sentBy: reactorId
    });
}

/**
 * Send a notification about a new follower
 */
export async function sendFollowNotification({
    userId,
    followerId,
    followerUsername
}: {
    userId: string;
    followerId: string;
    followerUsername: string;
}) {
    await sendNotification({
        userId,
        message: `${followerUsername} started following you`,
        type: 'watch_inform',
        sentBy: followerId
    });
}

/**
 * Send a notification about a mention
 */
export async function sendMentionNotification({
    userId,
    mentionerId,
    mentionerUsername,
    context
}: {
    userId: string;
    mentionerId: string;
    mentionerUsername: string;
    context: string;
}) {
    await sendNotification({
        userId,
        message: `${mentionerUsername} mentioned you in ${context}`,
        type: 'comment',
        sentBy: mentionerId
    });
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number) {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

    if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

    if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: number) {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

    if (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

    if (error) {
        console.error('Error getting unread notification count:', error);
        throw error;
    }

    return count || 0;
} 