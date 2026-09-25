function validateSignup(payload) {
  const required = ["name", "email", "password", "role"];
  return required.filter((field) => !payload[field]);
}

module.exports = { validateSignup };
