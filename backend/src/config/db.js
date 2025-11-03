const mongoose = require('mongoose');
module.exports = async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI missing');
  await mongoose.connect(uri);
  console.log('Mongo connected');
};
