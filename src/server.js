// src/server.js

const app = require('./app');
const port = process.env.PORT || 3000;

// console.log(port)
app.listen(port, () => {
  console.log(`Server started on port ${port} ✔️`);
});
