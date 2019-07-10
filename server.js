var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var flash = require('express-flash');
var path = require('path');
var session = require('express-session');

app.use(session({
    secret:"secretkey",
    resave:false,
    saveUninitalized: true,
    cookie:{maxAge: 60000}
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, './static')));
app.use(flash());

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/message_board');
mongoose.Promise = global.Promise;
var CommentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    comment: {type: String, required: true},
}, {timestamps:true});

var MessageSchema = new mongoose.Schema({
    name: {type: String, required: true},
    message: {type: String, required: true},
    comments: [CommentSchema]
}, {timestamps:true});
mongoose.model('Message', MessageSchema);
var Message = mongoose.model('Message');


mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');


// localhost:8000 --- Index Page
app.get('/', function(req, res){
    Message.find({}, function(err, message){
        if(err){
            console.log('something went wrong');
        }
        res.render('index', {messages:message})
    });

});

// localhost:8000 --- Message POST
app.post('/message', function(req, res){
    var message = new Message({name: req.body.name, message: req.body.message});
    message.save(function(err){
        if(err){
            console.log('something went wrong', err);
            for (var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/new');
        } else {
            console.log('successfully added data!')
            res.redirect('/')
        }       
    });
});

// localhost:8000 --- Comment POST
app.post('/comment/:id', function(req, res){
    var comment = new Comment({name: req.body.name, comment: req.body.comment});
    comment.save(function(err){
        if(err){
            console.log('something went wrong', err);
            for (var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/');
        } else {
            Message.findOneAndUpdate({name: req.params.id}, {$push: {comments: comment}}, function(err, data){
                if(err){
                    console.log('something went wrong')
                } else {

                    console.log('successfully added data!')
                    res.redirect('/')
                }
            })
        }       
    });
});
app.listen(8000, function(){
    console.log('listening on port 8000');
});