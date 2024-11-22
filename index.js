//Harmony Tayler
//It's the index.js file! It has all the usual index.js stuff.

let express = require("express");
let app = express();
let path = require("path");

const port = 5000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

const knex = require("knex") ({
    client : "pg",
    connection : {
        host : "localhost",
        user : "postgres",
        password : "admin",
        database : "testproject", //REPLACE WITH REAL DATABASE
        port : 5432
    }
});

// REPLACE WITH ALL THE REAL INFO
app.get('/', (req, res) => {
    knex('goals')
        .join('users', 'goals.userid', '=', 'users.userid')
        .select(
        'users.userid',
        'goals.goalid',
        'goals.description',
        'goals.status'
        )
        .orderBy('goals.goalid')
        .then(goals => {
        res.render('index', { goals });
        })
        .catch(error => {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
        });
    });

//NEED TO MAKE THIS SECTION ABLE TO EDIT GOALS
app.get('/editGoal/:goalid', (req, res) => {
    const goalid = req.params.goalid; // Extract goal ID from route params
    console.log(goalid);
    // Fetch the specific goal by ID
    knex('goals')
        .where('goalid', goalid) // Match the specific goal
        .first() // Get only one result
        .then(goals => {
            if (!goals) {
                return res.status(404).send('Goal not found.');
            }
            // Pass the goal data to the editGoal.ejs template
            res.render('editGoal', { goals });
        })
        .catch(error => {
            console.error('Error fetching goal for editing:', error);
            res.status(500).send('Internal Server Error');
        });
});

//THIS SECTION WILL SAVE THE EDITED GOALS BACK TO THE DATABASE
app.post('/editGoal/:goalid', (req, res) => {
    const goalid = req.params.goalid;
    const description = req.body.description;
    const status = req.body.status === 'true';
    // Update the goal in the database
    knex('goals')
        .where('goalid', goalid)
        .update({
        description: description,
        status: status
        })
        .then(() => {
        res.redirect('/'); // Redirect to the list of goals after saving
        })
        .catch(error => {
        console.error('Error updating goal:', error);
        res.status(500).send('Internal Server Error');
        });
    });

//USE THIS SECTION TO DELETE GOALS
app.post('/deleteGoal/:goalid', (req, res) => {
    const goalid = req.params.goalid;
    knex('goals')
        .where('goalid', goalid)
        .del() // Deletes the record with the specified ID
        .then(() => {
        res.redirect('/'); // Redirect to the goal list after deletion
        })
        .catch(error => {
        console.error('Error deleting goal:', error);
        res.status(500).send('Internal Server Error');
        });
    });

app.get('/addGoal', (req, res) => {
    res.render('addGoal'); 
});

app.listen(port, () => console.log("Listening"));