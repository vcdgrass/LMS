const app = require('./app');

const PORT = process.env.PORT ;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API docs /auth/register: http://localhost:${PORT}/api-docs/#/`);
});