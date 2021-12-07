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

Consider that all the results here are taken on my machine and they sure are not perfect nor precise
by any means, I just took these numbers to compare different solutions and use the one that
looked most efficient (at least on my machine)

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

The third version is different: we create a pool of workers (tried with different numbers), every file we find we 
send the fsHandle to a worker and when it respond we get the results and set the workers as "free".
The first approach I tried was to associate a promise to each worker and resolving when he respond. The pool of worker
has a method "getFreeWorker" that waits for any promise to be fullfilled and return the associated worker.
Probably I got something wrong but this was getting me shit results:
TODO: with 8 workers
  Successfully CLOC project. Took 28764.80000001192 milliseconds.
  Counted a total of 6859 files.
  Counted a total of 850362 lines of code

TODO: with 15 workers
  Successfully CLOC project. Took 39236.19999998808 milliseconds.
  Counted a total of 6859 files.
  Counted a total of 850362 lines of code

Looks like incrementing the amount of workers actually degrades the performance. This may be an alogorithmic fault (I'm bad).

So I tried to improve this version with a "polling mechanism" to get the free worker. With this simple improvement the
results got down a lot (so either I did some mistake in the previous version or the approach was totally garbage)
  - with 8 workers:  3993
  - with 15 workers: 3056
  - with 25 workers: 3484

The fourth (and last) version works like this:
- spawn a worker that is responsible to iterate through the file system. For each file that he find, increment the
number of workers to wait and send the filehandle to a new/free worker.
When a worker ends its job it sends the data to the first worker. To check when the job is done he just increase a counter
every time he find a new file to count, and increase another counter when a worker returns the results. When both are equal
we're done (the first count has a bit of delay because otherwise workers respond so fast that the program is finished just after the start -> we increment to one the files to count and send the data to the worker and he respond before the first thread set the counter
to 2 so the program thinks he's done).
TODO: 
  - with 8 workers:  4505
  - with 15 workers: 4187
  - with 25 workers: 4163

I was expecting this solution to be faster compared to the poller one, but maybe there is a motivation. In this fourth solution we are
sending the first file to the first worker, the second to the second, and (if we have 8 workers) the ninth to the first worker again
(we are using round robin like), so there is a possibility that one worker gets all the heaviest files of the project and he may
be a bottleneck.  
I'm not convinced though.

Looks like the third one using a polling algorithm is the fastest so I'll be using that in the application.  
Anyway even if these numbers are taken on my machine, I'm very happy to see that the solutions that uses multiple workers
are a lot faster compared to the ones that uses only one worker or even worse the one that runs in the main thread
(and that freeze the UI).

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
