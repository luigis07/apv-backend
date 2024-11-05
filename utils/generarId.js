import crypto from 'crypto';

const generarId = () => {
    // return Date.now().toString(32) * Math.random.toString(32).substring(2);
    return crypto.randomUUID().replace(/-/g, '');
}

export default generarId;