const path = require('path');
// Getting the enviornment variables
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, 'config.env') });

const app = require(path.join(__dirname, 'app.js'));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
