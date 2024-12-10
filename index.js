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

const bcrypt = require('bcrypt'); // sp1der code starts
const session = require('express-session');

app.use(session({
  secret: 'sp1der', // i have no idea what this does
  resave: false,
  saveUninitialized: true,
}));

const checkLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');  // Redirect to login page if not logged in
  }
  next();
}; // sp1der code stops

const knex = require("knex") ({
    client : "pg",
    connection : {
        host : "localhost",
        user : "postgres",
        password : "sp1DERap0CALypse042",
        database : "project3",
        port : 5432
    }
});

app.get('/', (req, res) => {

    if (!req.session.user) { //sp1
    return res.redirect('/login');  // Redirect to login page if not logged in
  }

    const custid = req.session.user.custid; //der
    
    knex('goals')
        .join('customers', 'goals.custid', '=', 'customers.custid')
        .select(
        'customers.custid',
        'goals.goalid',
        'goals.goaldescription',
        'goals.goalstatus'
        )
        .where({ 'customers.custid': custid }) //sp1der
        .orderBy('goals.goalid')
        .then(goals => {
        res.render('index', { goals });
        })
        .catch(error => {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
        });
    });

app.get('/goals', checkLogin, (req, res) => {
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

app.get('/editGoal/:goalid', checkLogin, (req, res) => {
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

app.get('/addGoal', checkLogin, (req, res) => {
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
app.get('/healthMetrics', checkLogin, (req, res) => {

    const custid = req.session.user.custid; //sp1

    knex('health_metrics')
        .select(
        'health_metrics.metricid',
        'health_metrics.custweight',
        'health_metrics.custheightin',
        'health_metrics.custbmi',
        'health_metrics.caloriesconsumed',
        'health_metrics.caloriesburned',
        'health_metrics.recorddate',
        )
        .where({ 'health_metrics.custid': custid }) //sp1der
        .then(health_metrics => {
        // Render the index.ejs template and pass the data
        res.render('healthMetrics', {health_metrics});
        })
        .catch(error => {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    });
});  

app.get('/editMetric/:metricid', checkLogin, (req, res) => {
    const metricid = req.params.metricid;
    // Query the data by ID first
    knex('health_metrics')
        .where('metricid', metricid)
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

app.post('/editMetric/:metricid', (req, res) => {
    const metricid = req.params.metricid;

    // Access each value directly from req.body
    const weight = parseInt(req.body.custweight);
    const height = req.body.custheightin;
    const bmi = parseFloat(req.body.custbmi);
    const caloriesconsumed = parseInt(req.body.caloriesconsumed);
    const caloriesburned = parseInt(req.body.caloriesburned);
    const recorddate = req.body.recorddate;

    // Update the data in the database
    knex('health_metrics')
        .where('metricid', metricid)
        .update({
        custweight: weight,
        custheightin: height,
        custbmi: bmi,
        caloriesconsumed: caloriesconsumed,
        caloriesburned: caloriesburned,
        recorddate: recorddate,
        })
        .then(() => {
        res.redirect('/healthMetrics'); // Redirect to the list after saving
        })
        .catch(error => {
        console.error('Error updating Data:', error);
        res.status(500).send('Internal Server Error');
    });
});

app.post('/deleteMetric/:metricid', (req, res) => {
    const metricid = req.params.metricid;
    knex('health_metrics')
        .where('metricid', metricid)
      .del() // Deletes the record with the specified ID
        .then(() => {
        res.redirect('/healthMetrics'); // Redirect to the list after deletion
        })
        .catch(error => {
        console.error('Error deleting data:', error);
        res.status(500).send('Internal Server Error');
    });
});

app.get('/addMetric', checkLogin, (req, res) => {
  // Fetch data
    knex('health_metrics')
        .select('metricid')
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
const weight = parseInt(req.body.custweight);
const height = req.body.custheightin;
const bmi = parseFloat(req.body.custbmi); 
const caloriesconsumed = parseInt(req.body.caloriesconsumed);
const caloriesburned = parseInt(req.body.caloriesburned); // Convert to integer
const recorddate = req.body.recorddate || new Date().toISOString().split('T')[0]; // Default to today
const custid = req.body.custid;
    knex('health_metrics')
        .insert({
            custid: custid,
            custWeight: weight,
            custheightin: height,
            custbmi: bmi,
            caloriesconsumed: caloriesconsumed,
            caloriesburned: caloriesburned,
            recorddate: recorddate,
        })
        .then(() => {
          res.redirect('/healthMetrics'); // Redirect to the list page after adding
        })
        .catch(error => {
            console.error('Error adding data:', error);
            res.status(500).send('Internal Server Error');
        });
});

app.get('/login', (req, res) => {res.render('login');
});

app.post('/login', (req, res) => { //sp1
  const { custemail, custpassword } = req.body;

  // Make sure the email and password are provided
  if (!custemail || !custpassword) {
    return res.send('Please provide both email and password.');
  }

  // Retrieve the user by email
  knex('customers')
    .where({ custemail: custemail })
    .first() // Get the first matching user
    .then(user => {
      if (!user) {
        // If no user is found with that email
        return res.send('Invalid login');
      }

      // Temporary comparison: directly compare plaintext password
      if (user.custpassword === custpassword) {
        // If the password matches, store user info in session
        req.session.user = { custid: user.custid, custemail: user.custemail };
        res.redirect('/');  // Redirect to the home page or dashboard
      } else {
        // If the password does not match
        res.send('Invalid login');
      }
    })
    .catch(error => {
      console.error('Error querying database:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/goals');
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.redirect('/login');  // Redirect to login page after logout
  });
});

app.get('/register', (req, res) => {
  res.render('register'); // Render your register.ejs page
});

app.post('/register', (req, res) => {
  const { custemail, custpassword } = req.body;

  if (!custemail || !custpassword) {
    return res.send('Please provide both email and password.');
  }

  // Check if the email is already taken
  knex('customers')
    .where({ custemail: custemail })
    .first()
    .then(existingUser => {
      if (existingUser) {
        return res.send('Email already in use. Please try another one.');
      }

      // Hash the password before saving (using bcrypt)
      bcrypt.hash(custpassword, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Error hashing password:', err);
          return res.status(500).send('Internal Server Error');
        }

        // Insert the new user into the database
        knex('customers')
          .insert({
            custemail: custemail,
            custpassword: hashedPassword, // Store the hashed password, not the plain text
          })
          .then(() => {
            res.redirect('/login'); // Redirect to the login page after successful registration
          })
          .catch(error => {
            console.error('Error creating user:', error);
            res.status(500).send('Internal Server Error');
          });
      });
    })
    .catch(error => {
      console.error('Error checking existing user:', error);
      res.status(500).send('Internal Server Error');
    });
}); //der

app.listen(port, () => console.log("Listening"));
