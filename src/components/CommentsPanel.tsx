import React, { useState } from 'react';
import { MessageCircle, X, User, Search, Trash2 } from 'lucide-react';
import { useGlobalUI } from '../contexts/GlobalUI';
import useShops from '../hooks/useShops';
import { toast } from 'react-toastify';

type CommentStatus = 'open' | 'resolved';

interface Comment {
    id: string;
    text: string;
    author: string;
    timestamp: string;
    field?: string;
    status: CommentStatus;
}

interface CommentsPanelProps {
    shopId: string;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ shopId }) => {
    const { showComments, setShowComments, activeCommentField } = useGlobalUI();
    const { shops, addComment, deleteComment } = useShops();
    const [newComment, setNewComment] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const selectedShop = shops.find(shop => shop.id === shopId);

    if (!showComments || !selectedShop) return null;

    const filteredComments = (selectedShop.comments || [])
        .filter(comment =>
            activeCommentField
                ? comment.field === activeCommentField
                : !comment.field
        )
        .filter(comment =>
            comment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comment.author.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast.warning('Please enter a comment');
            return;
        }

        try {
            await addComment(selectedShop.id, {
                text: newComment.trim(),
                author: 'Current User',
                status: 'open',
                ...(activeCommentField && { field: activeCommentField })
            });
            setNewComment('');
            toast.success('Comment added successfully');
        } catch (error) {
            toast.error('Failed to add comment');
            console.error('Error adding comment:', error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            await deleteComment(selectedShop.id, commentId);
            toast.success('Comment deleted');
        } catch (error) {
            toast.error('Failed to delete comment');
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b p-4">
                    <div className="flex items-center space-x-3">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-semibold">
                            {activeCommentField ? `Comments: ${activeCommentField}` : 'Shop Comments'}
                        </h2>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                            {filteredComments.length} comments
                        </span>
                    </div>
                    <button
                        onClick={() => setShowComments(false)}
                        className="p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search comments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {filteredComments.length > 0 ? (
                        filteredComments.map((comment) => (
                            <div
                                key={comment.id}
                                className={`p-4 rounded-lg border ${comment.status === 'resolved'
                                    ? 'bg-gray-50 border-gray-200'
                                    : 'bg-white border-gray-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-blue-100 p-1 rounded-full">
                                            <User className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium">{comment.author}</span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(comment.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${comment.status === 'resolved'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-blue-100 text-blue-800'
                                        }`}
                                    >
                                        {comment.status}
                                    </span>
                                </div>

                                <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                                    {comment.text}
                                </p>

                                <div className="mt-3 flex justify-end">
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="flex items-center text-red-600 hover:text-red-800 text-sm"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <MessageCircle className="mx-auto h-10 w-10 text-gray-300" />
                            <p className="mt-2 text-gray-500">
                                {searchTerm
                                    ? 'No matching comments found'
                                    : 'No comments yet. Be the first to comment!'}
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={
                            activeCommentField
                                ? `Add comment about ${activeCommentField}...`
                                : 'Add general shop comment...'
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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