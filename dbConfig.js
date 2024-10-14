// dbConfig.js
const config = {
    user: 'therbert',
    password: 'Pebbles22.',
    //server: 'TOMDELL\\SQLEXPRESS', // Note the double backslashes
    server:'thplumbing.database.windows.net',
    database: 'sqlplumbing',
    options: {
      encrypt: true, // Use this if you're on Windows Azure
      trustServerCertificate: false // Change to false if you are using a trusted certificate
    }
  };
  
  export default config;
  