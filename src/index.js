const express = require('express');
const { get } = require('axios');
const bodyParser = require('body-parser');
const session = require('express-session');

let items;
const PORT = 4321;
const URL = 'https://kodaktor.ru/j/users';
const app = express();
const checkAuth = (r, res, next) => {
	if (r.session.auth === 'ok') {
		next();
	} else {
		res.redirect('/login');
	}
};

app
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(session({	secret:	'mysecret',	resave:	true,	saveUninitialized:	true }))

    .get(/hello/, r => r.res.end('Hello world!'))
    .get('/login', r => r.res.render('login'))
    .post('/login/check', r => {
    	const { body: { login: l } } = r;
    	const user = items.find(({ login }) => login === l);
    	if (user){
    	  if (user.password == r.body.pass){
    			r.session.auth = 'ok';
    			r.res.redirect('/users');
    		} else {
    			r.res.send('Не верный пароль');
    		}
    	} else {
    		r.res.send('Нет такого пользователя');
    	}
    })
    .get('/logout', r => {
    	r.session.auth === null;
    	r.res.redirect('/login');
    })
    .get(/users/, checkAuth, async r => r.res.render('list', { title: 'Список логинов', items }))
    .get('/author', r => 
    	r.res.send('<h4 id="author" title="GossJS">EgorAlmikeev</h4>')
    )

    .use(r => r.res.status(404).end('Page not found.\n' +
      'You can go on:\n' +
      '/hello\n' +
      '/login\n' +
      '/users\n' +
      '/author\n'
      ))
    .use((e, r, res, n) => res.status(500).end(`Error: ${e}`))
    .set('view engine', 'pug')
    .listen(process.env.PORT || PORT, async () => {
    	console.log('My pid is very big: ' + process.pid);
    ({ data: {users: items} } = await get(URL));
});
