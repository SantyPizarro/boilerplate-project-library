/*
*
*
* Complete the API routing below
* * */

'use strict';

const mongoose = require('mongoose');

mongoose.connect(process.env.DB)
  .then(() => console.log("Conectado exitosamente a MongoDB"))
  .catch(err => console.error("Error de conexión a MongoDB:", err));

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    
    // 3. GET ALL BOOKS
    .get(async function (req, res){
      try {
        const books = await Book.find({});
        const formatBooks = books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        }));
        return res.json(formatBooks);
      } catch (err) {
        return res.status(500).json({ error: "Error al obtener los libros" });
      }
    })
    
// 2. POST NEW BOOK
    .post(async function (req, res){
      let title = req.body.title;
      
      if (!title) {
        return res.send('missing required field title');
      }

      try {
        const newBook = new Book({ title });
        const savedBook = await newBook.save();
        return res.json({ _id: savedBook._id, title: savedBook.title });
      } catch (err) {
        console.error(err);
        
      }
    })
    
    // 7. DELETE ALL BOOKS
    .delete(async function(req, res){
      try {
        await Book.deleteMany({});
        return res.send('complete delete successful');
      } catch (err) {
        return res.status(500).json({ error: "Error al eliminar los libros" });
      }
    });



  app.route('/api/books/:id')
    
    // 4. GET SINGLE BOOK
    .get(async function (req, res){
      let bookid = req.params.id;
      
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        return res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        return res.send('no book exists');
      }
    })
    
    // 5. POST COMMENT TO A BOOK
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      
      if (!comment) {
        return res.send('missing required field comment');
      }

      try {
        const updatedBook = await Book.findByIdAndUpdate(
          bookid,
          { $push: { comments: comment } },
          { returnDocument: 'after' }
        );

        if (!updatedBook) {
          return res.send('no book exists');
        }

        return res.json({
          _id: updatedBook._id,
          title: updatedBook.title,
          comments: updatedBook.comments
        });
      } catch (err) {
        return res.send('no book exists');
      }
    })
    
    // 6. DELETE SINGLE BOOK
    .delete(async function(req, res){
      let bookid = req.params.id;
      
      try {
        const deletedBook = await Book.findByIdAndDelete(bookid);
        if (!deletedBook) {
          return res.send('no book exists');
        }
        return res.send('delete successful');
      } catch (err) {
        return res.send('no book exists');
      }
    });
  
};