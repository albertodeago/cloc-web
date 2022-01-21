# Cloc-web

This is a (simple) web version of [CLOC](https://en.wikipedia.org/wiki/Source_lines_of_code) (count lines of code).

The objective of this project is to implement a simple CLOC application using
WebWorkers to keep the UI interactive and the new
[WebFileSystemAPI](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
to let the user select the project from the local file-system.

## Notes

This project doesn't aim to be a [cloc](https://github.com/AlDanial/cloc) replacement.
That software is GREAT and I just want to create a simple web version of it by
using Web Workers.  
If you are searching for a precise cloc implementation go with the original software
or newer ones:

- [original](https://github.com/AlDanial/cloc)
- [new made in Rust](https://github.com/XAMPPRocky/tokei)
- [new made in Go](https://github.com/boyter/scc)

## Benchmarks / History

Consider that all the results here are taken on my machine and they sure are not
perfect nor precise by any means, I just took these numbers to compare different
solutions and use the one that looked most efficient (at least on my machine).

I implemented different versions of this and compared them to see what seems to
be the best approach.  
I also wanted to use workers inside workers (similar to an
[actor model](https://en.wikipedia.org/wiki/Actor_model)) to see if I was able
to gain performance boosts by leveraging more than one web worker.

The repository I was testing agains is the [vuetify monorepo](https://github.com/vuetifyjs/vuetify).
It's not a huge project, but neither small. In my testing it appears to have
**6859** files for a total of **850362** lines of code (I'm not counting
some files and folders, e.g. I'm ignoring node_modules).

The first version was a "sequential" count inside a web worker.  
On my machine, it takes around **8598**ms.  
Everything is done inside a web worker so even if the count is taking a long time
(counting files one by one), the user interface remains interactive and snappy.

The second version was a little different. I found that the [File system directory handle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle) of
the new APIs **is serializable** (also the File Handle), this is super cool because
I'm able to send this reference between workers.
So the main thread sends the
[dirHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle)
to one "main" web worker, this one cycle through all the directories and files,
for each file it read its content and send it to a new Worker. This new worker
just count the number of lines and return the results to the "main worker".
This worker then put all the reults together.  
This version was a complete failure (as expected). With vuetify on my machine it wasn't even able to finish the work.
Devtools were crushing (we're spawning too many workers -> 1 per file).
I also think there was more overhead to send all the file contents to the
"counter workers".

Third version: we create a pool of workers (tried with different numbers),
The main worker for every file he finds he sends the fsHandle to another worker
(picked from the pool) and when it respond we get the results and set the
workers as "free".  
The first approach I tried was to associate a promise to each worker and resolving
when he respond. The pool of worker has a method `getFreeWorker` that waits for
any promise to be fullfilled and return the associated worker.  
Probably I got something wrong but this was getting me shitty results:

- with 8 workers: **28764**ms.
- with 15 workers: **39236**ms.

Looks like incrementing the amount of workers actually degrades the performance.
This may be an alogorithmic fault (I'm bad).

So I tried to improve this version with a "polling mechanism" to get the free worker.
I wasn't expecting this to actually improve anything, but instead the time got down by
a lot (so either I did some mistakes in the previous version or the approach was
totally garbage).

- with 8 workers: **3993**ms
- with 15 workers: **3056**ms
- with 25 workers: **3484**ms

Increasing the number of workers doesn't seem to affect in any way.

The fourth (and last) version works like this:
Spawn the main worker that is responsible to iterate through the file system.
For each file that he find, increment the number of workers to wait and send
the filehandle to a new/free worker.
When a worker ends its job it sends the data to the first worker.
To check when the job is done the main worker just increase a counter every
time he find a new file to count, and increase another counter when a worker
returns the results.
When both are equal we're done (the first count has a bit of delay because
otherwise workers respond so fast that the program is finished just after
the start (we increment to one the files to count and send the data to the
worker and he respond before the first thread set the counter to 2 so the
program thinks he's done)).
Results:

- with 8 workers: **4505**ms
- with 15 workers: **4187**ms
- with 25 workers: **4163**ms

I was expecting this solution to be faster compared to the poller one, but maybe
there is a motivation. In this fourth solution we are sending the first file to
the first worker, the second to the second, and (if we have 8 workers) the ninth
to the first worker again (we are using round robin), so there is a possibility
that one worker gets all the heaviest files of the project and he may be a
bottleneck.  
I'm not sure though.

Looks like the third one using a polling algorithm is the fastest so I'll be
using that in the application.  
Anyway even if these numbers are taken on my machine, I'm very happy to see
that the solutions that uses multiple workers are a lot faster compared to the
ones that uses only one worker or even worse the one that runs in the main thread
(that also risk of freezing the UI).

## Setup

Make sure to install the dependencies

```bash
npm install
```

## Development

Start the development server on http://localhost:3000

```bash
npm run dev
```

This will open the netlify dev entironment. To do so you need to login with the netlify cli

```bash
netlify login
```

## Production

Build the application for production:

```bash
npm run build
```

## Deploy

The project is automatically deployed in Netlify when a push occurs in the main branch.

The project uses also FaunaDB, so you will need to create an account and set the
entironment variables for the netlify functions in the Netlify project dashboard.

A sample of variable needed is:

```
FAUNADB_SECRET=<your_secret>
FAUNADB_DOMAIN=<funadb_domain>
FAUNADB_DOCUMENT_ID=<ref_id_to_prod_document> # you need to manually create in the dashboard
FAUNADB_DEV_DOCUMENT_ID=<ref_id_to_dev_document> # you need to manually create in the dashboard
```

## Credits

- Thanks to [Tiago Franco for the amazing clock loader](https://codepen.io/tiagofranco/pen/mKeyt)
