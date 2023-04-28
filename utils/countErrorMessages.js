function countErrorMessages(array) {
  const messagesMap = new Map();

  array.forEach(obj => {
    obj.errors.forEach(err => {
      err.detail.forEach(det => {
        const message = det.message;
        if (messagesMap.has(message)) {
          messagesMap.set(message, messagesMap.get(message) + 1);
        } else {
          messagesMap.set(message, 1);
        }
      });
    });
  });

  return messagesMap;
}

module.exports = countErrorMessages;