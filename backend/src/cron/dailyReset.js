const cron = require("node-cron");
const Token = require("../models/Token");

const dailyTokenReset = () => {
  // Runs every day at 12:00 AM
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("🔄 Running daily token reset...");

      // OPTION 1: delete all tokens
      await Token.deleteMany({});

      // OPTION 2 (alternative): mark tokens as inactive
      // await Token.updateMany({}, { status: "expired" });

      console.log("✅ Tokens reset successfully");
    } catch (err) {
      console.error("❌ Token reset failed:", err.message);
    }
  });
};

module.exports = dailyTokenReset;
