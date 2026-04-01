import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

const processENV = process.env.TEST_ENV
const env = processENV || 'dev'
console.log(`Test env is: ${env}`)
const config = {
    apiUrl: 'https://conduit-api.bondaracademy.com/api',
    userEmail: '',
    userPassword: ''
}


if (env === 'prod') {
    config.userEmail = process.env.PROD_USERNAME as string
    config.userPassword = process.env.PROD_PASSWORD as string
}
export {config}