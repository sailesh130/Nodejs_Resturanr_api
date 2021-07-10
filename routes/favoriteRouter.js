const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
var authenticate = require('../authenticate');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser,(req,res,next) => {
    Favorites.findOne({'user':req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({'user':req.user._id})
    .then((favorites) => {
    
        if(favorites != null){
        	
        	for(var i=0;i<=req.body.length-1;i++)
        	{
        		if(favorites.dishes.indexOf(req.body[i]._id.toString()) !== -1){
        			err = new Error(req.body[i]._id +' Alreay exist in favorite list');
        			err.statusCode = 405;
        			return next(err);
        		}
        		else{
        			
        			favorites.dishes.push(req.body[i]._id);
        		}
        	}
        	favorites.save()
        	.then((favorites)=>{
        		res.statusCode = 200;
        		res.setHeader('Content-Type', 'application/json');
        		res.json(favorites);
        	},(err)=>next(err))
        }
        else{
        		console.log('null');
        	Favorites.create({"user":req.user._id})
        	.then((favorite)=>{

        		for(var i=0;i<=req.body.length-1;i++)
        			{
        			favorite.dishes.push(req.body[i]._id);
        			}
        	favorite.save()
        	.then((favorite)=>{
        		res.statusCode = 200;
        		res.setHeader('Content-Type', 'application/json');
        		res.json(favorite);
        	},(err)=>next(err))
        },(err) => next(err))
}},(err)=>next(err)) 
 .catch((err)=>next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})

.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.remove({'user':req.user._id})
    .populate('dishes.dish','user')
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favoriteRouter.route('/:dishId')
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/'+ req.params.dishId);
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({'user':req.user._id})
    .then((favorites) => {
        if(favorites != null){

        		if(favorites.dishes.indexOf(req.params.dishId) == -1){
        			favorites.dishes.push(req.params.dishId);
        		}
        		else{
        			err = new Error(req.params.dishId + ' Alreay exist in list');
        			err.statusCode = 405;
        			return next(err);
        		}
        	favorites.save()
        	.then((favorites)=>{
        		res.statusCode = 200;
        		res.setHeader('Content-Type', 'application/json');
        		res.json(favorites);
        	},(err)=>next(err))
        }
        else{
        	Favorites.create({"user":req.user._id})
        	.then((favorite)=>{
        			favorite.dishes.push(req.params.dishId);
        	favorite.save()
        	.then((favorite)=>{
        		res.statusCode = 200;
        		res.setHeader('Content-Type', 'application/json');
        		res.json(favorite);
        	},(err)=>next(err))
        },(err) => next(err))
}},(err)=>next(err)) 
 .catch((err)=>next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite) {            
            index = favorite.dishes.indexOf(req.params.dishId);
            if (index >= 0) {
                favorite.dishes.splice(index, 1);
                favorite.save()
                .then((favorite) => {
                    console.log('Favorite Deleted ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Favorites not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});



module.exports = favoriteRouter;