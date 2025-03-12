import React from "react";

/**
 * SubredditList component displays a list of subreddits with the option to remove them
 *
 * @param {Object} props
 * @param {Array} props.subreddits - Array of subreddit names
 * @param {Function} props.onRemove - Callback function to remove a subreddit
 * @param {String} props.title - Optional custom title for the list (defaults to "Added Subreddits")
 * @param {String} props.emptyMessage - Optional custom message when no subreddits exist
 */
const SubredditList = ({
  subreddits = [],
  onRemove,
  title = "Participants",
  emptyMessage = "No subreddits yet.",
}) => {
  return (
    <div className="bg-black text-white p-4 rounded-lg border border-gray-700 shadow-lg min-w-[300px] max-h-[400px] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {subreddits.length > 0 && (
          <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {subreddits.length}
          </span>
        )}
      </div>

      {subreddits.length === 0 ? (
        <p className="text-gray-400 italic py-2">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {subreddits.map((subreddit, index) => (
            <li
              key={`${subreddit}-${index}`}
              className="flex items-center justify-between bg-gray-800 p-3 rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="flex items-center">
                <span className="text-orange-500 mr-1">r/</span>
                <span className="text-lg font-medium truncate max-w-[200px]">
                  {subreddit}
                </span>
              </div>

              {onRemove && (
                <button
                  onClick={() => onRemove(subreddit)}
                  className="text-red-400 hover:text-red-600 hover:bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                  aria-label={`Remove r/${subreddit}`}
                  title={`Remove r/${subreddit}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Footer with branding */}
      <div className="mt-4 pt-2 border-t border-gray-700 text-center text-xs text-gray-500">
        <p>Capture and Win</p>
      </div>
    </div>
  );
};

export default SubredditList;
