function PO(input) {
  if (Array.isArray(input)) {
    return input.map(e => PO(e));
  }
  const output = {};
  Object.keys(input).forEach((key) => {
    output[key] = input[key];
  });
  return output;
}

module.exports = {
  PO
};
