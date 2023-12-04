# Project Name: Grimoire

## Project URL

https://grimoire-tt.space/

## Project Video URL 

**Task:** https://youtu.be/kwL7_UWjUUA

## Project Description

 Grimoire is a website that is meant as a hub for all things related to playing a specific type of board game called a roleplaying game.
 While we do not implement the games ourselves, the space allows players who are interested in playing the same game to announce their ability to
 host a game, and players interested in playing that game to find games close to them or in a time zone which is easy for them to connect to. Users
 can create a group and designate their preference for what game they want to play, what playstyle they prefer, and the location they want to play
 the game at (can either be their current location or a manually inputted address or a remote game). Grimoire also provides an online version of a character sheet, 
 an important aspect of these games, which tracks your character's status throughout a game. A character can be created for a game, allowing the user
 to modify certain aspects of their character like their name, background, and starting benefits, as well as modify their gameplay mechanics like their
 proficiency in different attributes. A user can have multiple character sheets (since a user can be in many games at once) and can scroll through them
 to see which character sheet they want to use depending on which game they are in. A character sheet is a GUI which allows the user to view their character's
 current status and also change certain aspects of their current status (like what items/weapons they are carrying or their character's ambition for the game).
 A character sheet also provides a QR code, which allows the owner of a character sheet to share their current character, with their current status, to any
 player they want via the QR code or through a link they can share. 

## Development

 The app was built with the frontend functionality and style being performed with React with specific components and theming provided by
 MaterialUI. The logic was mainly performed with JavaScript, with HTTP requests and responses being performed as taught in lecture. All data was 
 stored on MongoDB, with the specific schemas for each database element being designed within a .schemas file for that specific element. The app.mjs main 
 backend is a reverse proxy for the other routes, being served within their own seperate modules, defined on the backend. (A specific module will have
 a schemas, router, and optional helper functions defined in another file) On the frontend, each page has their own directory, and inside each directory are the
 functions with the main page, and any helper functions required for that page's functionality. This is including the NavBar, which does not have a specific page,
 and is displayed on all pages.

 Regarding 3rd Party APIs, we used Amazon Web Services for email validation, the document navigator for finding the coordinates of the user, Google Maps API to perform 
 the following: turn the coordinates into a location and presenting it to the user on a map on the website with information on country, local area, and province/state,
 map a location name to a coordinate.

## Deployment

**Task:** 
We first set up a virtual machine to run the server side of our website. After doing that, we ssh connected to the machine, and built the dockerfiles 
as specified in the frontend and backend docker files in the script. After waiting for the docker to finish building the files, we disassembled all previous 
docker composes and removed and dangling images from that docker compose. Upon checking that the docker logs had no errors, we tested to see if the website 
was deployed.

## Challenges

# What is the top 3 most challenging things that you have learned/developed for you app? Please restrict your answer to only three items. 

1. Google Maps Geolocator. While the Google Maps calls in the code on the frontend are fairly straightforward, the documentation involved with 
implementing the geocoding and reverse geocoding in React is less than adequate. The research involved with implementing the Google Maps GUI on the
frontend was uniquely challenging. Also, using that information to track radius to local groups and find the closest address to a certain coordinate
were challenging to research and implement, due to the complexity and error checking and bug checking involved in cases of poor location information.


2. Integration of 3rd Party APIs. This project taught us the importance of reading documentation, however the documentation for certain desired APIs
 provided was sometimes insubstantial and many times outdated. This forced our hand to perform a substantial amount of research and trial and error 
 to try to understand the root cause of the problem and how we can fix the implementation. 
 (As in the MaterialUI Google Maps Component and Amazon Web Services Email library) 
  In some cases, we had to scrap our implementation of certain APIs due to the library being bugged beyond hope for repair. (3D Dice roller) 
  Overall, researching, guessing and checking, implementing, and debugging 3rd Party Components proved to be the most challenging educational experiences 
  of the project.


3. MaterialUI. To implement some of the nicer looking features on the frontend such as a loading screen, buttons with onHover/click animations, 
easier collection of elements and drop down menus, we used the components library provided by MaterialUI to implement all of these functions. However,
 as a team of new frontend developers, there was a steep learning curve to learn how to maximize the potential of MaterialUI, including using drop down menus 
 on button clicks, theming the entire app to have certain default values and styling the MaterialUI components using the ThemeProvider library and styleOverrides. 
 Forcing ourselves to use this library was difficult, however in the end a better looking, more functional website came from it, and we learned a lot from the mistakes
  we made along the way.

## Contributions

# Describe the contribution of each team member to the project. Please provide the full name of each team member (but no student number). 

Casper Sajewski-Lee:
 Frontend Menu Screen
 Frontend Navigation and Routing
 Frontend Sign Up, Log In, and Validation Code Design and Implementation
 Frontend Create Groups Page Design, Implementation, and Logic
 Frontend Character Sheet Home Page
 Frontend Individual Character Sheet View, Logic, and Implementation

Justin Wang:
 Backend Groups Routes
 Backend Groups Schema
 Backend Chat Routes
 Frontend Looking For Group
 Frontend Live Chat

Kyle Lewis:
 Backend Death in Space Character Routes
 Backend Death in Space Database Character Schema
 Backend MonsterHearts Character Routes 
 Backend MonsterHearts Database Character Schema
 General Game Database Schema
 Backend General Character Sheets Schema
 Backend User Database Schema
 Backend Signup/Login
 Backend Amazon Web Services Email Validation
 Backend Google Maps API Geocoding and Reverse Geocoding
 Frontend Character Creation Page
 Frontend Page Not Found
 Deployment (Domain Name, Certificate Finding, and VM creation)

# One more thing? 

**Task:** Amazon Web Services is not allowing us to move off of Sandbox Mode, so if there
 are issues signing in, please email Kyle's utoronto email account so he can add you to the whitelist
 of emails should that be an issue.
