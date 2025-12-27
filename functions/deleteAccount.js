const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.deleteAccount = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be logged in"
      );
    }

    const uid = context.auth.uid;

    // 🔥 Delete Firestore user doc
    await admin.firestore().doc(`users/${uid}`).delete();

    // 🗑 Delete logo (best effort)
    await admin
      .storage()
      .bucket()
      .file(`logos/${uid}`)
      .delete()
      .catch(() => {});

    // 🔐 Delete Auth account
    await admin.auth().deleteUser(uid);

    return { success: true };
  }
);
