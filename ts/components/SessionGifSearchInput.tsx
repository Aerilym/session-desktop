import { debounce } from 'lodash';
import React, {useState } from 'react';
import styled from 'styled-components';
import { SessionIconButton } from './icon';

const StyledSearchInput = styled.div`
  height: var(--search-input-height);
  width: 100%;
  margin-inline-end: 1px;
  margin-bottom: 10px;
  display: inline-flex;
  flex-shrink: 0;

  .session-icon-button {
    margin: auto 10px;
    &:hover svg path {
      fill: var(--search-bar-icon-hover-color);
    }
  }

  &:hover {
    svg path:first-child {
      fill: var(--search-bar-icon-hover-color);
    }
  }
`;

const StyledInput = styled.input`
  width: inherit;
  height: inherit;
  border: none;
  flex-grow: 1;
  font-size: var(--font-size-sm);
  font-family: var(--font-default);
  text-overflow: ellipsis;
  background: none;
  color: var(--search-bar-text-control-color);

  &:focus {
    color: var(--search-bar-text-user-color);
    outline: none !important;
  }
`;
export const SessionGifSearchInput = ({
  search,
}:{
  search: (searchTerm: string) => void;
}) => {
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  const executeSearch = () => {
    search(currentSearchTerm);
  }

  return (
    <StyledSearchInput>
      <SessionIconButton
        iconColor="var(--search-bar-icon-color)"
        iconSize="medium"
        iconType="search"
      />
      <StyledInput
        value={currentSearchTerm}
        onChange={e => {
          const inputValue = e.target.value;
          setCurrentSearchTerm(inputValue);
          debounce(executeSearch, 500)();
        }}
        placeholder={'Search for GIFs...'}
      />
    </StyledSearchInput>
  );
};
