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
        database : "403project",
        port : 5432
    }
});

app.get('/', (req, res) => {
    knex('goals')
        .join('customers', 'goals.custid', '=', 'customers.custid')
        .select(
        'customers.custid',
        'goals.goalid',
        'goals.goaldescription',
        'goals.goalstatus'
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

app.get('/goals', (req, res) => {
    knex('goals')
        .join('customers', 'goals.custid', '=', 'customers.custid')
        .select(
        'customers.custid',
        'goals.goalid',
        'goals.goaldescription',
        'goals.goalstatus'
        )
        .orderBy('goals.goalid')
        .then(goals => {
        res.render('goals', { goals });
        })
        .catch(error => {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
        });
    });

app.get('/editGoal/:goalid', (req, res) => {
    const goalid = req.params.goalid; 
    knex('goals')
        .where('goalid', goalid)
        .first() 
        .then(goals => {
            if (!goals) {
                return res.status(404).send('Goal not found.');
            }
            res.render('editGoal', { goals });
        })
        .catch(error => {
            console.error('Error fetching goal for editing:', error);
            res.status(500).send('Internal Server Error');
        });
});

app.post('/editGoal/:goalid', (req, res) => {
    const goalid = req.params.goalid;
    const goaldescription = req.body.goaldescription;
    const goalstatus = req.body.goalstatus === 'true';
    knex('goals')
        .where('goalid', goalid)
        .update({
        goaldescription: goaldescription,
        goalstatus: goalstatus
        })
        .then(() => {
        res.redirect('/goals');
        })
        .catch(error => {
        console.error('Error updating goal:', error);
        res.status(500).send('Internal Server Error');
        });
    });

app.post('/deleteGoal/:goalid', (req, res) => {
    const goalid = req.params.goalid;
    knex('goals')
        .where('goalid', goalid)
        .del()
        .then(() => {
        res.redirect('/goals'); 
        })
        .catch(error => {
        console.error('Error deleting goal:', error);
        res.status(500).send('Internal Server Error');
        });
    });

app.get('/addGoal', (req, res) => {
    res.render('addGoal'); 
});

app.post('/addGoal', (req, res) => {
    const goaldescription = req.body.goaldescription;
    const custid = req.body.custid;
    knex('goals')
        .insert({custid: custid, goaldescription: goaldescription, goalstatus: false})
        .then(() => {
            res.redirect('/goals');
            })
})

// Route to display Health Metric records
app.get('/healthMetrics', (req, res) => {
    knex('health_metrics')
        .select(
        'health_metrics.metricID',
        'health_metrics.custWeight',
        'health_metrics.custHeightIN',
        'health_metrics.custBMI',
        'health_metrics.caloriesConsumed',
        'health_metrics.caloriesBurned',
        'health_metrics.recordDate',
        )
        .then(health_metrics => {
        // Render the index.ejs template and pass the data
        res.render('healthMetrics', {health_metrics});
        })
        .catch(error => {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    });
});  

app.get('/editMetric/:metricID', (req, res) => {
    const metricID = req.params.metricID;
    // Query the data by ID first
    knex('health_metrics')
        .where('metricID', metricID)
        .first()
        .then(metric => {
        if (!metric) {
            return res.status(404).send('Not found');
        }
        // Query all data after fetching the data
        res.render('editMetric', { metric });
            })
        .catch(error => {
            console.error('Error fetching data:', error);
            res.status(500).send('Internal Server Error');
        });
});

app.post('/editMetric/:metricID', (req, res) => {
    const metricID = req.params.metricID;

    // Access each value directly from req.body
    const weight = parseInt(req.body.custWeight);
    const height = req.body.custHeightIN;
    const bmi = parseFloat(req.body.custBMI);
    const caloriesConsumed = parseInt(req.body.caloriesConsumed);
    const caloriesBurned = parseInt(req.body.caloriesBurned);
    const recordDate = req.body.recordDate;

    // Update the data in the database
    knex('health_metrics')
        .where('metricID', metricID)
        .update({
        custWeight: weight,
        custHeightIN: height,
        custBMI: bmi,
        caloriesConsumed: caloriesConsumed,
        caloriesBurned: caloriesBurned,
        recordDate: recordDate,
        })
        .then(() => {
        res.redirect('/healthMetrics'); // Redirect to the list after saving
        })
        .catch(error => {
        console.error('Error updating Data:', error);
        res.status(500).send('Internal Server Error');
    });
});

app.post('/deleteMetric/:metricID', (req, res) => {
    const metricID = req.params.metricID;
    knex('health_metrics')
        .where('metricID', metricID)
      .del() // Deletes the record with the specified ID
        .then(() => {
        res.redirect('/healthMetrics'); // Redirect to the list after deletion
        })
        .catch(error => {
        console.error('Error deleting data:', error);
        res.status(500).send('Internal Server Error');
    });
});

app.get('/addMetric', (req, res) => {
  // Fetch data
    knex('health_metrics')
        .select('metricID')
        .then(metric => {
          // Render the add form with the data
            res.render('addMetric', { metric });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            res.status(500).send('Internal Server Error');
        });
});

app.post('/addMetric', (req, res) => {
  // Extract form values from req.body
const weight = parseInt(req.body.custWeight);
const height = req.body.custHeightIN;
const bmi = parseFloat(req.body.custBMI); 
const caloriesConsumed = parseInt(req.body.caloriesConsumed);
const caloriesBurned = parseInt(req.body.caloriesBurned); // Convert to integer
const recordDate = req.body.recordDate || new Date().toISOString().split('T')[0]; // Default to today
const custid = req.body.custid;

  // Insert the new data into the database
    knex('health_metrics')
        .insert({
            custid: custid,
            custWeight: weight,
            custHeightIN: height,
            custBMI: bmi,
            caloriesConsumed: caloriesConsumed,
            caloriesBurned: caloriesBurned,
            recordDate: recordDate,
        })
        .then(() => {
          res.redirect('/healthMetrics'); // Redirect to the list page after adding
        })
        .catch(error => {
            console.error('Error adding data:', error);
            res.status(500).send('Internal Server Error');
        });
});

app.listen(port, () => console.log("Listening"));