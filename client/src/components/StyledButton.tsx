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
    width: 150px;
    padding: 0;
    border: none;
    transform: rotate(5deg);
    transform-origin: center;
    font-family: "Gochi Hand", cursive;
    text-decoration: none;
    font-size: 15px;
    cursor: pointer;
    padding-bottom: 3px;
    border-radius: 5px;
    box-shadow: 0 2px 0 #494a4b;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    background-color: #5cdb95;
  }

  .button span {
    background: #f1f5f8;
    display: block;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    border: 2px solid #494a4b;
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