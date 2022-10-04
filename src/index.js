if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); // eslint-disable-line global-require
}
const express = require('express');
const path = require('path');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');

const { configPassport, connectDb } = require('./config');
const setupRoutes = require('./routes');

const app = express();

// connect to DB
connectDb();

// middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

// Config passport
configPassport(passport);

// setup routes
setupRoutes(app);

app.get('/health', (req, res) => {
  res.send("Server is running")
});

const port = process.env.PORT || 5000;
// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Server is running on port ${port}`));
