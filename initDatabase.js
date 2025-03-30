const fs = require('fs');
const path = require('path');
const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`
};

async function runSQLFile(filePath) {
    const connection = await oracledb.getConnection(dbConfig);
    try {
        const sql = fs.readFileSync(filePath, 'utf8');

        const statements = sql.split(/;\s*[\r\n]+/).filter(stmt => stmt.trim() !== '');

        for (let stmt of statements) {
            try {
                await connection.execute(stmt);
            } catch (err) {
                console.error("SQL error:", err.message);
                console.error("Statement:", stmt.trim().slice(0, 200));
            }
        }

        await connection.commit();
        console.log("✅ SQL script executed successfully.");
    } finally {
        await connection.close();
    }
}

const sqlPath = path.join(__dirname, 'initialize.sql');
runSQLFile(sqlPath).catch(err => console.error("DB Init failed:", err));
