let db = require('../util/database');
// let db = require('/database');


// Add a single individual to the database
function addUser(data) {
    console.log("Adding")
    let sql = "Insert into RotationMatrixLeaderBoard (score, tiles, userName) values ('" + data.score+ "','"+ data.tiles+ "','" + data.userName + "')";
    db.execute(sql);
}

// Gets all the individuals in the database
function getTop5Users() {
    return db.execute('Select * from RotationMatrixLeaderBoard order by score DESC LIMIT 5');
}


module.exports = {
    add : addUser,
    getall : getTop5Users,
}