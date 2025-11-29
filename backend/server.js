require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoute = require('./src/routes/authRoute');
const adminRoute = require('./src/routes/adminRoute');
const categoryRoutes = require('./src/routes/categoryRoute');
const coursesRoute = require('./src/routes/coursesRoute');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Sử dụng các route
app.use('/auth', authRoute);  
app.use('/admin', adminRoute);
app.use('/categories', categoryRoutes);
app.use('/courses', coursesRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});