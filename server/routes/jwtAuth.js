const router = require("express").Router();
const pool  =  require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");

//register
router.post("/register",validInfo,async(req,res) =>{
    try {

    //    1. destructure the req.body (name,email,password)
            const {name, email, password } = req.body;
    //    2. check if user exist ( if user exist then throw error)
            const user = await pool.query("SELECT * from users where user_email = $1",[
                email
            ]);

            if (user.rows.length !== 0){
                return res.status(401).send("user already exist");
            }
            //res.json(user.rows)
    //    3. Bcrypt the user password

            const saltRound = 10;
            const salt = await bcrypt.genSalt(saltRound);
            const bcryptPassword = await bcrypt.hash(password,salt);
    //    4. enter the new user inside  our database
            
            const newUser = await pool.query("INSERT INTO USERS(user_name,user_email,user_password) VALUES  ($1,$2,$3) RETURNING *" , [name,email, bcryptPassword]);
           // res.json(newUser.rows[0]);
            //    5. generating the jwt token  

            const token = jwtGenerator(newUser.rows[0].user_id)
            res.json({ token });
    }
    catch (err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.post("/login", validInfo,async(req,res) =>{
    try {
        // 1. destructure the req.body 
        const { email, password} = req.body;

        // 2. check if user does exist ( if not then throw error)

        loggedUser = await pool.query("SELECT * from users where user_email = $1",[
            email
        ]);

        if (loggedUser.rows.length === 0){
            return res.status(401).json("Password or email is incorrect");  
        }
        
        // 3. check if incoming password is matching with database password
        const validPassword = await bcrypt.compare(password,loggedUser.rows[0].user_password)
        if(!validPassword){
            return res.status(401).json("Password or email is incorrect");  
        }
        //4. generate jwt token for the session 

        const token = jwtGenerator(loggedUser.rows[0].user_id);

        res.json( { token });
    } catch (error) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

router.get("/is-verify", authorization,async(req,res) => {
    try {
        res.json(true);
    } catch (error) {
        console.log(err.message);
        res.status(500).send("Server Error");     
    }
});

module.exports = router;