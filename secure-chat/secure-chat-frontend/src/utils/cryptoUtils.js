import CryptoJS from "crypto-js";
import { KEYUTIL, KJUR } from "jsrsasign";

// Generate RSA Key Pair
export function generateRSAKeyPair() {
  const keyPair = KEYUTIL.generateKeypair("RSA", 2048);
  return {
    privateKey: KEYUTIL.getPEM(keyPair.prvKeyObj, "PKCS1PRV"),
    publicKey: KEYUTIL.getPEM(keyPair.pubKeyObj),
  };
}

export function generateAESKey(userId1, userId2) {
  const sortedIds = [userId1, userId2].sort().join(""); // ✅ Ensure consistent order
  return CryptoJS.SHA256(sortedIds).toString(CryptoJS.enc.Hex); // ✅ Use SHA-256 for consistency
}

// Encrypt a message using AES-256
export function encryptAES(message, key) {
  try {
    if (!message || !key) throw new Error("Missing data for encryption");

    const keyBytes = CryptoJS.enc.Hex.parse(key);
    const iv = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(message, keyBytes, {
      iv,
      mode: CryptoJS.mode.CBC,
    });

    return JSON.stringify({
      iv: CryptoJS.enc.Hex.stringify(iv),
      ciphertext: encrypted.toString(),
    });
  } catch (error) {
    console.error("❌ Encryption failed:", error);
    return null;
  }
}

export function decryptAES(encryptedMessage, key) {
  try {
    if (!encryptedMessage || !key)
      throw new Error("Missing data for decryption");

    console.log("🔹 Encrypted Message:", encryptedMessage);
    console.log("🔹 AES Key:", key);

    const parsed = JSON.parse(encryptedMessage);
    console.log("🔹 Parsed Data:", parsed);

    const keyBytes = CryptoJS.enc.Hex.parse(key);
    const iv = CryptoJS.enc.Hex.parse(parsed.iv);
    console.log("🔹 IV:", parsed.iv);

    const decrypted = CryptoJS.AES.decrypt(parsed.ciphertext, keyBytes, {
      iv,
      mode: CryptoJS.mode.CBC,
    });
    const result = decrypted.toString(CryptoJS.enc.Utf8);

    if (!result) throw new Error("Decryption result is empty");

    return result;
  } catch (error) {
    console.error("❌ Decryption failed:", error);
    return "Decryption failed!";
  }
}

export function signMessage(privateKey, message) {
  try {
    if (!privateKey || !message) {
      throw new Error("Invalid input: Private key or message missing.");
    }

    const sig = new KJUR.crypto.Signature({ alg: "SHA256withRSA" });
    sig.init(privateKey);
    sig.updateString(message);
    return sig.sign();
  } catch (error) {
    console.error("Signing error:", error);
    return null; // Return null on failure
  }
}
