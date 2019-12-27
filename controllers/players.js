let usersModel = require('../models/leaderBoardData');

exports.getTop5Users = (req, res, next) => { //leaderboard

    //for this current player
    const score = req.query.score;
    const tiles = req.query.tiles;
    const name = req.query.name;

    //for top 5 players
    let Users = usersModel.getall();
    Users.then(([rows, fieldData]) => {
        res.render('leaderBoard', { user: rows, leaderBoardCSS: true, thisScore: score, thisTiles:tiles, thisName: name });

    });
};

exports.postAddUsers = (req, res, next) => { //then goes to leaderboard; this is summary/addRecord
    let u_name = req.body.name;
    let u_score = req.body.score;
    let u_tiles = req.body.tiles;

    let uOject = {
        userName: u_name,
        score: u_score,
        tiles: u_tiles
    }

    usersModel.add(uOject);
    //make self submitting form 
    
    res.redirect(301, '/leaderBoard?score=' + u_score + '&tiles=' + u_tiles + '&name=' + u_name);
    res.redirect(req.get('referer')); //this refreshes the leaderboard to show new added 
}