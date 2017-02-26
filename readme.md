# Shoplist server

## installing

     git clone https://github.com/palbcn/shoplist.git
     npm install
     npm run first
   
## running
   
     npm start
     open http://localhost:60784
     
     
## Components

uses node.js on the server 

uses plain jquery on the client

uses sqlite as backend DB 


## data model 

The data model is a work in progress. The analysis is very initial. See `shoplist.sql` for the schema at this point in time.

And is still to be implemented. Currently only one table is used, the `shopitems` table.

## security

To be designed. 

The plan is to add an authorization layer based on `passport` with the user credentials in the database, their passwords secured with `bcrypt`


