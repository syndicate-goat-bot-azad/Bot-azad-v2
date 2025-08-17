/**
 * Author: Az ad
 * All-in-One DB Schema Monitor
 * Features:
 *  - DB connection
 *  - Models (example)
 *  - Schema check (missing/extra fields)
 *  - CRITICAL log
 *  - Email alert
 *  - Ready for Windows & Linux scheduling
 */

const { Sequelize, DataTypes } = require("sequelize");
const fs = require("fs");
const nodemailer = require("nodemailer");

// === CONFIG ===
const CONFIG = {
  db: {
    dialect: "mysql",
    host: "localhost",
    database: "DB_NAME",
    user: "DB_USER",
    password: "DB_PASS"
  },
  email: {
    service: "gmail",
    user: "your_email@gmail.com",
    pass: "your_app_password",
    to: "alert_receiver@gmail.com"
  },
  logFile: "db_schema_critical.log"
};

// === DB Connection ===
const sequelize = new Sequelize(
  CONFIG.db.database,
  CONFIG.db.user,
  CONFIG.db.password,
  {
    host: CONFIG.db.host,
    dialect: CONFIG.db.dialect,
    logging: false
  }
);

// === Example Models (replace with your models) ===
const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  age: { type: DataTypes.INTEGER }
});

const Post = sequelize.define("Post", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  title: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT },
  userId: { type: DataTypes.INTEGER }
});

// === Email Setup ===
const transporter = nodemailer.createTransport({
  service: CONFIG.email.service,
  auth: {
    user: CONFIG.email.user,
    pass: CONFIG.email.pass
  }
});

const sendEmailAlert = (subject, message) => {
  transporter.sendMail({
    from: CONFIG.email.user,
    to: CONFIG.email.to,
    subject,
    text: message
  }, (err, info) => {
    if (err) console.error("🔥 Email error:", err);
    else console.log("📧 Email sent:", info.response);
  });
};

// === Log Helper ===
const logCritical = (message) => {
  const logMessage = `[${new Date().toISOString()}] CRITICAL: ${message}\n`;
  fs.appendFileSync(CONFIG.logFile, logMessage, "utf8");
};

// === Schema Checker ===
const checkSchema = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    const models = sequelize.models;

    for (let modelName in models) {
      const model = models[modelName];
      const tableName = model.getTableName();

      const [results] = await sequelize.query(`SHOW COLUMNS FROM ${tableName}`);
      const dbFields = results.map(c => c.Field);
      const modelFields = Object.keys(model.rawAttributes);

      const missing = modelFields.filter(f => !dbFields.includes(f));
      const extra = dbFields.filter(f => !modelFields.includes(f));

      if (missing.length || extra.length) {
        const alertMsg = `Table: ${tableName}\nMissing Fields: ${missing}\nExtra Fields: ${extra}`;
        console.log(`\n⚠️ CRITICAL: ${alertMsg}`);

        // Save log
        logCritical(alertMsg);
        // Send email
        sendEmailAlert(`CRITICAL DB Schema Alert: ${tableName}`, alertMsg);
      } else {
        console.log(`✅ Table ${tableName} schema OK`);
      }
    }
  } catch (err) {
    console.error("🔥 Schema check error:", err);
  } finally {
    await sequelize.close();
    console.log("\n🔔 Schema check finished");
  }
};

// === Run Monitor ===
checkSchema();

/**
 * === Windows Setup ===
 * 1. Create runMonitor.bat with:
 *    @echo off
 *    C:\Program Files\nodejs\node.exe C:\Path\To\dbSchemaMonitor.js
 *
 * === Linux Setup ===
 * 1. Add cron job:
 *    0 * * * * /usr/bin/node /path/to/dbSchemaMonitor.js >> /path/to/db_schema_monitor.log 2>&1
 */
