const express = require('express')
const router = express.Router()
// Require user model
const User = require('../models/user.model')
// Add bcrypt to encrypt passwords
const bcrypt = require('bcrypt')
const bcryptSalt = 10
// Add passport
const passport = require('passport')

const ensureLogin = require('connect-ensure-login')
const { checkLoggedIn } = require('../middleware')

router.get('/signup', (req, res) => res.render('auth/signup'))
router.post('/signup', (req, res, next) => {

	const { username, password } = req.body

	if (username === '' || password === '') {
		res.render('auth/signup', {errorMsg: 'Fill in the blanks'})
		return
	}

	User
		.findOne({ username })
		.then(user => {

			if (user) {
				res.render('auth/signup', {errorMsg: 'User already registered'})
				return
			}

			const salt = bcrypt.genSaltSync(bcryptSalt)
			const hashPass = bcrypt.hashSync(password, salt)

			User
				.create({username, password: hashPass})
				.then(() => res.redirect('/'))
				.catch(err => next(new Error(err)))

		})
		.catch(err => next(new Error(err)))

})

router.get('/login', (req, res) => res.render('auth/login', {errorMsg: req.flash('error')}))
router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true,
	passReqCallback: true
}))



router.get('/private-page', checkLoggedIn, (req, res) => {
	res.render('auth/private', { user: req.user })
})

module.exports = router
