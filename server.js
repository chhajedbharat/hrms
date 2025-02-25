const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Azure SQL Connection Configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, // Example: myserver.database.windows.net
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Required for Azure
        trustServerCertificate: false
    }
};

// Connect to SQL Server
sql.connect(dbConfig)
    .then(() => console.log("Connected to Azure SQL Database"))
    .catch(err => console.error("Database connection error:", err));

// API to Get All Leaves
app.get("/api/leaves", async (req, res) => {
    try {
        const result = await sql.query("SELECT * FROM Leaves");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// API to Request Leave (POST)
app.post("/api/leaves", async (req, res) => {
    try {
        const { type, days, remaining } = req.body;
        await sql.query(`INSERT INTO Leaves (type, days, remaining) VALUES ('${type}', ${days}, ${remaining})`);
        res.status(201).json({ message: "Leave requested successfully" });
    } catch (err) {
        res.status(400).json({ error: "Bad Request" });
    }
});

// API to Update Leave (PUT)
app.put("/api/leaves/:id", async (req, res) => {
    try {
        const { type, days, remaining } = req.body;
        await sql.query(`UPDATE Leaves SET type='${type}', days=${days}, remaining=${remaining} WHERE id=${req.params.id}`);
        res.json({ message: "Leave updated successfully" });
    } catch (err) {
        res.status(400).json({ error: "Update failed" });
    }
});

// API to Delete Leave (DELETE)
app.delete("/api/leaves/:id", async (req, res) => {
    try {
        await sql.query(`DELETE FROM Leaves WHERE id=${req.params.id}`);
        res.json({ message: "Leave deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: "Delete failed" });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Leave API running at http://localhost:${port}`);
});
