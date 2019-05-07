const server = require("./server.js");

const port = 4000;
server.listen(port, () =>
  console.log(`\n** API running on http://localhost:${port} **\n`)
);
