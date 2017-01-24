(function(){
    var socket = io();
    var chatter_count = 0;
    var $chatinfo = $('.chat-info');
    var $joinchatBtn = $('#join-chat');
    var $chat = $('.chat');
    var $leavechatBtn = $('#leave-chat');
    var $sendmessageBtn = $('#send-message');
    var $username = $('#username');
    var $messages = $('.messages');
    var $message = $('#message');
    var $joinchat = $('.joinchat');

    $.get('/users/get_chatters', function(resp){
        chatter_count = resp.length;
        $chatinfo.text('There are currently ' + chatter_count + ' people in the chat room');
    });

    $joinchatBtn.on('click', function(){
        var username = $.trim($username.val());
        $.ajax({
            url: '/users/join',
            type: 'POST',
            data: {
                username: username
            },
            success: function(resp){
                if (resp.status = 'OK'){
                    socket.emit('update_chatter_count', { 'action': 'increase' });
                    $chat.show();
                    $leavechatBtn.data('username', username);
                    $sendmessageBtn.data('username', username);

                    $.get('/users/get_messages', function(resp){
                        if(resp.length > 0){
                            var message_count = resp.length;
                            var html = '';
                            for (var x = 0; x < message_count; x+=1){
                                html += constructMessage(resp[x].sender, resp[x].message);
                            }
                            $messages.html(html);
                        }
                    });

                    $joinchat.hide();
                } else if (resp.status = 'FAILED') {
                    alert('The username already exists. Please choose another');
                    $username.val('').focus();
                }
            }
        });
    });

    $leavechatBtn.on('click', function(){
        var username = $(this).data('username');
        $.ajax({
            url: '/users/leave',
            type: 'POST',
            dataType: 'json',
            data: { username: username },
            success: function(resp){
                if (resp.status == 'OK'){
                    socket.emit('message', { 'username': username,  'message': username + ' has left the chat room...'});
                    socket.emit('update_chatter_count', { 'action': 'decrease' });
                    $chat.hide();
                    $joinchat.show();
                    $username.val('');
                    alert('You have successfully left the chat room');
                }
            }
        });
    });

    $sendmessageBtn.on('click', function(){
        var username = $(this).data('username');
        var message = $.trim($message.val());
        $.ajax({
            url: '/users/send_message',
            type: 'POST',
            dataType: 'json',
            data: { 'username': username, 'message': message },
            success: function(resp){
                if (resp.status == 'OK'){
                    socket.emit('message', { 'username': username, 'message': message });
                    $message.val('');
                }
            }
        })
    });

    socket.on('send', function(data){
        $messages.append(constructMessage(data.username, data.message));
    });

    socket.on('count_chatters', function(data){
       (data.action == 'increase')
            ? chatter_count ++
            : chatter_count --;
        $chatinfo.text("There are currently " + chatter_count + "people in the chat room");
    });

    function constructMessage(user, msg){
        return [
            '<div class="msg">',
                '<div class="user">' + user + ':</div>',
                '<div class="txt">' + msg + '</div>',
            '</div>'
        ].join('');
    }

})();