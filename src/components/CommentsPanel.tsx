import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useGlobalUI } from '../contexts/GlobalUI';
import useShops from '../hooks/useShops';
import { toast } from 'react-toastify';

interface Comment {
    text: string;
    timestamp: string;
    field?: string;
}

interface CommentsPanelProps {
    shopId: string;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ shopId }) => {
    const { showComments, setShowComments, activeCommentField } = useGlobalUI();
    const { shops, addComment, deleteComment } = useShops();
    const [newComment, setNewComment] = useState('');

    const selectedShop = shops.find(shop => shop.id === shopId);

    if (!showComments || !selectedShop) return null;

    const handleAddComment = () => {
        if (!newComment.trim()) {
            toast.warning('Please enter a comment');
            return;
        }

        const comment: Comment = {
            text: newComment,
            ...(activeCommentField && { field: activeCommentField }),
            timestamp: new Date().toISOString()
        };

        try {
            addComment(selectedShop.id, comment);
            setNewComment('');
            toast.success('Comment added successfully');
        } catch (error) {
            toast.error('Failed to add comment');
            console.error('Error adding comment:', error);
        }
    };

    const handleDeleteComment = (index: number) => {
        try {
            deleteComment(selectedShop.id, index);
            toast.info('Comment deleted');
        } catch (error) {
            toast.error('Failed to delete comment');
            console.error('Error deleting comment:', error);
        }
    };

    const filteredComments = selectedShop.comments?.filter(comment =>
        activeCommentField
            ? comment.field === activeCommentField
            : !comment.field
    ) || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b p-4">
                    <div className="flex items-center space-x-2">
                        <MessageCircle className="h-5 w-5" />
                        <h2 className="text-lg font-semibold">
                            {activeCommentField ? `Comments: ${activeCommentField}` : 'General Comments'}
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowComments(false)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close comments"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {filteredComments.length > 0 ? (
                        <div className="space-y-3">
                            {filteredComments.map((comment, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between">
                                        <p className="text-gray-800">{comment.text}</p>
                                        <button
                                            onClick={() => handleDeleteComment(index)}
                                            className="text-red-500 hover:text-red-700"
                                            aria-label="Delete comment"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(comment.timestamp).toLocaleString()}
                                        {comment.field && (
                                            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                                                {comment.field}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No comments yet</p>
                    )}
                </div>

                <div className="p-4 border-t">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a new comment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        aria-label="Comment input"
                    />
                    <div className="flex justify-between items-center">
                        {activeCommentField && (
                            <span className="text-sm text-gray-500">
                                Commenting on: <span className="font-medium">{activeCommentField}</span>
                            </span>
                        )}
                        <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                        >
                            Add Comment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentsPanel;