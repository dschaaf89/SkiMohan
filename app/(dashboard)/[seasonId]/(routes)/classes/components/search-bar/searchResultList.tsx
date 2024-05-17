import React from 'react';
import "./SearchResultsList.css";
import { SearchResult } from './search-result';

// Define the structure of each result item
interface ResultItem {
  NAME_FIRST: string;
  NAME_LAST: string;
  // include other properties as needed
}

// Define the props expected by the SearchResultsList component
interface SearchResultsListProps {
  results: ResultItem[]; // results is an array of ResultItem
  onSelect: (result: ResultItem) => void;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({ results, onSelect }) => {
  return (
    <div className="results-list">
      {results.map((result, index) => (
        <div key={index} onClick={() => onSelect(result)}>
          {`${result.NAME_FIRST} ${result.NAME_LAST}`}
        </div>
      ))}
    </div>
  );
};