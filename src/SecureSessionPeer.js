const nacl = require('libsodium-wrappers');
const Decryptor = require('./Decryptor');
const Encryptor = require('./Encryptor');

module.exports = async (peer) => {
    await nacl.ready;

    let keypair = nacl.crypto_kx_keypair();
    let encryptor;
    let decryptor;
    let keys;
    let messages = [];
    let otherPeer = peer;
    

    let obj = Object.freeze({
        publicKey: keypair.publicKey,

        encrypt: (msg) => {
            return encryptor.encrypt(msg);
        },
        generateSharedKeys: async (obj) => {
            keys = nacl.crypto_kx_client_session_keys(keypair.publicKey, keypair.privateKey, obj.publicKey);
            encryptor = await Encryptor(keys.sharedTx);
            decryptor = await Decryptor(keys.sharedRx);
            otherPeer = obj;
        },
        decrypt: (cipher, nonce) => {
            return decryptor.decrypt(cipher, nonce);
        },
        send: (msg) => {
            let encryptedMsg = obj.encrypt(msg);
            otherPeer.addToMsgQueue(encryptedMsg);
        },
        receive: () => {
            let encryptedMsg = messages.shift();
            let msg = obj.decrypt(encryptedMsg.ciphertext, encryptedMsg.nonce);
            return msg;
        },
        addToMsgQueue: (msg) => {
            messages.push(msg);
        }
    })

    if (otherPeer) {
        keys = nacl.crypto_kx_server_session_keys(keypair.publicKey, keypair.privateKey, otherPeer.publicKey);
        otherPeer.generateSharedKeys(obj)
        encryptor = await Encryptor(keys.sharedTx);
        decryptor = await Decryptor(keys.sharedRx);
    }

    return obj;
}