let express = require('express')
let app = express();
let bodyParser = require('body-parser');
let path = require('path');
let db = require('./util/database');

const expressHbs = require('express-handlebars');
app.engine(
    'hbs',
    expressHbs({
      layoutsDir: 'views/layouts/',
      defaultLayout: 'main-layout',
      extname: 'hbs'
    })
  );
  app.set('view engine', 'hbs');
  app.set('views', 'views');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })) // middleware

// parse application/json
app.use(bodyParser.json()) // middleware

let playerRoutes = require('./routes/players');
app.use(express.static(path.join(__dirname,'public')));
// app.use(express.static(path.join(__dirname,'views')));
// app.use(express.static(path.join(__dirname,'routes')));
// app.use(express.static(path.join(__dirname,'util')));
// app.use(express.static(path.join(__dirname,'controllers')));
// app.use(express.static(path.join(__dirname,'models')));



app.get('/', function (req,res) {
  res.render('startGame', { pageTitle: 'Rotation Matrix Start', startGameCSS: true});
});

app.get('/gameBoard', function (req,res) {
  res.render('gameBoard', { pageTitle: 'Rotation Matrix Game', gameBoardCSS: true});
});

app.get('/summary', function (req,res) {
  const score = req.query.score;
  const tiles = req.query.tiles;
  res.render('summary', { pageTitle: 'Rotation Matrix Summary', score: score, tiles: tiles, summaryCSS: true});
});

// app.post('/summary?addRecord', function (req,res) {//not done, this is for database now, then go to leadership board
// });

app.use(playerRoutes);

app.listen(process.env.PORT || 3000, () => console.log('Server ready'))
// app.listen(3000, () => console.log('Server ready'))