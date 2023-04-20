function generateKeyName() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let keyName = '';
  const length = Math.floor(Math.random() * 50) + 1;

  for (let i = 0; i < length; i++) {
    keyName += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return keyName;
}

module.exports = generateKeyName;