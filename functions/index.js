const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.scheduledCoinRefill = functions.pubsub.schedule("every 120 minutes").onRun(async (context) => {
  const usersRef = admin.database().ref("users");
  const snapshot = await usersRef.once("value");
  const users = snapshot.val();

  for (const userId in users) {
    if (users.hasOwnProperty(userId)) {
      const user = users[userId];
      if (user.coin < 5) {
        const newCoinValue = Math.min(user.coin + 1, 5);
        usersRef.child(userId).update({ coin: newCoinValue });
      }
    }
  }
  return null;
});
