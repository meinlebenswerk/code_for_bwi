
## BWI Load-Challenge Solver
Simple NodeJs based solution for the [BWI Code-Challenge](https://www.get-in-it.de/coding-challenge?utm_source=magazin&utm_campaign=coding-challenge&utm_content=code-and-win).

#### Prerequisites
The script depends on [console-grid](https://github.com/cenfun/console-grid) by cenfun for pretty-printing it's output. All the dependencies can be installed by running `npm i`. 

#### Setup
Information about items lives in `inputs.csv`, and information about the transports, their names, capacity and driver information is set in `config.json`.

#### Running
Once everything is set up, simply run `node solve.js`, this will read in all the information from the files and print the shipping information to the console.

### Algorithm
The algortihm used is a simple greedy search, based on usefullness, where a transport will be filled up with the most useful items, in descending order, or whatever fits.

