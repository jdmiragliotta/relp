#RELP

##General Project Summary

RELP – Rutgers own version of Yelp. Users will be able to add things to do, eat, see and play at or around Rutgers University. Users will be able to view all the places that are uploaded. Users will also be able to leave comments and reviews. RELP will allow users to search for specific categories such as places to eat, things to do, sporting events, and etc. Users will be able to add all the information via a drop down form.

## OUTLINE

###Git Repo – Add Contributors
  Jeremy Miragliotta
  DongHoon Kim
  Richenda Gould

###Heroku App – Add Contributors
  Jeremy Miragliotta
  DongHoon Kim
  Richenda Gould

###Require NPM
  * Express
  * Express Handlebars
  * Express-Session
  * Body Parser
  * Sequelize
  * BCryptJS
  * Passport
  * PassportLocal – will change after Heroku Database set up
  * MySQL

###Set Up Handlebar code
  *DefaultLayout Main – Into Layouts
    *Materialize
    *CSS
    *JS / jQuery
*Views
  *Index
  *Login/Registration
  *Place Detail
  *Place Listing – Search

###Database Connection Via Sequelize

###Create Cookie Session

###Passport Linkage
  *User Info
    *FirstName
    *NotNull, Must Be STRING, validation:Can only accept letter is[ ]
    *LastName
    *NotNull, Must Be STRING, validation:Can only accept letter is[ ]
    *Username
    *NotNull, Must Be STRING,  unique, validate 5 to 30
    *Password
    *NotNull, Must Be STRING, validate 8 to 25

  *Place Info
    *Name
      *NotNull, Must Be STRING, validation:Can only accept letter is[ ] Unique
    Address
      *NotNull, Must Be STRING, validation:Can only accept letter is[ ] Unique
    Phone
      *NotNull, Must Be STRING, validation:Can only accept letter is[ ] Unique
    Comments
      *NotNull, Must Be STRING,  Unique len 3 -500
    Category
    * NotNull, dropdown form♣
    Star Review

###LINK TABLES - relationship
  * Place has many users
  * User has many comments
  * User has many entries

###Route SetUp

  *APP.GET
    * Index
    * Login
    * Logout
    * Register
    * Place LisT
    * Place List Category
    * Restaurants
    * Activities
    * Sites (Tourist – Sports)
    * Entertainment
    * Add Place
  *APP.POST
    * User LOGIN
    * User Info from form
    * Place info from form
