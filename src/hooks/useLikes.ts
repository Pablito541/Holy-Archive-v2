import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export function useLikes(itemId: string, initialLikeCount: number = 0) {
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const supabase = createClient();

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);
        };
        getUser();

        // Listen to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    // Check if user has liked this item
    useEffect(() => {
        const checkLikeStatus = async () => {
            if (!userId || !itemId) {
                setIsLiked(false);
                return;
            }

            const { data, error } = await supabase
                .from('item_likes')
                .select('id')
                .eq('item_id', itemId)
                .eq('user_id', userId)
                .maybeSingle();

            if (!error && data) {
                setIsLiked(true);
            } else {
                setIsLiked(false);
            }
        };

        checkLikeStatus();
    }, [itemId, userId, supabase]);

    const toggleLike = async () => {
        if (isLoading) return;

        if (!userId) {
            // User not authenticated - should redirect to login
            console.warn('User must be authenticated to like items');
            return;
        }

        setIsLoading(true);

        try {
            if (isLiked) {
                // Unlike
                const { error } = await supabase
                    .from('item_likes')
                    .delete()
                    .eq('item_id', itemId)
                    .eq('user_id', userId);

                if (!error) {
                    setIsLiked(false);
                    setLikeCount(prev => Math.max(0, prev - 1));
                }
            } else {
                // Like
                const { error } = await supabase
                    .from('item_likes')
                    .insert({
                        item_id: itemId,
                        user_id: userId
                    });

                if (!error) {
                    setIsLiked(true);
                    setLikeCount(prev => prev + 1);
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        likeCount,
        isLiked,
        isLoading,
        isAuthenticated: !!userId,
        toggleLike
    };
}
