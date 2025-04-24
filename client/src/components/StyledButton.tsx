import React from 'react';
import styled from 'styled-components';

interface StyledButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

const StyledButton: React.FC<StyledButtonProps> = ({ text, onClick, className }) => {
  return (
    <StyledWrapper className={className}>
      <button className="button" onClick={onClick}>
        <span>{text}</span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: inline-block;
  
  .button {
    width: 90px;
    padding: 0;
    border: none;
    transform: rotate(3deg);
    transform-origin: center;
    font-family: "Gochi Hand", cursive;
    text-decoration: none;
    font-size: 11px;
    cursor: pointer;
    padding-bottom: 1px;
    border-radius: 4px;
    box-shadow: 0 1px 0 #494a4b;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    background-color: #5cdb95;
  }

  .button span {
    background: #f1f5f8;
    display: block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    border: 1.5px solid #494a4b;
  }

  .button:active {
    transform: translateY(5px) rotate(5deg);
    padding-bottom: 0px;
    outline: 0;
  }

  .button:hover {
    box-shadow: 0 3px 0 #494a4b;
    transform: rotate(3deg);
  }
`;

export default StyledButton;