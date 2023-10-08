import styled from 'styled-components';

export const Container = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const InputGroup = styled.div`
    margin: 10px 0;
    display: flex;
    flex-direction: column;
`;

export const Label = styled.label`
    margin-bottom: 5px;
`;

export const Input = styled.input`
    padding: 10px;
    font-size: 16px;
    border-radius: 4px;
    border: 1px solid #ddd;
`;

export const Button = styled.button`
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 4px;
    border: none;
    background-color: #007BFF;
    color: white;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;

export const TranslationBox = styled.div`
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #ddd;
    width: 100%;
    max-width: 400px;
`;