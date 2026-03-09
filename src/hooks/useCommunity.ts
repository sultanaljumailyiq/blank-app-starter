import { useCommunityContext } from '../contexts/CommunityContext';

export const useCommunity = () => {
    const context = useCommunityContext();

    return {
        // Data
        posts: context.posts,
        loading: context.loading,

        // Actions (Mapping old hook names to new Context actions)
        addPost: async (content: string, image?: string | string[], user?: any) => {
            await context.createPost(content, image);
            return true;
        },
        createPost: context.createPost, // Expose directly for GroupDetailPage
        likePost: context.likePost,
        toggleLike: context.likePost, // Alias for backward compatibility
        addComment: (postId: string, text: string, replyToUserId?: string) => {
            context.addComment(postId, text, replyToUserId);
        },
        updateComment: context.updateComment,
        deleteComment: context.deleteComment,
        updatePost: context.updatePost,
        deletePost: context.deletePost,

        // Expose new Context capabilities directly
        events: context.events,
        groups: context.groups,
        friends: context.friends,
        resources: context.resources,
        models: context.models,
        savedItems: context.savedItems,
        myEnrollments: context.myEnrollments,
        users: context.users,
        suggestedUsers: context.suggestedUsers,

        // Social Actions
        followUser: context.followUser,
        unfollowUser: context.unfollowUser,
        amIFollowing: context.amIFollowing,
        toggleCloseFriend: context.toggleCloseFriend,
        isCloseFriend: context.isCloseFriend,
        following: context.following,
        followers: context.followers,

        addFriend: context.addFriend,
        removeFriend: context.removeFriend,
        joinGroup: context.joinGroup,
        leaveGroup: context.leaveGroup,
        registerForEvent: context.registerForEvent,
        toggleSave: context.toggleSave,
        isSaved: context.isSaved,
        adminPromoteUser: context.adminPromoteUser,
        adminAddEvent: context.adminAddEvent,
        adminUpdateEvent: context.adminUpdateEvent,
        adminDeleteEvent: context.adminDeleteEvent,
        reportPost: context.reportPost,
        banUser: context.banUser,

        // Notifications
        notifications: context.notifications,
        markNotificationAsRead: context.markNotificationAsRead,
        markAllNotificationsAsRead: context.markAllNotificationsAsRead,

        // Group Admin
        groupRequests: context.groupRequests,
        createGroup: context.createGroup,
        approveGroupRequest: context.approveGroupRequest,
        rejectGroupRequest: context.rejectGroupRequest,
        promoteGroupMember: context.promoteGroupMember,
        kickGroupMember: context.kickGroupMember
    };
};
