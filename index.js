const express = require('express');
const requestPromies = require('request-promise');
const request = require('request');

const access_token = 'EAAAAUaZA8jlABAH0LqQP9OvPYBfp1xbgGCzDxk80LEWyY0lIzbLUQUrFzfNL7uIGtnkDn28hC9e9GncrenkJENMeIBC0sJt4mGX7gBUgZCThdDtFBO4tsK3SWIZCD8bjXGHg2VMQbYjuvhxv0RfNKXKt3FVdscZD';
const idUser = '100026375662981';
const idPost = '570578703337769';

const app = express();
app.listen(process.env.PORT || 3009, console.log('Start!'));

const userFieldSet = 'id, name, about, email, accounts, link, is_verified, significant_other, relationship_status, website, picture, photos, feed';
const opition = {
    method: 'GET',
    uri: `https://graph.facebook.com/v2.8/${idPost}`,
    qs: {
        access_token,
        fields: 'link, comments, tags'
    }
}
const arrIdComments = [];

setInterval( () =>
    requestPromies(opition)
    .then(data => JSON.parse(data))
    .then(jsonData => {
        const arrCommentsNew = jsonData.comments.data;
        for (let item of arrCommentsNew) {
            if (!arrIdComments.includes(item.id) && item.message.length < 100){
                arrIdComments.push(item.id);
                // const nameUserComment = item.from.name;
                // const iconRamdom = Math.floor((Math.random() * arrIcons.length));
                const idUserComment = item.from.id;
                getMean(item.message)
                .then(means => {
                    let stringMean = '';
                    for (let mean of means){
                        const en = mean.fields.en;
                        const vi = mean.fields.vi;
                        stringMean += `${en}\n${vi}\n\n`;
                    }
                    const result = stringMean.replace(/<em>/g, '');
                    const result1 = result.replace(/<\/em>/g, '');
                    const result2 = encodeURI(result1);
                    if (result2 === '') {
                        postComment(access_token, idPost, `Hi O:) @[${idUserComment}:0] INPUT INVALID DATA :) :D :( :'( :P O:) 3:) o.O ;) :O -_- >:O :* <3 :) :D :( :'( :P O:) 3:) o.O ;) :O -_- >:O :* <3 :) :D :( :'( :P O:) 3:) o.O ;) :O -_- >:O :* <3 `);    
                    } else {
                        postComment(access_token, idPost, `Hi :v @[${idUserComment}:0] <3 \n ${result2}`);
                    }
                })
                .catch(err => {
                    postComment(access_token, idPost, `:v @[${idUserComment}:0] <3 \n Please stop....................................................................................................................................................................:v`);
                });
            }
        }
    }), 300);

const API_KEY = 'WBBcwnwQpV89';
const arrChar = ['à','á','ạ','ả','ã','â','ầ','ấ','ậ','ẩ','ẫ','ă','ằ','ắ','ặ','ẳ','ẵ','è','é','ẹ','ẻ','ẽ','ê','ề','ế','ệ','ể','ễ','ì','í','ị','ỉ','ĩ','ò','ó','ọ','ỏ','õ','ô','ồ','ố','ộ','ổ','ỗ','ơ','ờ','ớ','ợ','ở','ỡ','ù','ú','ụ','ủ','ũ','ư','ừ','ứ','ự','ử','ữ','ỳ','ý','ỵ','ỷ','ỹ','đ','À','Á','Ạ','Ả','Ã','Â','Ầ','Ấ','Ậ','Ẩ','Ẫ','Ă','Ằ','Ắ','Ặ','Ẳ','Ẵ','È','É','Ẹ','Ẻ','Ẽ','Ê','Ề','Ế','Ệ','Ể','Ễ','Ì','Í','Ị','Ỉ','Ĩ','Ò','Ó','Ọ','Ỏ','Õ','Ô','Ồ','Ố','Ộ','Ổ','Ỗ','Ơ','Ờ','Ớ','Ợ','Ở','Ỡ','Ù','Ú','Ụ','Ủ','Ũ','Ư','Ừ','Ứ','Ự','Ử','Ữ','Ỳ','Ý','Ỵ','Ỷ','Ỹ','Đ'];
const arrExcept = [ 'loz', 'lồn', 'cặc', 'haha', 'hehe', 'kaka', 'hihi'];

function getMean(value) {
    let language = 'en';
    for (let char of arrChar) {
        if (value.includes(char)) {
            language = 'vi';
            value = encodeURI(value);
        }
    }
    return new Promise((resolve, reject) => {
        request(`http://api.tracau.vn/${API_KEY}/${value}/${language}/JSON_CALLBACK`, (err, res, body) => {
            for (let except of arrExcept) {
                if (value.includes(except)) {
                    reject(err);       
                }
            }
            if (err) reject(err)
            const JSON_CALLBACK = 'JSON_CALLBACK(';
            const a = JSON.parse(body.substring(JSON_CALLBACK.length, body.length - 3));
            resolve(a.sentences);
        });
    });
}

function postComment(access_token, idPost, message) {
    return new Promise((resolve, reject) => {
        request.post({
            url: `https://graph.facebook.com/${idPost}/comments/?access_token=${access_token}&message=${message}`
        }, (err, res, body) => {
            if (err) reject(err);
            resolve(body);
        });
    });
}