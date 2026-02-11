// checkModel.js
const mongoose = require('mongoose');
require('dotenv').config(); // If you use dotenv

async function checkParagraphModel() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/typing-test-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Try to load the Paragraph model
    let Paragraph;
    try {
      Paragraph = require('./models/Paragraph');
      console.log('✅ Paragraph model loaded successfully');
    } catch (error) {
      console.log('❌ Could not load Paragraph model from ./models/Paragraph');
      console.log('Error:', error.message);
      
      // Try alternative path
      try {
        Paragraph = require('../models/Paragraph');
        console.log('✅ Paragraph model loaded successfully from ../models/Paragraph');
      } catch (error2) {
        console.log('❌ Could not load Paragraph model from ../models/Paragraph either');
        process.exit(1);
      }
    }
    
    // Check if model is registered
    if (mongoose.modelNames().includes('Paragraph')) {
      console.log('✅ Paragraph model is registered with Mongoose');
    } else {
      console.log('⚠️  Paragraph model is not registered with Mongoose');
    }
    
    // Get the schema
    const schema = Paragraph.schema;
    
    console.log('\n📋 ========== PARAGRAPH SCHEMA DETAILS ==========');
    console.log('\n📊 ALL FIELDS:');
    const fields = Object.keys(schema.paths);
    fields.forEach(field => {
      const path = schema.paths[field];
      console.log(`  ${field}:`);
      console.log(`    Type: ${path.instance}`);
      console.log(`    Required: ${path.isRequired || false}`);
      if (path.options && path.options.default !== undefined) {
        console.log(`    Default: ${path.options.default}`);
      }
      if (path.options && path.options.enum) {
        console.log(`    Enum: ${path.options.enum}`);
      }
      console.log('');
    });
    
    // Check for required fields
    console.log('\n🔍 REQUIRED FIELDS:');
    const requiredFields = fields.filter(field => schema.paths[field].isRequired);
    if (requiredFields.length > 0) {
      requiredFields.forEach(field => {
        console.log(`  - ${field}`);
      });
    } else {
      console.log('  No required fields found');
    }
    
    // Check sample document structure
    console.log('\n📝 SAMPLE DOCUMENT STRUCTURE:');
    const sampleDoc = {};
    fields.forEach(field => {
      const path = schema.paths[field];
      if (path.instance === 'String') {
        sampleDoc[field] = `Sample ${field}`;
      } else if (path.instance === 'Number') {
        sampleDoc[field] = 1;
      } else if (path.instance === 'Boolean') {
        sampleDoc[field] = false;
      } else if (path.instance === 'Date') {
        sampleDoc[field] = new Date();
      } else if (path.instance === 'Array') {
        sampleDoc[field] = [];
      } else if (path.instance === 'Object') {
        sampleDoc[field] = {};
      }
    });
    console.log(JSON.stringify(sampleDoc, null, 2));
    
    // Check if there are existing documents
    console.log('\n🗃️  EXISTING DOCUMENTS IN DATABASE:');
    const count = await Paragraph.countDocuments();
    console.log(`Total documents: ${count}`);
    
    if (count > 0) {
      const sampleDoc = await Paragraph.findOne();
      console.log('\n📄 SAMPLE DOCUMENT FROM DATABASE:');
      console.log(JSON.stringify(sampleDoc.toObject(), null, 2));
      
      console.log('\n🔑 FIELD NAMES FROM EXISTING DOCUMENT:');
      const docFields = Object.keys(sampleDoc.toObject());
      docFields.forEach(field => {
        console.log(`  - ${field}: ${typeof sampleDoc[field]}`);
      });
    }
    
    mongoose.connection.close();
    console.log('\n🎉 Model check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the check
checkParagraphModel();