import { MessageCircle } from "lucide-react";
import { useState } from "react";

const ReviewComment = ({ comment }) => {
    const [expanded, setExpanded] = useState(false);
    const maxLength = 150;
    const isLong = comment.length > maxLength;
    const displayText = expanded || !isLong ? comment : comment.substring(0, maxLength) + "...";
  
    return (
      <div className="mt-1">
        <p className="text-gray-700 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          {displayText}
        </p>
        {isLong && (
          <div className="text-right mt-1">
            <span
              onClick={() => setExpanded(!expanded)}
              className="text-blue-500 cursor-pointer"
            >
              {expanded ? "See less" : "See more"}
            </span>
          </div>
        )}
      </div>
    );
  };