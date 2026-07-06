// utils/validation.js
export const validatePassword = (password) => {
    if (!password) return ""; 
  
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    if (password.length < minLength) return "Minimum 8 characters required";
    if (!hasUpperCase) return "At least one uppercase letter required";
    if (!hasNumber) return "At least one number required";
    if (!hasSpecialChar) return "At least one special character required";
    
    return ""; // No error
  };