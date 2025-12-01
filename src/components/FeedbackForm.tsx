import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackFormProps {
  onSubmitFeedback: (works: boolean, reason?: string) => void;
  loading?: boolean;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmitFeedback, loading }) => {
  const [showDetailForm, setShowDetailForm] = React.useState(false);
  const [reason, setReason] = React.useState('');

  const handlePositiveFeedback = () => {
    onSubmitFeedback(true);
    setShowDetailForm(false);
    setReason('');
  };

  const handleNegativeFeedback = () => {
    setShowDetailForm(true);
  };

  const handleDetailedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitFeedback(false, reason);
    setShowDetailForm(false);
    setReason('');
  };

  if (showDetailForm) {
    return (
      <form onSubmit={handleDetailedSubmit} className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
        <p className="text-sm font-medium text-red-900">
          We're sorry to hear that. Please help us improve:
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="What went wrong with the script?"
          className="input-field min-h-24 text-sm"
          required
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setShowDetailForm(false);
              setReason('');
            }}
            className="flex-1 btn-secondary"
            disabled={loading}
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 btn-primary"
            disabled={loading || !reason.trim()}
          >
            Submit Feedback
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm font-medium text-blue-900 mb-3">
        Did this script work as expected in TradingView?
      </p>
      <div className="flex gap-3">
        <button
          onClick={handlePositiveFeedback}
          disabled={loading}
          className="flex items-center gap-2 flex-1 px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
        >
          <ThumbsUp size={16} />
          Yes, it works!
        </button>
        <button
          onClick={handleNegativeFeedback}
          disabled={loading}
          className="flex items-center gap-2 flex-1 px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
        >
          <ThumbsDown size={16} />
          No, it failed
        </button>
      </div>
    </div>
  );
};
