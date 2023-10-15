# CSCC09 Course Project - Project Proposal

- Project Title
    - Grimoire

- Team Members
    - Casper Sajewski-Lee, Justin Wang, Kyle Lewis


- Web Application Description
    - Our web application will be a virtual toolset intended for tabletop roleplaying games (ttrpgs).  It will include the ability to create and manage characters across multiple different games, and the ability to look for games among other uses.  It's is essentially our own version of [demiplane](https://app.demiplane.com/home)


- Beta Features
    - For our Beta, we want to get at least one set of character sheets done, ie the ability to create and manage sheets for at least one game
    - we also want to have our looking-for-game functionality completed for the beta


- Final Features
    - For our final features we want to expand to at least 3 different games managed on our platform
    - we want to implement a faux subscription service to experiment with financial APIs; with subscribers getting profile customization as well as special tags when looking for a game
    - We want to integrate some map functionality in order to suggest local stores that might hold physical copies of the tabletop rulebooks
    - If time allows we'd also like to add a respository for game rules and potentially a virtual desktop (literal desktop) where you can set up your charactersheets and rules however, it is more than likely this is out of scope.


- Tech Stack
    - We want to focus on using the MERN tech stack for our development
    - In terms of deployment, we are thinking of using aws and also want to use some software such as jenkins and github actions to try and set up a CICD pipeline


- Predicted Technical Difficulties
    - Figuring out how to best configure our CICD pipeline
    - Integrating 3rd party services such as aws and their APIs
    - Ensuring responsiveness for smaller screen sizes
    - Effectivley creating a framework to manage character sheets since games can vary wildly
    - Handling the logic behind looking for games such as search criteria and creating groups themselves.
