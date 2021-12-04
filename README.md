# Cloc-web

This is a web version of [cloc]() (count lines of code).

The objective of this project is to implement a simple CLOC application using WebWorkers to
keep the UI interactive and the new [WebFileSystemAPI](TODO).

## Notes

This project doesn't aim to be a [cloc]() replacement. That software is GREAT and I just
want to create a simple web version of it by using [Web Worker]().  
If you are searching for a precide cloc go with the original software or newer ones:

- original TODO
- new1 TODO
- new2 TODO

## Benchmarks

The first version was a "sequential" count inside a web worker.  
On my machine, to count the [vuetify repo]() (not a huge project, but neither small)
it takes around **8598.8999** ms for a total of **6859** counted files and **850362** lines of code.  
Everything is done inside a web worker so even if the count is taking a long time, the
user interface remains interactive and snappy.

The second version was a little different. The main thread sends the dirHandle to one "main" thread, this thread
cycle trhough all the directories and files, for each files it read it's content and send it to a new Worker. This
new worker just count the number of lines and return the results to the "main worker". This worker then put all
the reults together.  
This version was a complete failure (as expected). With vuetify on my machine it wasn't even able to finish the work.
Devtools were crushing (probably too many workers were spawned (1 per file) and I think there was more overhead) to
send all the file contents to the "counter workers".

## Setup

Make sure to install the dependencies

```bash
yarn install
```

## Development

Start the development server on http://localhost:3000

```bash
yarn dev
```

## Production

Build the application for production:

```bash
yarn build
```
