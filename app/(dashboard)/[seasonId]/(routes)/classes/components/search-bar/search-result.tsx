import React from 'react';
import "./SearchResult.css";

// Define the props expected by the SearchResult component
interface SearchResultProps {
  result: string; // assuming result is a string, adjust the type if needed
}

export const SearchResult: React.FC<SearchResultProps> = ({ result }) => {
  return (
    <div
      className="search-result"
      onClick={(e) => alert(`You selected ${result}!`)}
    >
      {result}
    </div>
  );
};
