var express = require('express');
var router = express.Router();

/* GET users listing. */
var routes = function(app, redisClient, chatters, chat_messages){
    router.post('/join', function(req, res) {
        var username = req.body.username;
        if (chatters.indexOf(username) === -1){
            chatters.push(username);
            redisClient.set('chat_users', JSON.stringify(catters));
            res.json({
               'chatters': chatters,
                'status': 'OK'
            });
        }else{
            res.json({
                'status': 'FAILED'
            })
        }
    });

    routes.post('/leave', function(req, res){
       var username = req.body.username;
        chatters.splice(chatters.indexOf(username), 1);
        redisClient.set('chat_users', JSON.stringify(chatters));
        res.json({
            'status': 'OK'
        });
    });

    routes.post('/send_message', function(req, res){
        var username = req.body.username;
        var message = req.body.message;
        chat_messages.push({
            'sender' : username,
            'message': message
        });

        redisClient.set('chat_app_message', JSON.stringify(chat_messages));
        res.json({
           'status': 'OK'
        });
    });

    routes.get('/get_messages', function(req, res){
       res.json(chat_messages);
    });

    routes.get('/get_chatters', function(req, res){
       res.json(chatters);
    });

    return router;
}


module.exports = routes;
