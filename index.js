import express from 'express';
import sql from 'mssql';
import config from './dbConfig.js';

const app = express();
const port = 3000;

app.use(express.json());

// Connect to the database
sql.connect(config, (err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the database');
});

// Sample endpoint
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Get all items
app.get('/items', async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM Items`;
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).send('Server error');
  }
});

// Get a single item by ID
app.get('/items/:id', async (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  try {
    const result = await sql.query`SELECT * FROM Items WHERE id = ${itemId}`;
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).send('Server error');
  }
});

// Create a new item
// Create a new item
app.post('/items', async (req, res) => {
    const newItem = req.body;
    try {
      // Validate that all required fields are present
      if (!newItem.Name || !newItem.Address || !newItem.Date || 
          !newItem.Materials_Subtotal || !newItem.Labor_Subtotal || 
          !newItem.Total || !newItem.Invoice_no || !newItem.Job) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // Insert the new item into the database
      const result = await sql.query`
        INSERT INTO Items (
          Name, Address, Date, Materials_Subtotal, Labor_Subtotal, 
          Total, Invoice_no, Job, Pdf_Location
        ) 
        VALUES (
          ${newItem.Name}, ${newItem.Address}, ${newItem.Date}, 
          ${newItem.Materials_Subtotal}, ${newItem.Labor_Subtotal}, 
          ${newItem.Total}, ${newItem.Invoice_no}, ${newItem.Job}, 
          ${newItem.Pdf_Location || null}
        )
      `;
  
      // Check if the insert was successful
      if (result.rowsAffected && result.rowsAffected[0] > 0) {
        res.status(201).json({ message: 'Item created successfully', item: newItem });
      } else {
        res.status(500).json({ error: 'Failed to create item' });
      }
    } catch (err) {
      console.error('SQL error', err);
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  });

// Update an item by ID
app.put('/items/:id', async (req, res) => {
    const itemId = parseInt(req.params.id, 10);
    const updatedItem = req.body;
  
    // Validate itemId
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
  
    // Validate required fields
    const requiredFields = ['Name', 'Address', 'Date', 'Materials_Subtotal', 'Labor_Subtotal', 'Total', 'Invoice_no', 'Job'];
    const missingFields = requiredFields.filter(field => !updatedItem.hasOwnProperty(field));
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }
  
    try {
      const result = await sql.query`
        UPDATE Items
        SET Name = ${updatedItem.Name},
            Address = ${updatedItem.Address},
            Date = ${updatedItem.Date},
            Materials_Subtotal = ${updatedItem.Materials_Subtotal},
            Labor_Subtotal = ${updatedItem.Labor_Subtotal},
            Total = ${updatedItem.Total},
            Invoice_no = ${updatedItem.Invoice_no},
            Job = ${updatedItem.Job},
            Pdf_Location = ${updatedItem.Pdf_Location || null}
        WHERE Id = ${itemId};
        SELECT @@ROWCOUNT AS affectedRows;
      `;
  
      const affectedRows = result.recordset[0].affectedRows;
  
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
  
      res.status(200).json({ 
        message: 'Item updated successfully', 
        updatedItem: { id: itemId, ...updatedItem }
      });
    } catch (err) {
      console.error('SQL error', err);
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  });
  

// Delete an item by ID
app.delete('/items/:id', async (req, res) => {
    const itemId = parseInt(req.params.id, 10);
  
    // Validate itemId
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
  
    try {
      const result = await sql.query`
        DELETE FROM Items 
        WHERE Id = ${itemId};
        SELECT @@ROWCOUNT AS affectedRows;
      `;
  
      const affectedRows = result.recordset[0].affectedRows;
  
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
  
      res.status(200).json({ message: 'Item deleted successfully', deletedId: itemId });
    } catch (err) {
      console.error('SQL error', err);
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  });

// Start the server
app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
