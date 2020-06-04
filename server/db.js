const Pool = require("pg").Pool

const pool = new Pool({
    user: "nishant",
    password: "8055d1k3",
    host: "localhost",
    port: 5432,
    database: "jwtpern"
});

module.exports = pool;