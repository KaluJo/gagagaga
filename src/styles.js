import styled from 'styled-components';
import { createGlobalStyle } from 'styled-components';

import { Link as RouterLink } from 'react-router-dom';

const primaryColor = "#212121";
const hoverColor = "#242424";
const backgroundColor = "#2a2a2a";
const fontColor = "#f1f1f1";
const borderColor = "#444";
const boxShadow = "0px 0px 2px rgba(0, 0, 0, 0.1)";
const inputBackgroundColor = "#333";

export const GlobalStyle = createGlobalStyle`
  body, html {
    background-color: ${backgroundColor};
    margin: 0;
    padding: 0;
    height: 100%;
  }
`;

export const Container = styled.div`
  padding: 20px 30px;
  flex: 1;
  align-content: center;
  min-height: 100vh;
  text-align: center;
  background-color: ${backgroundColor};
  font-family: 'Roboto', sans-serif; // Modern font choice
  color: ${fontColor};
`;

export const SwitchButtonGroup = styled.div`
  display: flex;
  margin-top: 30px;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  background-color: ${backgroundColor};
`;

export const StyledLink = styled(RouterLink)`
  flex: 1;
  width: 50%;
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SwitchButton = styled.button`
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  box-shadow: ${boxShadow};
  background-color: ${primaryColor};
  font-size: 16px;
  font-family: 'Roboto', sans-serif; // Modern font choice
  font-weight: 500;
  color: white;
  border: none;
  cursor: pointer;
  transition: 0.2s all;
  &:hover {
    background-color: ${hoverColor};
  }
`;

export const InputGroup = styled.div`
  display: flex;
  margin-top: 20px;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  background-color: ${backgroundColor};
`;

export const Label = styled.label`
  display: block;
  align-self: center;
  font-weight: 500; // slightly bolder for better visibility
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid ${borderColor};
  border-radius: 5px;
  transition: border-color 0.3s;
  font-family: 'Roboto', sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: ${fontColor};
  background-color: ${inputBackgroundColor};
  &:focus {
    border-color: ${primaryColor};
    outline: none;
  }
`;

export const Button = styled.button`
  width: 100%;
  border-radius: 5px;
  margin-top: 10px;
  padding: 8px;
  color: white;
  background-color: ${primaryColor};
  font-size: 16px;
  font-family: 'Roboto', sans-serif; // Modern font choice
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: ${hoverColor};
  }
`;

export const TranslationBox = styled.div`
  margin-top: 20px;
  padding: 20px;
  border: 1px solid ${borderColor};
  background-color: #f5f5f5;
  border-radius: 5px;
  font-family: 'Roboto', sans-serif;
`;

export const TranslationGroup = styled.div`
  flex: 1;
  width: 100%;
  background-color: ${backgroundColor}; 
  border: 1px solid ${borderColor};
  margin-top: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); 
  font-family: 'Roboto', sans-serif;
`;

export const TranslationCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  width: 100%;
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
`;

export const TranslationLabel = styled.label`
  font-weight: bold;
  width: 30%;
  max-width: 7em;
  color: ${fontColor};
  font-family: 'Roboto', sans-serif;
`;

export const StyledInput = styled.input`
  display: block;
  width: 100%; 
  margin-left: auto;
  margin-right: 20px;
  padding: 8px;
  border: 1px solid ${borderColor};
  border-radius: 5px;
  font-family: 'Roboto', sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: ${fontColor};
  transition: border-color 0.3s;
  background-color: ${inputBackgroundColor};
  &:focus {
    border-color: ${primaryColor};
    outline: none;
  }
`;

export const WordGroup = styled.div`
  background-color: ${backgroundColor};
  border: 1px solid ${borderColor};
  border-radius: 5px;
  padding: 10px;
  margin: 20px 0;
  
  display: flex;
  flex-direction: column;
  align-items: center;  // This centers the items horizontally
  justify-content: center;  // This centers the items vertically
  

  cursor: pointer;
  box-shadow: ${boxShadow};
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
  }

  h2 {
    color: ${fontColor};
    margin-bottom: 8px;
  }
`;

export const GroupName = styled.h2`
  margin: 0;
  margin-top: 4px;
  font-size: 1.5em;
  color: #f1f1f1;
`;

export const GroupInfo = styled.p`
  margin: 0.5em 0;  // gives a small space between the info paragraphs and other elements
  color: #f1f1f1;
`;

export const GroupSelector = styled.select`
  margin-top: 20px;
  padding: 8px;
  border: 1px solid ${borderColor};
  border-radius: 5px;
  font-family: 'Roboto', sans-serif;
  &:focus {
    border-color: ${primaryColor};
    outline: none;
  }
`;

export const ChapterSelector = styled.select`
  margin-top: 20px;
  padding: 8px;
  border: 1px solid ${borderColor};
  border-radius: 5px;
  font-family: 'Roboto', sans-serif;
  &:focus {
    border-color: ${primaryColor};
    outline: none;
  }
`;

export const Row = styled.div`
  display: flex;
`;

export const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background-color: ${backgroundColor};
  padding: 10px;
  border-radius: 5px;
  box-shadow: ${boxShadow};
  font-family: 'Roboto', sans-serif;
`;

export const ModalButton = styled.button`
margin: 5px;
  padding: 40px;
  width: 150px;  // set your desired width
  height: 100px;  // set your desired height (if necessary)
  border: none;
  border-radius: 5px;
  color: white;
  background-color: ${primaryColor};
  font-size: 16px;
  font-family: 'Roboto', sans-serif; // Modern font choice
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: ${hoverColor};
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.7);
  z-index: 999;
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid ${borderColor};
  border-radius: 5px;
  background-color: ${inputBackgroundColor}; // or any color you've defined for inputs
  color: ${fontColor};
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  transition: border-color 0.3s;

  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1em;
  
  &:focus {
    border-color: ${primaryColor};
    outline: none;
  }
`;

export const PartOfSpeechButton = styled.button`
  flex: 1;
  padding: 8px 10px;
  margin-left: ${props => (props.firstButton ? '0' : '6px')};
  border: 1px solid ${borderColor};
  background: ${props => (props.isActive ? primaryColor : backgroundColor)};
  color: ${fontColor};
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  transition: background 0.3s ease;

  &:hover {
    background: ${primaryColor};
  }
`;

export const PartOfSpeechContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 10px;
`;

export const WordCard = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  border: 1px solid ${borderColor};
  border-radius: 8px;
  background-color: #2a2a2a;  // Dark theme background

  &:hover {
    border-color: #555;
  }

  &.active {
    border-color: #777777;
    border-width: 2px;
  }
`;

export const Title = styled.h2`
  font-size: 30px;
  color: #ddd;  // Dark theme text color
`;

export const Translation = styled.p`
  font-size: 20px;
  color: #bbb;  // Dark theme secondary text color
  line-height: 1.4;
  margin-top: 10px;
  margin-bottom: 20px;
`;

export const Progress = styled.div`
  height: 10px;
  width: ${(props) => props.width || '0'}%;
  background-color: green;
  border-radius: 4px;
  transition: width 0.3s ease;
`;

export const ProgressBarContainer = styled.div`
  height: 10px;
  width: 97%;
  margin-bottom: 12px;
  background-color: #555;  // Dark theme empty progress background
  border-radius: 4px;
  overflow: hidden;  // Important for the inner bar to conform to rounded corners
`;

export const ProgressBar = styled.div`
  height: 100%;
  width: ${(props) => props.width || '0'}%;
  background-color: #311B92;
  transition: width 0.3s ease;
`;

export const TypeTestInput = styled.input`
  width: 50%;
  padding: 5px;
  background-color: #333;  // Dark theme input background
  border: 1px solid #555;  // Dark theme input border
  color: #eee;             // Dark theme input text color
  border-radius: 4px;
  font-size: 16px;
  margin-top: -5px;
  margin-bottom: 20px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #66afe9;  // color when the input is focused
  }

  &::placeholder {
    color: #777;            // Dark theme placeholder color
  }
`;