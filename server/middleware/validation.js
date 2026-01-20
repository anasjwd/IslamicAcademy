/**
 * Request Validation Middleware
 * Validates request body data before processing
 */

function areFieldsPresent(fields) {
  return Object.values(fields).every(field => field && field.toString().trim() !== '');
}

function areAllStrings(fields) {
  return Object.values(fields).every(field => typeof field === 'string');
}

function isStrongPassword(password) {
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  if (!hasLower || !hasUpper || !hasNumber) {
    return { isValid: false, error: 'Password must contain: lowercase letters, uppercase letters, and numbers' };
  }
  return { isValid: true };
}

function isValidEmail(email) {
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { isValid: false, error: 'Email format is invalid' };
  }
  return { isValid: true };
}

function isValidName(name, fieldName = 'Name') {
  if (name.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  } else if (name.length > 50) {
    return { isValid: false, error: `${fieldName} must be less than 50 characters` };
  }
  return { isValid: true };
}

function isValidWhatsApp(phone) {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'WhatsApp number is required' };
  }
  
  if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
    return { isValid: false, error: 'WhatsApp number format is invalid (use international format, e.g., +212600000000)' };
  }
  return { isValid: true };
}

/**
 * Validate signup request
 */
export const signupValidation = async (request, reply) => {
  const { first_name, last_name, email, password, whatsapp_number, age, is_employed } = request.body;
  
  // Check required fields are strings
  if (!areAllStrings({ first_name, last_name, email, password, whatsapp_number })) {
    return reply.code(400).send({
      success: false,
      message: 'Invalid data types'
    });
  }
  
  // Check age is a number if provided
  if (age !== undefined && age !== null && age !== '' && (typeof age !== 'number' && isNaN(Number(age)))) {
    return reply.code(400).send({
      success: false,
      message: 'Age must be a valid number'
    });
  }
  
  // Check is_employed is boolean if provided
  if (is_employed !== undefined && is_employed !== null && typeof is_employed !== 'boolean') {
    return reply.code(400).send({
      success: false,
      message: 'Employment status must be true or false'
    });
  }
  
  // Check all required fields are present
  if (!areFieldsPresent({ first_name, last_name, email, password, whatsapp_number })) {
    return reply.code(400).send({
      success: false,
      message: 'All fields are required (first_name, last_name, email, password, whatsapp_number)'
    });
  }
  
  // Check age is provided
  if (!age || age === '') {
    return reply.code(400).send({
      success: false,
      message: 'Age is required'
    });
  }
  
  // Validate first name
  const firstNameCheck = isValidName(first_name, 'First name');
  if (!firstNameCheck.isValid) {
    return reply.code(400).send({
      success: false,
      message: firstNameCheck.error
    });
  }
  
  // Validate last name
  const lastNameCheck = isValidName(last_name, 'Last name');
  if (!lastNameCheck.isValid) {
    return reply.code(400).send({
      success: false,
      message: lastNameCheck.error
    });
  }
  
  // Validate email
  const emailCheck = isValidEmail(email);
  if (!emailCheck.isValid) {
    return reply.code(400).send({
      success: false,
      message: emailCheck.error
    });
  }
  
  // Validate password
  const passwordCheck = isStrongPassword(password);
  if (!passwordCheck.isValid) {
    return reply.code(400).send({
      success: false,
      message: passwordCheck.error
    });
  }
  
  // Validate WhatsApp number (mandatory)
  const whatsappCheck = isValidWhatsApp(whatsapp_number);
  if (!whatsappCheck.isValid) {
    return reply.code(400).send({
      success: false,
      message: whatsappCheck.error
    });
  }
};

/**
 * Validate login request
 */
export const loginValidation = async (request, reply) => {
  const { email, password } = request.body;
  
  // Check data types
  if (!areAllStrings({ email, password })) {
    return reply.code(400).send({
      success: false,
      message: 'Invalid data types'
    });
  }
  
  // Check all fields are present
  if (!areFieldsPresent({ email, password })) {
    return reply.code(400).send({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // Validate email format
  const emailCheck = isValidEmail(email);
  if (!emailCheck.isValid) {
    return reply.code(400).send({
      success: false,
      message: emailCheck.error
    });
  }
};

/**
 * Validate course creation
 */
export const courseValidation = async (request, reply) => {
  const { name, description, image } = request.body;
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return reply.code(400).send({
      success: false,
      message: 'Course name is required'
    });
  }
  
  if (name.length < 3 || name.length > 200) {
    return reply.code(400).send({
      success: false,
      message: 'Course name must be between 3 and 200 characters'
    });
  }
};

/**
 * Validate subscription request (guest)
 */
export const guestSubscriptionValidation = async (request, reply) => {
  const { first_name, last_name, whatsapp_number, age, is_employed } = request.body;
  
  // Check required fields are strings
  if (!areAllStrings({ first_name, last_name, whatsapp_number })) {
    return reply.code(400).send({
      success: false,
      message: 'Invalid data types'
    });
  }
  
  if (!areFieldsPresent({ first_name, last_name, whatsapp_number })) {
    return reply.code(400).send({
      success: false,
      message: 'All fields are required (first_name, last_name, whatsapp_number)'
    });
  }
  
  // Validate WhatsApp
  const whatsappCheck = isValidWhatsApp(whatsapp_number);
  if (!whatsappCheck.isValid) {
    return reply.code(400).send({
      success: false,
      message: whatsappCheck.error
    });
  }
  
  // Validate age if provided
  if (age !== undefined && age !== null) {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      return reply.code(400).send({
        success: false,
        message: 'Age must be between 13 and 120'
      });
    }
  }
  
  // Validate is_employed if provided
  if (is_employed !== undefined && typeof is_employed !== 'boolean') {
    return reply.code(400).send({
      success: false,
      message: 'Employment status must be boolean'
    });
  }
};
